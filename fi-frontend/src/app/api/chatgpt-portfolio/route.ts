import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionnaireAnswers, riskScore, financialSummary, insights, userInfo, documentAnalyses } = await req.json();
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        financialProfile: true,
        documents: {
          include: {
            analyses: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        } 
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare data for ChatGPT
    const userData = {
      name: userInfo?.name || user.name || "User",
      email: userInfo?.email || user.email,
      riskScore: riskScore || user.financialProfile?.riskScore || 5,
      financialSummary: financialSummary || user.financialProfile?.financialSummary || "",
      questionnaireAnswers: questionnaireAnswers || user.financialProfile?.responses || {},
      insights: insights || user.financialProfile?.insights || {},
      documentAnalyses: documentAnalyses || user.documents.map(doc => ({
        documentType: doc.fileName,
        summary: doc.analyses[0]?.analysisContent || "No analysis available",
        createdAt: doc.createdAt.toISOString()
      }))
    };

    // Generate system prompt for portfolio generation
    const systemPrompt = `
      You are a certified financial advisor specializing in personal finance for Indian investors.
      Your task is to analyze the user's financial profile and create:
      
      1. A personalized user profile summarizing their financial situation and goals
      2. A diversified investment portfolio recommendation with specific allocations for:
         - Fixed Deposits: Suggest terms and expected returns
         - Stocks: Recommend specific Indian stocks based on user profile
         - Mutual Funds: Diversified across debt, hybrid, and equity; suggest specific Indian mutual funds
         - Insurance: Optimal health, life, and term insurance coverage amounts
      3. A comprehensive SWOT analysis considering:
         - Current Indian market conditions
         - Global economic trends
         - The user's specific financial situation and risk profile
      
      Format your response as a JSON object with the following structure:
      {
        "userProfile": "Detailed summary of the user's financial situation",
        "portfolio": {
          "fixedDeposits": { 
            "percentage": 20, 
            "recommendations": [
              { "type": "Bank FD", "term": "2 years", "expectedReturn": "6.5%", "rationale": "Explanation" }
            ]
          },
          "stocks": { 
            "percentage": 30, 
            "recommendations": [
              { "name": "Company Name", "sector": "Sector", "rationale": "Why this stock" }
            ]
          },
          "mutualFunds": { 
            "percentage": 40,
            "debt": [{ "name": "Fund Name", "type": "Short term", "rationale": "Explanation" }],
            "hybrid": [{ "name": "Fund Name", "type": "Balanced", "rationale": "Explanation" }],
            "equity": [{ "name": "Fund Name", "type": "Large Cap", "rationale": "Explanation" }]
          },
          "insurance": {
            "health": { "coverAmount": "₹5 lakhs", "type": "Individual", "rationale": "Explanation" },
            "life": { "coverAmount": "₹50 lakhs", "type": "Term", "rationale": "Explanation" },
            "term": { "coverAmount": "₹1 crore", "term": "20 years", "rationale": "Explanation" }
          }
        },
        "swotAnalysis": {
          "strengths": ["strength1", "strength2"],
          "weaknesses": ["weakness1", "weakness2"],
          "opportunities": ["opportunity1", "opportunity2"],
          "threats": ["threat1", "threat2"]
        }
      }

      Make all recommendations practical and specific to the Indian market, using real financial products when possible. 
      Ensure the portfolio allocation percentages add up to 100%.
    `;

    // Prepare the user message
    const userMessage = `
      Here is my financial data for you to analyze:
      
      Risk Score: ${userData.riskScore}/10
      Financial Summary: ${userData.financialSummary}
      
      Questionnaire Answers:
      ${Object.entries(userData.questionnaireAnswers).map(([q, a]) => `- ${q}: ${a}`).join('\n')}
      
      Financial Insights:
      ${Object.entries(userData.insights).map(([category, insight]) => `- ${category}: ${insight}`).join('\n')}
      
      Document Analyses:
      ${userData.documentAnalyses.map(doc => `- ${doc.documentType}: ${doc.summary.slice(0, 200)}...`).join('\n\n')}
      
      Please provide a comprehensive user profile, portfolio recommendation, and SWOT analysis based on this data.
    `;

    // Call ChatGPT API
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    // Parse the response
    const content = response.choices[0]?.message?.content || "";
    let analysisResult;
    
    try {
      // Find and parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse JSON from ChatGPT response");
      }
    } catch (error) {
      console.error("Error parsing ChatGPT response:", error);
      return NextResponse.json({ error: "Failed to parse portfolio recommendations" }, { status: 500 });
    }

    // Save to Prisma
    if (user.financialProfile) {
      await prisma.financialProfile.update({
        where: { id: user.financialProfile.id },
        data: {
          portfolioRecommendation: analysisResult.portfolio || {},
          swotAnalysis: analysisResult.swotAnalysis || {},
          marketInsights: analysisResult.userProfile || "",
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.financialProfile.create({
        data: {
          userId: user.id,
          portfolioRecommendation: analysisResult.portfolio || {},
          swotAnalysis: analysisResult.swotAnalysis || {},
          marketInsights: analysisResult.userProfile || ""
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      analysis: analysisResult 
    });
  } catch (error) {
    console.error("Error in ChatGPT portfolio API:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}