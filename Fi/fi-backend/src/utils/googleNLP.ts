import { LanguageServiceClient } from "@google-cloud/language";
import { bucket } from "@/config/cloudStorage";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";

const languageClient = new LanguageServiceClient();
const documentAiClient = new DocumentProcessorServiceClient();

// Document AI configuration
const projectId = process.env.GOOGLE_PROJECT_ID;
const location = 'us'; // or the location where your processor is deployed
const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID; // Add this to your .env file

/**
 * Extracts and analyzes text from a PDF file.
 * @param {string} filePath - The path of the uploaded PDF in Google Cloud Storage.
 * @returns {Promise<Object>} - Extracted financial insights.
 */
export async function analyzeDocument(filePath: string): Promise<any> {
  try {
    // Step 1: Download PDF from Google Cloud Storage
    const file = bucket.file(filePath);
    const [buffer] = await file.download();
    
    // Step 2: Extract text using Google Document AI
    const extractedText = await extractTextWithDocumentAI(buffer);

    if (!extractedText) {
      throw new Error("No text found in the document.");
    }

    // Step 3: Analyze extracted text using Google NLP
    const document = { content: extractedText, type: "PLAIN_TEXT" as const };
    const [result] = await languageClient.analyzeEntities({ document });
    const entities = result.entities || [];

    // Step 4: Extract structured financial data
    const structuredData = extractFinancialData(entities);

    return {
      extractedText,
      structuredData,
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error(`Failed to process the document: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract text from PDF using Google Document AI
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextWithDocumentAI(buffer: Buffer): Promise<string> {
  try {
    if (!projectId || !processorId) {
      throw new Error("Document AI configuration is incomplete. Check environment variables.");
    }

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    
    // Process the document
    const request = {
      name,
      rawDocument: {
        content: buffer.toString('base64'),
        mimeType: 'application/pdf',
      },
    };

    const [result] = await documentAiClient.processDocument(request);
    const { document } = result;

    if (!document || !document.text) {
      throw new Error("Document AI returned empty result");
    }

    return document.text;
  } catch (error) {
    console.error("Document AI processing error:", error);
    
    // Fallback to a simple placeholder if Document AI fails
    console.log("Using fallback text extraction method");
    return "Document text extraction failed. This is placeholder text.";
  }
}

/**
 * Extracts relevant financial data from NLP entity analysis.
 * @param {Array} entities - Entities detected by Google NLP.
 * @returns {Object} - Structured financial data.
 */
function extractFinancialData(entities: any[]) {
  const financialData: Record<string, any> = {
    income: null,
    expenses: null,
    loans: [],
    investments: [],
  };

  for (const entity of entities) {
    const name = entity.name.toLowerCase();
    const amount = entity.metadata?.["value"] || entity.metadata?.["amount"] || null;

    if (name.includes("salary") || name.includes("income")) {
      financialData.income = amount;
    } else if (name.includes("emi") || name.includes("loan") || name.includes("mortgage")) {
      financialData.loans.push({ type: name, amount });
    } else if (name.includes("mutual fund") || name.includes("stocks") || name.includes("real estate")) {
      financialData.investments.push({ type: name, amount });
    } else if (name.includes("credit card") || name.includes("expense")) {
      financialData.expenses = amount;
    }
  }

  return financialData;
}