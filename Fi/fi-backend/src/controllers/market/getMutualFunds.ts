import { Response } from "express";

export async function GET() {
  try {
    const response = await fetch("https://api.mfapi.in/mf"); // AMFI API endpoint
    if (!response.ok) {
      throw new Error(`Failed to fetch mutual funds: ${response.statusText}`);
    }

    const mutualFunds = await response.json();
    return Response.json(mutualFunds);
  } catch (error) {
    console.error("Error fetching mutual funds:", error);
    return Response.json({ error: "Failed to fetch mutual funds" }, { status: 500 });
  }
}