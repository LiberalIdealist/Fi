import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const answers = await req.json();

    // Get the user's financial profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { financialProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create or update financial profile
    if (user.financialProfile) {
      // Update existing profile
      await prisma.financialProfile.update({
        where: { id: user.financialProfile.id },
        data: { responses: answers }
      });
    } else {
      // Create new profile
      await prisma.financialProfile.create({
        data: {
          userId: user.id,
          responses: answers
        }
      });
    }

    return NextResponse.json({ success: true, message: "Questionnaire submitted successfully" });

  } catch (error) {
    console.error("Error submitting questionnaire:", error);
    return NextResponse.json({ error: "Failed to submit questionnaire" }, { status: 500 });
  }
}