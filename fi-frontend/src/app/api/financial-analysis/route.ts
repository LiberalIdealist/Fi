import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { analyzeQuestionnaireData, generateFinancialProfile, analyzePdfContent } from "@/utils/naturalLanguageService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionnaireAnswers, followUpAnswers, textContent, documentType } = await request.json();
    
    if (!questionnaireAnswers && (!textContent || !documentType)) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const userId = session.user.id;

    try {
      if (textContent && documentType) {
        // Analyze PDF content
        const analysis = await analyzePdfContent(textContent, documentType);
        
        return NextResponse.json({
          success: true,
          analysis
        });
      }

      // 1. Analyze questionnaire data first with Natural Language
      const questionnaireAnalysis = analyzeQuestionnaireData(questionnaireAnswers, followUpAnswers);
      
      // 2. Fetch any document analysis results for this user
      const userDocuments = await prisma.financialDocument.findMany({
        where: {
          userId,
          processingStatus: "completed"
        },
        include: {
          analysis: true
        }
      });
      
      // 3. Format document analysis data
      const documentAnalysisData = userDocuments.map(doc => ({
        documentId: doc.id,
        documentType: doc.documentType,
        analysisData: doc.analysis?.analysisData || null
      })).filter(doc => doc.analysisData !== null);
      
      // 4. Generate comprehensive financial profile
      const finalAnalysis = documentAnalysisData.length > 0
        ? generateFinancialProfile(documentAnalysisData, questionnaireAnswers, followUpAnswers)
        : generateFinancialProfile([], questionnaireAnswers, followUpAnswers);
      
      // 5. Save to database
      const existingProfile = await prisma.financialProfile.findUnique({
        where: { userId }
      });
      
      if (existingProfile) {
        await prisma.financialProfile.update({
          where: { userId },
          data: {
            analysisData: finalAnalysis,
            riskScore: finalAnalysis.personalProfile?.riskProfile?.score || 5,
            investmentStyle: finalAnalysis.personalProfile?.riskProfile?.category || "Moderate",
            questionnaireResponses: questionnaireAnswers,
            followUpResponses: followUpAnswers || {},
            documentAnalysis: documentAnalysisData,
            psychologicalProfile: finalAnalysis.personalProfile,
            recommendations: finalAnalysis.recommendations,
            insights: finalAnalysis.insights?.map((insight: any) => insight.message) || [],
            financialGoals: finalAnalysis.personalProfile?.financialGoals || [],
            documentsAnalyzed: documentAnalysisData.length > 0,
            analysisVersion: existingProfile.analysisVersion + 1,
            lastAnalyzedAt: new Date()
          }
        });
      } else {
        await prisma.financialProfile.create({
          data: {
            userId,
            analysisData: finalAnalysis,
            riskScore: finalAnalysis.personalProfile?.riskProfile?.score || 5,
            investmentStyle: finalAnalysis.personalProfile?.riskProfile?.category || "Moderate",
            questionnaireResponses: questionnaireAnswers,
            followUpResponses: followUpAnswers || {},
            documentAnalysis: documentAnalysisData,
            psychologicalProfile: finalAnalysis.personalProfile,
            recommendations: finalAnalysis.recommendations,
            insights: finalAnalysis.insights?.map((insight: any) => insight.message) || [],
            financialGoals: finalAnalysis.personalProfile?.financialGoals || [],
            documentsAnalyzed: documentAnalysisData.length > 0,
            analysisVersion: 1,
            lastAnalyzedAt: new Date()
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        analysis: finalAnalysis,
        documentsAnalyzed: documentAnalysisData.length
      });
    } catch (error) {
      console.error("Analysis error:", error);
      return NextResponse.json(
        { error: "Failed to generate analysis" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}