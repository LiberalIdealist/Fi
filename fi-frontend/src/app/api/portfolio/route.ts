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

    // Fetch the user's profile with portfolio recommendation
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        financialProfile: {
          include: {
            portfolioRecommendation: true
          }
        }
      },
    });

    if (!user || !user.financialProfile) {
      return NextResponse.json(
        { error: "Financial profile not found. Complete the questionnaire first." },
        { status: 404 }
      );
    }

    const portfolio = user.financialProfile.portfolioRecommendation;

    if (!portfolio) {
      return NextResponse.json(
        { error: "No portfolio recommendations found. Generate a portfolio first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      portfolio: {
        summary: "Here's a portfolio recommendation based on your financial profile.",
        monthlyInvestment: portfolio.monthlyInvestment,
        emergencyFund: portfolio.emergencyFund,
        fixedDeposits: portfolio.fixedDeposits,
        stocks: portfolio.stocks,
        mutualFunds: portfolio.mutualFunds,
        insurance: portfolio.insurance,
        swotAnalysis: portfolio.swotAnalysis,
        marketConditions: portfolio.marketConditions,
        disclaimer: "This is a sample portfolio and not financial advice."
      }
    });

  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}