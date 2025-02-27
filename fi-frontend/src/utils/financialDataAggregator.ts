import { prisma } from "@/lib/prisma";

/**
 * Updates the financial profile data by aggregating information from all document analyses
 * @param financialProfileId The ID of the financial profile to update
 */
export async function updateFinancialProfileData(financialProfileId: string): Promise<void> {
  try {
    // Fetch all document analyses for this profile
    const documentAnalyses = await prisma.documentAnalysis.findMany({
      where: { userProfileId: financialProfileId },
      orderBy: { createdAt: 'desc' },
    });

    if (documentAnalyses.length === 0) {
      console.log('No document analyses found for aggregation');
      return;
    }

    // Initialize financial data structure
    const financialData: any = {
      monthlyIncome: 0,
      annualIncome: 0,
      incomeStreams: [],
      incomeStability: null,
      monthlySpending: 0,
      annualSpending: 0,
      topExpenses: [],
      spendingTrends: {},
      savings: 0,
      savingsRate: 0,
      investments: [],
      assets: [],
      emergencyFundMonths: 0,
      totalDebt: 0,
      debtToIncomeRatio: 0,
      loans: [],
      creditCards: [],
      emi: 0,
      netWorth: 0,
      dataCompleteness: 0,
      dataSources: {}
    };

    // Track which fields we've populated to calculate completeness
    const fieldTracking: Record<string, boolean> = {};
    
    // Process each document analysis
    for (const analysis of documentAnalyses) {
      const data = analysis.structuredData as any;
      if (!data) continue;
      
      const documentType = analysis.documentType || 'unknown';
      
      // Add to data sources
      financialData.dataSources[analysis.documentId] = {
        type: documentType,
        date: analysis.createdAt
      };

      // Extract data based on document type
      await extractFinancialData(data, documentType, financialData, fieldTracking);
    }

    // Calculate derived metrics after aggregating all data
    calculateDerivedMetrics(financialData);
    
    // Calculate data completeness
    const totalFields = Object.keys(fieldTracking).length;
    const populatedFields = Object.values(fieldTracking).filter(Boolean).length;
    financialData.dataCompleteness = Math.min(100, (populatedFields / totalFields) * 100);

    // Find existing financial data or create new
    const existingData = await prisma.financialData.findUnique({
      where: { profileId: financialProfileId }
    });

    if (existingData) {
      // Update existing record
      await prisma.financialData.update({
        where: { id: existingData.id },
        data: financialData,
      });
    } else {
      // Create new record
      await prisma.financialData.create({
        data: {
          profileId: financialProfileId,
          ...financialData,
          lastUpdated: new Date(),
        }
      });
    }
    
    console.log('Financial data updated successfully');

  } catch (error) {
    console.error('Error updating financial data:', error);
  }
}

/**
 * Extract financial data from a document analysis
 */
async function extractFinancialData(
  data: any,
  documentType: string,
  financialData: any,
  fieldTracking: Record<string, boolean>
) {
  try {
    // Handle different document types
    switch (documentType.toLowerCase()) {
      case 'bank statement':
        extractFromBankStatement(data, financialData, fieldTracking);
        break;
      
      case 'salary slip':
        extractFromSalarySlip(data, financialData, fieldTracking);
        break;
      
      case 'credit card statement':
        extractFromCreditCardStatement(data, financialData, fieldTracking);
        break;
      
      case 'loan statement':
        extractFromLoanStatement(data, financialData, fieldTracking);
        break;
      
      case 'investment account':
      case 'investment statement':
        extractFromInvestmentStatement(data, financialData, fieldTracking);
        break;
      
      default:
        // Generic extraction for unknown document types
        extractGenericFinancialData(data, financialData, fieldTracking);
    }
  } catch (error) {
    console.error('Error extracting financial data:', error);
  }
}

/**
 * Calculate derived financial metrics
 */
function calculateDerivedMetrics(financialData: any) {
  // Calculate savings rate if we have both income and spending
  if (financialData.monthlyIncome > 0) {
    if (financialData.monthlySpending > 0) {
      const monthlySavings = financialData.monthlyIncome - financialData.monthlySpending;
      financialData.savingsRate = monthlySavings / financialData.monthlyIncome;
      
      // Estimate emergency fund coverage
      if (financialData.savings > 0 && financialData.monthlySpending > 0) {
        financialData.emergencyFundMonths = financialData.savings / financialData.monthlySpending;
      }
    }
    
    // Calculate debt-to-income ratio
    if (financialData.totalDebt > 0) {
      financialData.debtToIncomeRatio = financialData.totalDebt / (financialData.monthlyIncome * 12);
    }
  }
  
  // Calculate net worth if we have both assets and debts
  if (financialData.savings > 0 || financialData.assets.length > 0) {
    const totalAssets = financialData.savings + 
      financialData.assets.reduce((sum: number, asset: any) => sum + (asset.value || 0), 0);
    
    financialData.netWorth = totalAssets - financialData.totalDebt;
  }
}

/**
 * Extract data from bank statements
 */
function extractFromBankStatement(data: any, financialData: any, fieldTracking: Record<string, boolean>) {
  // Extract income
  if (data.metrics?.recurringIncome || data.metrics?.totalDeposits) {
    const recurringIncome = data.metrics?.recurringIncome || [];
    
    // Add recurring income sources
    if (Array.isArray(recurringIncome)) {
      recurringIncome.forEach(income => {
        addIncomeStream(financialData, income);
      });
    }
    
    // Update monthly income
    updateMonthlyIncome(financialData);
    fieldTracking.monthlyIncome = true;
    fieldTracking.incomeStreams = true;
  }
  
  // Extract expenses
  if (data.metrics?.recurringExpenses || data.metrics?.topExpenses || data.metrics?.topExpenseCategories) {
    const expenses = [
      ...(data.metrics?.recurringExpenses || []),
      ...(data.metrics?.topExpenses || []),
      ...(data.metrics?.topExpenseCategories || [])
    ];
    
    expenses.forEach(expense => {
      addExpense(financialData, expense);
    });
    
    updateMonthlySpending(financialData);
    fieldTracking.monthlySpending = true;
    fieldTracking.topExpenses = true;
  }
  
  // Extract account balance as savings
  if (data.metrics?.closingBalance != null) {
    financialData.savings = Math.max(financialData.savings, data.metrics.closingBalance);
    fieldTracking.savings = true;
  }
}

/**
 * Extract data from salary slips
 */
function extractFromSalarySlip(data: any, financialData: any, fieldTracking: Record<string, boolean>) {
  // Extract salary
  if (data.metrics?.netSalary != null || data.metrics?.grossSalary != null) {
    const salaryAmount = data.metrics?.netSalary != null ? data.metrics.netSalary : data.metrics.grossSalary;
    
    const salaryIncome = {
      source: 'Salary',
      description: data.metrics?.employer || 'Employment',
      amount: salaryAmount,
      frequency: 'monthly',
      isRecurring: true
    };
    
    addIncomeStream(financialData, salaryIncome);
    updateMonthlyIncome(financialData);
    
    // Set income stability to high for salary
    financialData.incomeStability = 'High';
    
    fieldTracking.monthlyIncome = true;
    fieldTracking.incomeStreams = true;
    fieldTracking.incomeStability = true;
  }
}

/**
 * Extract data from credit card statements
 */
function extractFromCreditCardStatement(data: any, financialData: any, fieldTracking: Record<string, boolean>) {
  // Extract credit card debt
  if (data.metrics?.totalOutstanding != null || data.metrics?.currentBalance != null) {
    const outstandingAmount = data.metrics?.totalOutstanding != null ? 
      data.metrics.totalOutstanding : data.metrics.currentBalance;
    
    const creditCard = {
      type: 'Credit Card',
      issuer: data.metrics?.issuer || 'Unknown',
      outstandingAmount: outstandingAmount,
      creditLimit: data.metrics?.creditLimit,
      availableCredit: data.metrics?.availableCredit,
      interestRate: data.metrics?.interestRate,
      minimumPayment: data.metrics?.minimumDue
    };
    
    // Add to credit cards
    financialData.creditCards.push(creditCard);
    
    // Add to total debt
    financialData.totalDebt += outstandingAmount;
    
    fieldTracking.creditCards = true;
    fieldTracking.totalDebt = true;
  }
  
  // Extract spending categories
  if (data.metrics?.topSpendingCategories) {
    data.metrics.topSpendingCategories.forEach((category: any) => {
      addExpense(financialData, category);
    });
    
    updateMonthlySpending(financialData);
    fieldTracking.topExpenses = true;
    fieldTracking.monthlySpending = true;
  }
}

/**
 * Extract data from loan statements
 */
function extractFromLoanStatement(data: any, financialData: any, fieldTracking: Record<string, boolean>) {
  // Extract loan data
  if (data.metrics?.principalOutstanding != null || data.metrics?.loanAmount != null) {
    const outstandingAmount = data.metrics?.principalOutstanding != null ? 
      data.metrics.principalOutstanding : data.metrics.loanAmount;
    
    const loan = {
      type: data.metrics?.loanType || 'Loan',
      lender: data.metrics?.lender || 'Unknown',
      originalAmount: data.metrics?.loanAmount,
      outstandingAmount: outstandingAmount,
      interestRate: data.metrics?.interestRate,
      emiAmount: data.metrics?.emiAmount,
      tenureRemaining: data.metrics?.tenureRemaining
    };
    
    // Add to loans
    financialData.loans.push(loan);
    
    // Add to total debt
    financialData.totalDebt += outstandingAmount;
    
    // Add EMI to monthly obligations
    if (data.metrics?.emiAmount) {
      financialData.emi += data.metrics.emiAmount;
    }
    
    fieldTracking.loans = true;
    fieldTracking.totalDebt = true;
    fieldTracking.emi = true;
  }
}

/**
 * Extract data from investment statements
 */
function extractFromInvestmentStatement(data: any, financialData: any, fieldTracking: Record<string, boolean>) {
  // Extract investment data
  if (data.metrics?.totalInvestmentValue != null) {
    const investment = {
      type: data.metrics?.accountType || 'Investment',
      value: data.metrics.totalInvestmentValue,
      holdings: data.metrics?.holdings || [],
      returns: data.metrics?.returns,
      assetAllocation: data.metrics?.assetAllocation
    };
    
    // Add to investments
    financialData.investments.push(investment);
    
    // Add to total assets
    financialData.savings += data.metrics.totalInvestmentValue;
    
    fieldTracking.investments = true;
    fieldTracking.savings = true;
  }
}

/**
 * Extract generic financial data for unknown document types
 */
function extractGenericFinancialData(data: any, financialData: any, fieldTracking: Record<string, boolean>) {
  const metrics = data.metrics || {};
  
  // Look for income related fields
  if (metrics.income || metrics.salary || metrics.totalDeposits) {
    const incomeAmount = metrics.income || metrics.salary || metrics.totalDeposits;
    
    if (incomeAmount) {
      addIncomeStream(financialData, {
        source: 'Income',
        description: 'General Income',
        amount: incomeAmount,
        frequency: 'monthly'
      });
      
      updateMonthlyIncome(financialData);
      fieldTracking.monthlyIncome = true;
      fieldTracking.incomeStreams = true;
    }
  }
  
  // Look for expense related fields
  if (metrics.expenses || metrics.spending || metrics.totalWithdrawals) {
    const expenseAmount = metrics.expenses || metrics.spending || metrics.totalWithdrawals;
    
    if (expenseAmount) {
      addExpense(financialData, {
        category: 'General Expenses',
        amount: expenseAmount,
        frequency: 'monthly'
      });
      
      updateMonthlySpending(financialData);
      fieldTracking.monthlySpending = true;
    }
  }
  
  // Look for balance related fields
  if (metrics.balance || metrics.closingBalance) {
    const balance = metrics.balance || metrics.closingBalance;
    
    if (balance) {
      financialData.savings = Math.max(financialData.savings, balance);
      fieldTracking.savings = true;
    }
  }
  
  // Look for debt related fields
  if (metrics.debt || metrics.totalOutstanding || metrics.loanAmount) {
    const debtAmount = metrics.debt || metrics.totalOutstanding || metrics.loanAmount;
    
    if (debtAmount) {
      financialData.totalDebt += debtAmount;
      fieldTracking.totalDebt = true;
    }
  }
}

// Helper functions for specific data manipulation

function addIncomeStream(financialData: any, income: any) {
  if (!income || !income.amount) return;
  
  const amount = parseFloat(income.amount);
  if (isNaN(amount) || amount <= 0) return;
  
  const existingIndex = financialData.incomeStreams.findIndex((stream: any) => 
    stream.source === income.source || stream.description === income.description
  );
  
  if (existingIndex >= 0) {
    // Update existing income stream with more recent data
    financialData.incomeStreams[existingIndex] = {
      ...financialData.incomeStreams[existingIndex],
      amount: Math.max(financialData.incomeStreams[existingIndex].amount, amount)
    };
  } else {
    // Add new income stream
    financialData.incomeStreams.push({
      source: income.source || 'Income',
      description: income.description || 'Regular Income',
      amount: amount,
      frequency: income.frequency || 'monthly',
      isRecurring: income.isRecurring || true
    });
  }
}

function updateMonthlyIncome(financialData: any) {
  financialData.monthlyIncome = financialData.incomeStreams.reduce((total: number, income: any) => {
    const amount = parseFloat(income.amount) || 0;
    const frequency = income.frequency?.toLowerCase() || 'monthly';
    
    switch (frequency) {
      case 'annual': return total + (amount / 12);
      case 'quarterly': return total + (amount / 3);
      case 'weekly': return total + (amount * 4.33);
      case 'daily': return total + (amount * 30);
      case 'monthly':
      default:
        return total + amount;
    }
  }, 0);
  
  financialData.annualIncome = financialData.monthlyIncome * 12;
}

function addExpense(financialData: any, expense: any) {
  if (!expense || !expense.amount) return;
  
  const amount = parseFloat(expense.amount);
  if (isNaN(amount) || amount <= 0) return;
  
  const category = expense.category || expense.description || 'Other';
  
  const existingIndex = financialData.topExpenses.findIndex((exp: any) => 
    exp.category === category || exp.description === expense.description
  );
  
  if (existingIndex >= 0) {
    // Update existing expense with more recent data
    financialData.topExpenses[existingIndex] = {
      ...financialData.topExpenses[existingIndex],
      amount: Math.max(financialData.topExpenses[existingIndex].amount, amount)
    };
  } else {
    // Add new expense
    financialData.topExpenses.push({
      category: category,
      description: expense.description || category,
      amount: amount,
      frequency: expense.frequency || 'monthly'
    });
  }
}

function updateMonthlySpending(financialData: any) {
  financialData.monthlySpending = financialData.topExpenses.reduce((total: number, expense: any) => {
    const amount = parseFloat(expense.amount) || 0;
    const frequency = expense.frequency?.toLowerCase() || 'monthly';
    
    switch (frequency) {
      case 'annual': return total + (amount / 12);
      case 'quarterly': return total + (amount / 3);
      case 'weekly': return total + (amount * 4.33);
      case 'daily': return total + (amount * 30);
      case 'monthly':
      default:
        return total + amount;
    }
  }, 0);
  
  financialData.annualSpending = financialData.monthlySpending * 12;
}