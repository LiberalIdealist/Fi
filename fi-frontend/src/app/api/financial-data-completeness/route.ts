import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user with financial profile and financial data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        financialProfile: {
          include: {
            financialData: true,
            documentAnalyses: {
              select: {
                id: true,
                documentType: true,
                createdAt: true
              },
              orderBy: { createdAt: 'desc' },
            }
          }
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            analyzedAt: true,
          },
          orderBy: { uploadedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user || !user.financialProfile) {
      return NextResponse.json({ 
        complete: false, 
        overallCompleteness: 0,
        questionnaire: false,
        documentAnalysis: false,
        documents: {
          uploaded: 0,
          analyzed: 0
        },
        missingDocumentTypes: getMissingDocumentTypes([]),
        recommendations: [
          "Complete the initial financial questionnaire",
          "Upload your salary slip to understand your income",
          "Upload a bank statement to analyze your spending patterns",
          "Upload investment statements to include your current portfolio"
        ]
      });
    }

    // Check what data we have
    const hasQuestionnaire = !!user.financialProfile.responses;
    const hasFinancialData = !!user.financialProfile.financialData;
    const analyzedDocuments = user.financialProfile.documentAnalyses || [];
    const documentTypes = analyzedDocuments.map(doc => doc.documentType?.toLowerCase() || "unknown");
    
    // Calculate completeness
    let overallCompleteness = 0;
    
    // Questionnaire provides base 30% completeness
    if (hasQuestionnaire) {
      overallCompleteness += 30;
    }
    
    // Financial data from documents provides up to 70% more completeness
    if (hasFinancialData && user.financialProfile.financialData?.dataCompleteness) {
      const dataCompleteness = user.financialProfile.financialData.dataCompleteness;
      overallCompleteness += (dataCompleteness * 0.7);
    }
    
    // Identify missing document types
    const missingDocTypes = getMissingDocumentTypes(documentTypes);
    
    // Generate recommendations based on what's missing
    const recommendations = generateRecommendations(
      hasQuestionnaire, 
      user.financialProfile.financialData,
      documentTypes,
      missingDocTypes
    );

    return NextResponse.json({
      complete: overallCompleteness >= 80, // Consider 80%+ as "complete enough"
      overallCompleteness: Math.min(100, Math.round(overallCompleteness)),
      questionnaire: hasQuestionnaire,
      documentAnalysis: hasFinancialData,
      documents: {
        uploaded: user.documents.length,
        analyzed: user.documents.filter(doc => doc.analyzedAt).length
      },
      analyzedDocumentTypes: documentTypes.filter(Boolean),
      missingDocumentTypes: missingDocTypes,
      recommendations,
      financialData: hasFinancialData ? {
        incomeDataCompleteness: getDataFieldCompleteness(user.financialProfile.financialData, ['monthlyIncome', 'incomeStreams', 'incomeStability']),
        expenseDataCompleteness: getDataFieldCompleteness(user.financialProfile.financialData, ['monthlySpending', 'topExpenses']),
        savingsDataCompleteness: getDataFieldCompleteness(user.financialProfile.financialData, ['savings', 'investments', 'assets']),
        debtDataCompleteness: getDataFieldCompleteness(user.financialProfile.financialData, ['totalDebt', 'loans', 'creditCards', 'emi']),
      } : null
    });

  } catch (error) {
    console.error("Error checking financial data completeness:", error);
    return NextResponse.json({ error: "Failed to check data completeness" }, { status: 500 });
  }
}

// Helper function to identify missing document types
function getMissingDocumentTypes(existingTypes: string[]): string[] {
  const requiredDocTypes = [
    "bank statement",
    "salary slip",
    "investment account", 
    "credit card statement"
  ];
  
  return requiredDocTypes.filter(type => 
    !existingTypes.some(existing => existing?.includes(type))
  );
}

// Helper function to generate recommendations for improving financial data
function generateRecommendations(
  hasQuestionnaire: boolean,
  financialData: any,
  documentTypes: string[],
  missingDocTypes: string[]
): string[] {
  const recommendations: string[] = [];
  
  // Questionnaire recommendation
  if (!hasQuestionnaire) {
    recommendations.push("Complete the initial financial questionnaire to establish your risk profile");
  }
  
  // Document upload recommendations
  missingDocTypes.forEach(docType => {
    switch (docType) {
      case "bank statement":
        recommendations.push("Upload recent bank statements to analyze your spending patterns and cash flow");
        break;
      case "salary slip":
        recommendations.push("Upload your latest salary slip to accurately assess your income");
        break;
      case "investment account":
        recommendations.push("Upload investment account statements to include your current portfolio in recommendations");
        break;
      case "credit card statement":
        recommendations.push("Upload credit card statements to analyze your spending categories and debt management");
        break;
    }
  });
  
  // Data quality recommendations
  if (financialData) {
    if (!financialData.monthlyIncome || financialData.monthlyIncome === 0) {
      recommendations.push("We need more information about your income sources");
    }
    
    if (!financialData.monthlySpending || financialData.monthlySpending === 0) {
      recommendations.push("Upload more recent statements to analyze your spending patterns");
    }
    
    if (!financialData.savings || financialData.savings === 0) {
      recommendations.push("We need more information about your savings to make appropriate recommendations");
    }
    
    // Only recommend this if we have income data but no emergency fund calculation
    if (financialData.monthlyIncome > 0 && (!financialData.emergencyFundMonths || financialData.emergencyFundMonths < 3)) {
      recommendations.push("Consider building an emergency fund of at least 3-6 months of expenses");
    }
  }
  
  return recommendations.slice(0, 5); // Limit to 5 most important recommendations
}

// Helper function to check completeness of specific data fields
function getDataFieldCompleteness(data: any, fields: string[]): number {
  if (!data) return 0;
  
  let completedFields = 0;
  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null) {
      if (Array.isArray(data[field])) {
        if (data[field].length > 0) completedFields++;
      } else if (typeof data[field] === 'object') {
        if (Object.keys(data[field]).length > 0) completedFields++;
      } else {
        completedFields++;
      }
    }
  }
  
  return Math.round((completedFields / fields.length) * 100);
}