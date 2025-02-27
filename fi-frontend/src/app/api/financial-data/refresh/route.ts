import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";
import { updateFinancialProfileData } from "@/utils/financialDataAggregator";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's financial profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { financialProfile: true }
    });

    if (!user || !user.financialProfile) {
      return NextResponse.json({ error: "Financial profile not found" }, { status: 404 });
    }

    // Update the financial profile data
    await updateFinancialProfileData(user.financialProfile.id);

    return NextResponse.json({
      success: true,
      message: "Financial data refreshed successfully"
    });
  } catch (error) {
    console.error("Error refreshing financial data:", error);
    return NextResponse.json({ error: "Failed to refresh financial data" }, { status: 500 });
  }
}