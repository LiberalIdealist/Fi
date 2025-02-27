import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, documentText, questionnaireData, followUpAnswers, userInfo } = await req.json();
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { financialProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use Gemini to analyze the data
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const analysisPrompt = `
      You are an expert financial analyst and behavioral psychologist. Analyze the user's financial data and questionnaire answers to create a comprehensive financial and psychological profile. Include:
      1. A risk score from 1 to 10 (where 1 is most conservative and 10 is most aggressive)
      2. A summary of their financial behavior and profile (under 100 words)
      3. Specific insights in these categories: Risk Tolerance, Financial Habits, Investment Approach, and Psychological Tendencies
      4. A psychological profile report analyzing their relationship with money
      5. 3-5 recommended actions they should take based on their financial profile
      ${documentText ? '6. Analysis of their financial documents' : ''}

      If there is insufficient information, include 3-5 follow-up questions that would help better understand their financial situation.

      Here's the information to analyze:
      ${prompt}
      ${documentText ? `\n\nDocument Content:\n${documentText.substring(0, 5000)}...` : ''}
      
      Format your response as structured JSON with these fields:
      {
        "riskScore": number,
        "summary": "text",
        "insights": [{"category": "Risk Tolerance", "text": "analysis"}, ...],
        "psychologicalProfile": "text",
        "recommendedActions": ["action1", ...],
        "suggestedFollowUps": ["question1", ...] // Only if needed
      }
    `;

    const result = await model.generateContent(analysisPrompt);
    const responseText = result.response.text();
    
    let analysisResult: any;
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse JSON response");
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return NextResponse.json({ error: "Failed to parse analysis results" }, { status: 500 });
    }

    // Store analysis in Prisma
    let financialProfile = user.financialProfile;

    // Create financial profile if it doesn't exist
    if (!financialProfile) {
      financialProfile = await prisma.financialProfile.create({
        data: {
          userId: user.id,
          riskScore: analysisResult.riskScore || 5,
          financialSummary: analysisResult.summary || "No summary available",
          responses: questionnaireData,
          insights: {
            riskTolerance: analysisResult.insights.find((i: any) => i.category === "Risk Tolerance")?.text || "",
            financialHabits: analysisResult.insights.find((i: any) => i.category === "Financial Habits")?.text || "",
            investmentApproach: analysisResult.insights.find((i: any) => i.category === "Investment Approach")?.text || "",
            psychologicalTendencies: analysisResult.insights.find((i: any) => i.category === "Psychological Tendencies")?.text || ""
          },
          aiRecommendations: analysisResult.recommendedActions.join("\n")
        }
      });
    } else {
      // Update existing profile
      await prisma.financialProfile.update({
        where: { id: financialProfile.id },
        data: {
          riskScore: analysisResult.riskScore || 5,
          financialSummary: analysisResult.summary || "No summary available",
          responses: {
            ...financialProfile.responses as object,
            ...questionnaireData,
            ...followUpAnswers
          },
          geminiInsights: {
            riskTolerance: analysisResult.insights.find((i: any) => i.category === "Risk Tolerance")?.text || "",
            financialHabits: analysisResult.insights.find((i: any) => i.category === "Financial Habits")?.text || "",
            investmentApproach: analysisResult.insights.find((i: any) => i.category === "Investment Approach")?.text || "",
            psychologicalTendencies: analysisResult.insights.find((i: any) => i.category === "Psychological Tendencies")?.text || ""
          },
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      analysis: analysisResult 
    });
  } catch (error) {
    console.error("Error in Gemini analysis API:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}