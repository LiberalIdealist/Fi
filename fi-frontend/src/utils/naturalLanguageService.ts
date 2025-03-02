import { LanguageServiceClient, protos } from '@google-cloud/language';

// Add these type definitions at the top of the file
interface FinancialEntity {
  name: string;
  value?: string | number;
  salience?: number;
  metadata?: Record<string, string>;
}

interface FinancialEntities {
  monetaryAmounts: Array<FinancialEntity>;
  organizations: string[];
  dates: string[];
  locations: string[];
  people: string[];
  numbers: Array<{name: string; value: string | number}>;
  other: Array<{name: string; type: string; salience: number}>;
}

interface DocumentAnalysisResult {
  sentiment?: {score: number; magnitude: number};
  categories: Array<{name: string; confidence: number}>;
  entities: FinancialEntities;
  structuredData: any;
}

interface ProfileData {
  financialMetrics: {
    income: number;
    savings: number;
    savingsRatio: number;
    dependents: number;
    age?: number;
  };
  riskProfile: {
    score: number;
    category: string;
  };
  financialGoals: string[];
  insights: any[];
}

// Add this before the function
interface QuestionnaireAnalysisResult {
  financialMetrics: {
    income: number;
    savings: number;
    savingsRatio: number;
    dependents: number;
    age: number;
  };
  riskProfile: {
    score: number;
    category: string;
  };
  financialGoals: string[];
  insights: Array<{type: string; category: string; message: string}>;
}

// Update the client initialization code
let languageClient: LanguageServiceClient | null = null;
if (typeof window === 'undefined') {
  try {
    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH;
    if (!keyFilename) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_PATH environment variable is not set');
    }

    // On server side, use environment variable
    languageClient = new LanguageServiceClient({
      keyFilename
    });
  } catch (error) {
    console.error('Failed to initialize Language Service Client:', error);
  }
}

/**
 * Analyze documents and questionnaire data using Google Cloud Natural Language
 */
export async function analyzeFinancialData(options: {
  documentIds?: string[];
  questionnaireData?: Record<string, any>;
  followUpData?: Record<string, any>;
}) {
  if (typeof window !== 'undefined') {
    // Client-side: call the API endpoint
    const response = await fetch('/api/analyze-financial-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Analysis failed: ${response.status}`);
    }
    
    return await response.json();
  }
  
  // Server-side implementation would go here
  throw new Error('Server-side implementation should use the API route');
}

/**
 * Server-side only: Perform NL analysis on text content
 */
export async function analyzePdfContent(textContent: string, documentType: string) {
  if (!languageClient) {
    throw new Error('Language Service Client not initialized');
  }

  const document: protos.google.cloud.language.v1.IDocument = {
    content: textContent,
    type: 'PLAIN_TEXT',
  };

  const [result] = await languageClient.analyzeEntities({ document });
  return result;
}

// Helper functions to structure specific document types
function analyzeBankStatement(text: string, entities: any) {
  // Extract balance information
  const balanceInfo: Record<string, number | null> = {
    openingBalance: null,
    closingBalance: null,
    averageBalance: null
  };
  
  // Balance extraction patterns
  const openingMatch = text.match(/opening\s+balance\s*:?\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i);
  if (openingMatch) {
    balanceInfo.openingBalance = parseFloat(openingMatch[1].replace(/,/g, ''));
  }
  
  const closingMatch = text.match(/closing\s+balance\s*:?\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i);
  if (closingMatch) {
    balanceInfo.closingBalance = parseFloat(closingMatch[1].replace(/,/g, ''));
  }
  
  const avgMatch = text.match(/average\s+balance\s*:?\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i);
  if (avgMatch) {
    balanceInfo.averageBalance = parseFloat(avgMatch[1].replace(/,/g, ''));
  }
  
  // Transaction patterns
  const transactions: any[] = [];
  const txnPattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+([^0-9\n]{5,}?)\s+(CR|DR)?\s*((?:INR|Rs\.?)?\s*[\d,]+\.?\d*)/gi;
  
  let match;
  while ((match = txnPattern.exec(text)) !== null) {
    const date = match[1];
    const description = match[2].trim();
    const type = match[3] === 'CR' ? 'credit' : 'debit';
    const amountStr = match[4].replace(/[^\d.]/g, '');
    const amount = parseFloat(amountStr);
    
    if (!isNaN(amount)) {
      transactions.push({ date, description, type, amount });
    }
  }
  
  // Calculate financial indicators
  let totalIncome = 0;
  let totalExpense = 0;
  
  transactions.forEach(txn => {
    if (txn.type === 'credit') {
      totalIncome += txn.amount;
    } else {
      totalExpense += txn.amount;
    }
  });
  
  return {
    balanceInfo,
    transactions,
    summary: {
      totalIncome,
      totalExpense,
      netCashFlow: totalIncome - totalExpense,
      transactionCount: transactions.length
    }
  };
}

function analyzeCreditStatement(text: string, entities: any) {
  // Implementation for credit card statements
  // Similar to bank statements but with specific fields
  const summaryInfo: Record<string, number | null> = {
    totalDue: null,
    minimumDue: null,
    creditLimit: null,
    availableCredit: null
  };
  
  // Extract summary information
  const totalDueMatch = text.match(/total\s+(?:amount\s+)?due\s*:?\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i);
  if (totalDueMatch) {
    summaryInfo.totalDue = parseFloat(totalDueMatch[1].replace(/,/g, ''));
  }
  
  const minDueMatch = text.match(/minimum\s+(?:amount\s+)?due\s*:?\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i);
  if (minDueMatch) {
    summaryInfo.minimumDue = parseFloat(minDueMatch[1].replace(/,/g, ''));
  }
  
  const limitMatch = text.match(/credit\s+limit\s*:?\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i);
  if (limitMatch) {
    summaryInfo.creditLimit = parseFloat(limitMatch[1].replace(/,/g, ''));
  }
  
  const availableMatch = text.match(/available\s+credit\s*:?\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i);
  if (availableMatch) {
    summaryInfo.availableCredit = parseFloat(availableMatch[1].replace(/,/g, ''));
  }
  
  // Extract transactions
  const transactions: any[] = [];
  const txnPattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+([^0-9\n]{5,}?)\s+((?:INR|Rs\.?)?\s*[\d,]+\.?\d*)/gi;
  
  let match;
  while ((match = txnPattern.exec(text)) !== null) {
    const date = match[1];
    const description = match[2].trim();
    const amountStr = match[3].replace(/[^\d.]/g, '');
    const amount = parseFloat(amountStr);
    
    if (!isNaN(amount)) {
      transactions.push({ date, description, amount });
    }
  }
  
  // Categorize spending
  const categories: Record<string, number> = {};
  
  const categoryPatterns: Record<string, RegExp> = {
    'Food & Dining': /restaurant|cafe|food|dinner|lunch|breakfast|pizza|burger|grocery|supermarket/i,
    'Shopping': /shopping|mall|store|retail|purchase|buy|amazon|flipkart/i,
    'Transportation': /uber|ola|taxi|cab|auto|metro|bus|train|petrol|diesel|fuel/i,
    'Bills & Utilities': /electricity|power|water|gas|internet|wifi|broadband|mobile|phone|bill payment|recharge/i,
    'Entertainment': /movie|cinema|theatre|netflix|amazon prime|hotstar|subscription|entertainment/i,
    'Health & Wellness': /medical|hospital|doctor|pharmacy|medicine|fitness|gym|healthcare/i,
    'Travel': /hotel|flight|airline|booking|travel|trip|vacation|holiday|tour|airbnb/i
  };
  
  transactions.forEach(txn => {
    let categorized = false;
    
    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(txn.description.toLowerCase())) {
        categories[category] = (categories[category] || 0) + txn.amount;
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categories['Other'] = (categories['Other'] || 0) + txn.amount;
    }
  });
  
  return {
    summaryInfo,
    transactions,
    categories,
    totalSpend: transactions.reduce((sum, txn) => sum + txn.amount, 0)
  };
}

function analyzeDematStatement(text: string, entities: any) {
  // Implementation for demat account statements
  const portfolioInfo: Record<string, number | null> = {
    totalValue: null,
    investedValue: null
  };
  
  // Extract portfolio information
  const totalValueMatch = text.match(/(?:total|current)\s+value\s*:?\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i);
  if (totalValueMatch) {
    portfolioInfo.totalValue = parseFloat(totalValueMatch[1].replace(/,/g, ''));
  }
  
  const investedMatch = text.match(/(?:total|invested)\s+cost\s*:?\s*(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/i);
  if (investedMatch) {
    portfolioInfo.investedValue = parseFloat(investedMatch[1].replace(/,/g, ''));
  }
  
  // Extract holdings
  const holdings: any[] = [];
  const holdingPattern = /([A-Za-z0-9\s.&-]+)\s+(\d+)\s+(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)\s+(?:INR|Rs\.?)?\s*([\d,]+\.?\d*)/g;
  
  let match;
  while ((match = holdingPattern.exec(text)) !== null) {
    const security = match[1].trim();
    const quantity = parseInt(match[2], 10);
    const costPrice = parseFloat(match[3].replace(/,/g, ''));
    const marketValue = parseFloat(match[4].replace(/,/g, ''));
    
    if (!isNaN(quantity) && !isNaN(costPrice) && !isNaN(marketValue)) {
      holdings.push({
        security,
        quantity,
        costPrice,
        marketValue,
        gain: marketValue - costPrice,
        gainPercentage: ((marketValue / costPrice - 1) * 100).toFixed(2)
      });
    }
  }
  
  // Calculate asset allocation
  const assetAllocation: Record<string, number> = {};
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  
  if (totalValue > 0) {
    const stockTypes: Record<string, RegExp> = {
      'Large Cap': /ltd\.?$|limited$|(?:hdfc|tata|reliance|infosys|tcs|hul|itc)/i,
      'Mid Cap': /(?:mid|(?<!hindustan\s)unilever|dabur|godrej|havells)/i,
      'Small Cap': /(?:small|(?:industries|enterprises|solutions)$)/i,
      'ETFs': /etf|exchange traded fund|nifty bees|bank bees/i,
      'Mutual Funds': /mutual fund|mf|(?:growth|dividend) plan|folio/i
    };
    
    holdings.forEach(holding => {
      let categorized = false;
      
      for (const [type, pattern] of Object.entries(stockTypes)) {
        if (pattern.test(holding.security.toLowerCase())) {
          assetAllocation[type] = (assetAllocation[type] || 0) + holding.marketValue;
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        assetAllocation['Other'] = (assetAllocation['Other'] || 0) + holding.marketValue;
      }
    });
    
    // Convert to percentages
    for (const type in assetAllocation) {
      assetAllocation[type] = +(assetAllocation[type] / totalValue * 100).toFixed(2);
    }
  }
  
  return {
    portfolioInfo,
    holdings,
    assetAllocation,
    holdingsCount: holdings.length,
    performance: portfolioInfo.totalValue && portfolioInfo.investedValue
      ? ((portfolioInfo.totalValue / portfolioInfo.investedValue - 1) * 100).toFixed(2) + '%'
      : 'Unknown'
  };
}

/**
 * Analyze questionnaire and follow-up responses
 */
export function analyzeQuestionnaireData(questionnaire?: Record<string, any>, followUp?: Record<string, any>): QuestionnaireAnalysisResult {
  if (!questionnaire) {
    return {
      financialMetrics: {
        income: 0,
        savings: 0,
        savingsRatio: 0,
        dependents: 0,
        age: 0
      },
      riskProfile: {
        score: 0,
        category: ''
      },
      financialGoals: [],
      insights: []
    };
  }
  
  // Extract financial profile attributes
  const income = parseFloat(String(questionnaire.monthlyIncome || '0').replace(/[^\d.]/g, ''));
  const savings = parseFloat(String(questionnaire.monthlySavings || '0').replace(/[^\d.]/g, ''));
  const age = parseInt(String(questionnaire.age || '30'), 10);
  const dependents = parseInt(String(questionnaire.dependents || '0'), 10);
  const riskTolerance = questionnaire.riskTolerance || 'moderate';
  const investmentGoals = Array.isArray(questionnaire.investmentGoals) ? questionnaire.investmentGoals : [];
  const investmentHorizon = questionnaire.investmentHorizon || 'medium';
  
  // Calculate savings ratio
  const savingsRatio = income > 0 ? (savings / income) * 100 : 0;
  
  // Determine risk profile based on questionnaire answers
  let riskScore = 5; // Default moderate
  
  // Adjust for age
  if (age < 30) riskScore += 1;
  else if (age > 50) riskScore -= 1;
  
  // Adjust for dependents
  if (dependents > 2) riskScore -= 1;
  
  // Adjust for stated risk tolerance
  if (riskTolerance === 'aggressive') riskScore += 2;
  else if (riskTolerance === 'conservative') riskScore -= 2;
  
  // Adjust for investment horizon
  if (investmentHorizon === 'long') riskScore += 1;
  else if (investmentHorizon === 'short') riskScore -= 1;
  
  // Cap risk score between 1-10
  riskScore = Math.max(1, Math.min(10, riskScore));
  
  // Map financial goals to structured categories
  const mappedGoals = investmentGoals.map(goal => {
    const goalCategories: Record<string, string> = {
      'retirement': 'Retirement Planning',
      'education': 'Education Funding',
      'home': 'Home Purchase',
      'emergency': 'Emergency Fund',
      'wealth': 'Wealth Building',
      'tax': 'Tax Optimization'
    };
    
    return goalCategories[goal.toLowerCase()] || goal;
  });
  
  // Generate financial insights
  const insights = [];
  
  if (savingsRatio < 20) {
    insights.push({
      type: 'warning',
      category: 'savings',
      message: 'Your savings rate is lower than recommended. Consider increasing monthly savings to at least 20% of income.'
    });
  } else if (savingsRatio >= 30) {
    insights.push({
      type: 'positive',
      category: 'savings',
      message: 'Great job! Your savings rate is excellent.'
    });
  }
  
  // Add follow-up specific insights if available
  if (followUp) {
    // Extract key data points from follow-up answers
    const followUpText = Object.values(followUp).join(' ');
    
    // Check for retirement planning mentions
    if (/retire|retirement|pension/i.test(followUpText)) {
      insights.push({
        type: 'information',
        category: 'retirement',
        message: 'Based on your follow-up answers, retirement planning appears to be important to you.'
      });
    }
    
    // Check for debt concerns
    if (/debt|loan|emi|credit card/i.test(followUpText)) {
      insights.push({
        type: 'warning',
        category: 'debt',
        message: 'Your responses indicate concerns about debt. Consider prioritizing debt reduction.'
      });
    }
  }
  
  return {
    financialMetrics: {
      income,
      savings,
      savingsRatio,
      dependents,
      age
    },
    riskProfile: {
      score: riskScore,
      category: riskScore >= 8 ? 'Aggressive' : 
               riskScore >= 6 ? 'Moderately Aggressive' :
               riskScore >= 4 ? 'Moderate' :
               riskScore >= 2 ? 'Moderately Conservative' : 'Conservative'
    },
    financialGoals: mappedGoals,
    insights
  };
}

/**
 * Combine document analysis with questionnaire data for comprehensive profile
 */
export function generateFinancialProfile(
  documentAnalysis: Record<string, any>[],
  questionnaireData?: Record<string, any>,
  followUpData?: Record<string, any>
) {
  // Analyze questionnaire data
  const profileData = analyzeQuestionnaireData(questionnaireData, followUpData);
  
  // Extract key metrics from documents
  const metrics: Record<string, any> = {
    totalAssets: 0,
    totalLiabilities: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    investmentAllocation: {},
    spendingCategories: {},
    accountSummaries: []
  };
  
  // Process all document analysis results
  documentAnalysis.forEach(analysis => {
    const docType = analysis.documentType || 'unknown';
    const structuredData = analysis.structuredData || {};
    
    if (docType === 'bank') {
      // Add account summary
      if (structuredData.balanceInfo) {
        metrics.accountSummaries.push({
          type: 'bank',
          balance: structuredData.balanceInfo.closingBalance,
          transactions: structuredData.transactions?.length || 0
        });
        
        // Update assets
        if (structuredData.balanceInfo.closingBalance) {
          metrics.totalAssets += structuredData.balanceInfo.closingBalance;
        }
        
        // Estimate income if missing from questionnaire
        if (structuredData.summary?.totalIncome && (!questionnaireData?.monthlyIncome || questionnaireData.monthlyIncome === '')) {
          metrics.monthlyIncome = Math.max(metrics.monthlyIncome, structuredData.summary.totalIncome / 3); // Assuming 3 months of data
        }
        
        // Estimate expenses
        if (structuredData.summary?.totalExpense) {
          metrics.monthlyExpenses += structuredData.summary.totalExpense / 3; // Assuming 3 months of data
        }
      }
    } 
    else if (docType === 'credit') {
      // Add credit summary
      if (structuredData.summaryInfo) {
        metrics.accountSummaries.push({
          type: 'credit',
          due: structuredData.summaryInfo.totalDue,
          limit: structuredData.summaryInfo.creditLimit
        });
        
        // Update liabilities
        if (structuredData.summaryInfo.totalDue) {
          metrics.totalLiabilities += structuredData.summaryInfo.totalDue;
        }
      }
      
      // Merge spending categories
      if (structuredData.categories) {
        Object.entries(structuredData.categories).forEach(([category, amount]) => {
          metrics.spendingCategories[category] = (metrics.spendingCategories[category] || 0) + (amount as number);
        });
      }
    } 
    else if (docType === 'demat') {
      // Add investment summary
      if (structuredData.portfolioInfo) {
        metrics.accountSummaries.push({
          type: 'investment',
          value: structuredData.portfolioInfo.totalValue,
          invested: structuredData.portfolioInfo.investedValue,
          holdings: structuredData.holdingsCount || 0
        });
        
        // Update assets
        if (structuredData.portfolioInfo.totalValue) {
          metrics.totalAssets += structuredData.portfolioInfo.totalValue;
        }
      }
      
      // Merge asset allocation
      if (structuredData.assetAllocation) {
        Object.entries(structuredData.assetAllocation).forEach(([assetType, percentage]) => {
          metrics.investmentAllocation[assetType] = (metrics.investmentAllocation[assetType] || 0) + (percentage as number);
        });
      }
    }
  });
  
  // Normalize investment allocation percentages
  if (Object.keys(metrics.investmentAllocation).length > 0) {
    const total = Object.values(metrics.investmentAllocation).reduce((sum: number, val: unknown) => {
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
    if (total > 0) {
      Object.keys(metrics.investmentAllocation).forEach(key => {
        metrics.investmentAllocation[key] = +(metrics.investmentAllocation[key] / total * 100).toFixed(2);
      });
    }
  }
  
  // Calculate net worth
  metrics.netWorth = metrics.totalAssets - metrics.totalLiabilities;
  
  // Generate additional insights based on combined data
  const insights = [...profileData.insights];
  
  // Debt-to-income ratio insight
  if (metrics.monthlyIncome > 0 && metrics.totalLiabilities > 0) {
    const debtToIncomeRatio = (metrics.totalLiabilities / (metrics.monthlyIncome * 12)) * 100;
    
    if (debtToIncomeRatio > 40) {
      insights.push({
        type: 'warning',
        category: 'debt',
        message: `Your debt-to-annual-income ratio is ${debtToIncomeRatio.toFixed(1)}%, which is higher than recommended.`
      });
    }
  }
  
  // Investment diversification insight
  if (metrics.investmentAllocation && Object.keys(metrics.investmentAllocation).length > 0) {
    const topAllocation = Object.entries(metrics.investmentAllocation)
      .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    
    if (topAllocation && (topAllocation[1] as number) > 60) {
      insights.push({
        type: 'warning',
        category: 'investment',
        message: `Your portfolio has ${topAllocation[1]}% allocation to ${topAllocation[0]}, which may indicate insufficient diversification.`
      });
    }
  }
  
  return {
    personalProfile: {
      age: profileData?.financialMetrics?.age || undefined,
      dependents: profileData?.financialMetrics?.dependents || 0,
      riskProfile: profileData?.riskProfile || { score: 5, category: 'Moderate' },
      financialGoals: profileData?.financialGoals || []
    },
    financialMetrics: {
      ...metrics,
      income: Math.max(metrics.monthlyIncome, profileData?.financialMetrics?.income || 0),
      savings: profileData.financialMetrics.savings || metrics.monthlyIncome - metrics.monthlyExpenses,
      savingsRatio: profileData.financialMetrics.savingsRatio || 
        (metrics.monthlyIncome > 0 ? ((metrics.monthlyIncome - metrics.monthlyExpenses) / metrics.monthlyIncome) * 100 : 0)
    },
    insights,
    recommendations: generateRecommendations(profileData, metrics)
  };
}

/**
 * Generate personalized recommendations based on financial profile
 */
function generateRecommendations(profileData: any, metrics: Record<string, any>) {
  const recommendations = [];
  const riskScore = profileData.riskProfile?.score || 5;
  
  // Savings recommendations
  if (metrics.savingsRatio < 15) {
    recommendations.push({
      category: 'Savings',
      title: 'Increase your savings rate',
      description: 'Aim to save at least 20% of your monthly income.',
      priority: 'High'
    });
  }
  
  // Investment recommendations based on risk profile
  if (riskScore >= 7) {
    recommendations.push({
      category: 'Investment',
      title: 'Growth-oriented portfolio',
      description: 'Given your high risk tolerance, consider a portfolio with 70-80% equity allocation.',
      priority: 'Medium'
    });
  } else if (riskScore >= 4) {
    recommendations.push({
      category: 'Investment',
      title: 'Balanced portfolio',
      description: 'Consider a balanced approach with 50-60% in equity and the rest in debt instruments.',
      priority: 'Medium'
    });
  } else {
    recommendations.push({
      category: 'Investment',
      title: 'Conservative portfolio',
      description: 'Consider a safety-oriented portfolio with 30-40% in equity and the rest in fixed income.',
      priority: 'Medium'
    });
  }
  
  // Debt recommendations
  if (metrics.totalLiabilities > metrics.monthlyIncome * 6) {
    recommendations.push({
      category: 'Debt',
      title: 'Debt reduction plan',
      description: 'Prioritize paying down high-interest debt to improve your financial security.',
      priority: 'High'
    });
  }
  
  // Emergency fund recommendation
  recommendations.push({
    category: 'Emergency Fund',
    title: 'Build emergency savings',
    description: 'Maintain 3-6 months of expenses in a liquid emergency fund.',
    priority: metrics.netWorth < metrics.monthlyExpenses * 3 ? 'High' : 'Medium'
  });
  
  return recommendations;
}

/**
 * Analyze multiple financial documents together
 */
export async function analyzeMultipleDocuments(documents: {id: string, content: string, type: string}[]) {
  try {
    const analysisResults = [];
    
    for (const doc of documents) {
      try {
        const result = await analyzePdfContent(doc.content, doc.type);
        analysisResults.push({
          documentId: doc.id,
          documentType: doc.type,
          ...result
        });
      } catch (error) {
        console.error(`Error analyzing document ${doc.id}:`, error);
      }
    }
    
    return analysisResults;
  } catch (error) {
    console.error('Error in document analysis batch:', error);
    throw error;
  }
}