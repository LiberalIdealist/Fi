import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingProfile = await prisma.financialProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      await prisma.financialProfile.update({
        where: { userId: user.id },
        data: { responses: answers, updatedAt: new Date() },
      });
    } else {
      await prisma.financialProfile.create({
        data: { userId: user.id, responses: answers },
      });
    }

    return NextResponse.json({ message: "Profile saved successfully" });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
