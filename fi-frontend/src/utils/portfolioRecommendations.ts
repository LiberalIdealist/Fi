import { FinancialProfile } from "@prisma/client";

/**
 * Generates portfolio recommendations using a different model
 * This function uses a separate model from Gemini
 */
export async function generatePortfolioRecommendations(profile: FinancialProfile) {
  try {
    const response = await fetch('/api/portfolio-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profile })
    });

    if (!response.ok) {
      throw new Error('Failed to generate portfolio recommendations');
    }

    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error("Error generating portfolio recommendations:", error);
    throw new Error("Failed to generate portfolio recommendations");
  }
}