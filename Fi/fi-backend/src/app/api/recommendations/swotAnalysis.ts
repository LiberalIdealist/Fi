import { NextRequest, NextResponse } from "next/server";
import { generateSWOTAnalysis } from "@/utils/chatGPT";

export async function POST(req: NextRequest) {
  try {
    const { portfolio } = await req.json();

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio data is required" }, { status: 400 });
    }

    // Generate SWOT Analysis using ChatGPT-4o
    const swotResult = await generateSWOTAnalysis(portfolio);

    return NextResponse.json({ message: "SWOT analysis completed", swot: swotResult });
  } catch (error) {
    console.error("Error generating SWOT analysis:", error);
    return NextResponse.json({ error: "Failed to generate SWOT analysis" }, { status: 500 });
  }
}