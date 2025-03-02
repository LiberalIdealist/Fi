import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) { // Changed from email to id
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers } = await _req.json();
    const userId = session.user.id;

    const existingProfile = await prisma.financialProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      await prisma.financialProfile.update({
        where: { userId },
        data: { 
          // Changed from responses to questionnaireResponses
          questionnaireResponses: answers, 
          updatedAt: new Date() 
        },
      });
    } else {
      await prisma.financialProfile.create({
        data: { 
          userId,
          // Changed from responses to questionnaireResponses
          questionnaireResponses: answers,
          // Add required fields based on your schema
          riskScore: 5, // Default risk score
          financialGoals: [], // Empty array for required field
          insights: [] // Empty array for required field
        },
      });
    }

    return NextResponse.json({ message: "Profile saved successfully" });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Use userId (always available) instead of email
    const userId = session.user.id;
    
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        financialProfile: true,
      },
    });
    
    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    
    // Return safe profile info
    return NextResponse.json({
      id: userProfile.id,
      email: userProfile.email, // Get from DB data, not session
      name: userProfile.name,
      profile: userProfile.financialProfile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const userId = session.user.id; // Use ID instead of email
    const data = await request.json();
    
    // Rest of your PUT handler...
  } catch (error) {
    // Error handling...
  }
}
