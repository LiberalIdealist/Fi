import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
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
            financialData: true
          }
        }
      }
    });

    if (!user || !user.financialProfile) {
      return NextResponse.json({ 
        complete: false,
        completeness: 0,
        missingData: ["profile"],
        message: "Financial profile not found. Please complete the questionnaire."
      });
    }

    // Check what data is available
    const missingData = [];
    if (!user.financialProfile.responses) {
      missingData.push("questionnaire");
    }
    
    if (!user.financialProfile.financialData) {
      missingData.push("documentAnalysis");
    }

    // Calculate overall completeness based on what we have
    let completeness = 0;

    if (user.financialProfile.responses) {
      completeness += 50; // Questionnaire provides 50% of needed data
    }

    if (user.financialProfile.financialData) {
      // Data from documents provides up to 50% of needed data,
      // weighted by its own internal completeness
      const dataCompleteness = user.financialProfile.financialData.dataCompleteness || 0;
      completeness += dataCompleteness / 2;
    }

    return NextResponse.json({
      complete: completeness >= 70, // Consider 70%+ as "complete enough"
      completeness: completeness,
      missingData,
      profileStatus: user.financialProfile.responses ? "complete" : "incomplete",
      documentStatus: user.financialProfile.financialData ? 
        `${user.financialProfile.financialData.dataCompleteness || 0}% complete` : 
        "no documents analyzed",
      message: missingData.length === 0 ? 
        "All required financial data is available" :
        `Missing data: ${missingData.join(", ")}`
    });

  } catch (error) {
    console.error("Error checking financial data completeness:", error);
    return NextResponse.json({ error: "Failed to check data completeness" }, { status: 500 });
  }
}