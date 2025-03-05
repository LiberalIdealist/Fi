import { LanguageServiceClient, protos } from "@google-cloud/language";
import dotenv from "dotenv";

dotenv.config();

const client = new LanguageServiceClient();

interface NLPAnalysisResult {
  entities: string[];
  sentimentScore: number;
  sentimentMagnitude: number;
}

/**
 * Analyze text content using Google NLP
 * @param {string} text - The text to analyze
 * @returns {Promise<NLPAnalysisResult>} - Extracted entities & sentiment data
 */
export async function analyzeText(text: string): Promise<NLPAnalysisResult> {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Text input is required for NLP analysis.");
    }

    // Define Google NLP document
    const document: protos.google.cloud.language.v1.IDocument = {
      content: text,
      type: protos.google.cloud.language.v1.Document.Type.PLAIN_TEXT, // ✅ Fixed Type Error
    };

    // Perform entity analysis
    const [entityResult] = await client.analyzeEntities({ document });
    const entities: string[] =
      entityResult.entities?.map((entity) => entity.name || "").filter(Boolean) || [];

    // Perform sentiment analysis
    const [sentimentResult] = await client.analyzeSentiment({ document });
    const sentimentScore = sentimentResult.documentSentiment?.score ?? 0;
    const sentimentMagnitude = sentimentResult.documentSentiment?.magnitude ?? 0;

    return { entities, sentimentScore, sentimentMagnitude };
  } catch (error) {
    console.error("Google NLP Analysis Error:", error);
    return { entities: [], sentimentScore: 0, sentimentMagnitude: 0 };
  }
}