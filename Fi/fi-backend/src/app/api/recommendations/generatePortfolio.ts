import { NextRequest, NextResponse } from "next/server";
import { generatePortfolio } from "@/utils/chatGPT";

export async function POST(req: NextRequest) {
  try {
    const userProfile = await req.json();

    if (!userProfile) {
      return NextResponse.json({ error: "User profile data is required" }, { status: 400 });
    }

    // Generate Portfolio using ChatGPT-4o
    const portfolioData = await generatePortfolio(userProfile);

    return NextResponse.json({ message: "Portfolio generated successfully", portfolio: portfolioData });
  } catch (error) {
    console.error("Error generating portfolio:", error);
    return NextResponse.json({ error: "Failed to generate portfolio" }, { status: 500 });
  }
}
export default generatePortfolio;