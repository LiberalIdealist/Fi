import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user with all financial data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        financialProfile: {
          include: {
            financialData: true,
            documentAnalyses: {
              orderBy: { createdAt: 'desc' },
              take: 3
            }
          }
        }
      }
    });

    if (!user || !user.financialProfile) {
      return NextResponse.json(
        { error: "Financial profile not found. Complete the questionnaire first." },
        { status: 404 }
      );
    }

    const financialData = user.financialProfile.financialData;
    
    if (!financialData) {
      return NextResponse.json(
        { error: "No financial data available. Please upload and analyze financial documents." },
        { status: 404 }
      );
    }

    // Check if we already have cached insights that are less than 24 hours old
    if (user.financialProfile.geminiInsights) {
      const insights = user.financialProfile.geminiInsights as any;
      if (insights.generatedAt) {
        const generatedAt = new Date(insights.generatedAt);
        const now = new Date();
        const hoursSinceGeneration = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);
        
        // If insights are fresh and we're not forcing refresh, return the cached insights
        if (hoursSinceGeneration < 24 && !req.nextUrl.searchParams.get('refresh')) {
          return NextResponse.json({
            success: true,
            insights: insights,
            cached: true
          });
        }
      }
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Format financial data for the prompt
    const financialMetrics = {
      income: {
        monthly: financialData.monthlyIncome,
        annual: financialData.annualIncome,
        stability: financialData.incomeStability,
        streams: financialData.incomeStreams
      },
      expenses: {
        monthly: financialData.monthlySpending,
        annual: financialData.annualSpending,
        categories: financialData.topExpenses
      },
      savings: {
        total: financialData.savings,
        rate: financialData.savingsRate,
        emergencyFundMonths: financialData.emergencyFundMonths
      },
      debt: {
        total: financialData.totalDebt,
        debtToIncomeRatio: financialData.debtToIncomeRatio,
        loans: financialData.loans,
        creditCards: financialData.creditCards,
        monthlyObligations: financialData.emi
      },
      investments: financialData.investments,
      netWorth: financialData.netWorth
    };
    
    // Create prompt for Gemini
    const prompt = `
      You are a financial advisor analyzing financial data for a client in India. 
      Generate insightful financial observations based on this data.
      
      Financial Data:
      ${JSON.stringify(financialMetrics, null, 2)}
      
      Risk Profile Score: ${user.financialProfile.riskScore || 'Unknown'}/10
      
      Provide the following in your response as structured JSON:
      {
        "summary": "A brief 1-2 sentence summary of their overall financial situation",
        "keyObservations": [
          "3-5 key observations about their financial situation"
        ],
        "strengths": [
          "2-3 financial strengths they have"
        ],
        "improvementAreas": [
          "2-3 areas where they can improve"
        ],
        "actionableAdvice": [
          "3-5 specific, actionable steps they can take to improve their finances"
        ],
        "savingsRate": {
          "current": number (or null if unknown),
          "recommended": number,
          "analysis": "Brief analysis of their savings rate"
        },
        "debtManagement": {
          "status": "Good/Concerning/Critical", 
          "analysis": "Analysis of their debt situation"
        },
        "emergencyFund": {
          "currentMonths": number (or null if unknown),
          "recommendedMonths": number,
          "analysis": "Analysis of their emergency fund"
        },
        "investmentStrategy": {
          "recommendation": "Conservative/Moderate/Aggressive",
          "analysis": "Brief investment strategy advice"
        }
      }
      
      Focus on providing practical insights for the Indian context. 
      If any key data is missing, note this in your analysis.
      Ensure all numerical values are appropriate (e.g., savings rate as a decimal between 0-1).
      Only include the JSON in your response, nothing else.
    `;

    try {
      const result = await model.generateContent(prompt);
      const insightsText = result.response.text();
      
      // Parse JSON from the response
      let insights;
      try {
        const jsonMatch = insightsText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0]);
        } else {
          insights = JSON.parse(insightsText);
        }
        
        // Add generation timestamp
        insights.generatedAt = new Date().toISOString();
      } catch (jsonError) {
        console.error("Error parsing insights JSON:", jsonError);
        return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
      }
      
      // Save insights to the user's profile
      await prisma.financialProfile.update({
        where: { id: user.financialProfile.id },
        data: { 
          geminiInsights: insights,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        insights: insights,
        cached: false
      });
    } catch (error) {
      console.error("Error generating financial insights:", error);
      return NextResponse.json({ error: "Failed to generate financial insights" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in financial insights API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}