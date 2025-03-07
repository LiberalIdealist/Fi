import { Response } from "express";
import { analyzeUserFinancialProfile } from "@/utils/chatGPT.js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await analyzeUserFinancialProfile(body);
    return Response.json(result);
  } catch (error) {
    console.error("Error in ChatGPT Profiling:", error);
    return Response.json({ error: "Failed to analyze profile" }, { status: 500 });
  }
}