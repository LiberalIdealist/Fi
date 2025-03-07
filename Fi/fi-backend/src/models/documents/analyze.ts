import { Request, Response } from "express";
import { storage as bucket } from "../../config/firebase.js";
import { analyzeText } from "../../utils/googleNLP.js";
import pdfParse from "pdf-parse";

/**
 * Analyzes uploaded PDF documents using Google NLP
 */
export async function analyzeDocument(req: Request, res: Response) {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    // Download the file from Google Cloud Storage
    const bucketName = process.env.GCS_BUCKET_NAME as string;
    const fileName = fileUrl.split(`/${bucketName}/`)[1];
    const file = bucket.file(fileName);

    const [fileBuffer] = await file.download();
    const pdfData = await pdfParse(fileBuffer);
    const extractedText = pdfData.text;

    if (!extractedText) {
      return res.status(500).json({ error: "Could not extract text from PDF" });
    }

    // Analyze text using Google NLP
    const analysis = await analyzeText(extractedText);

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}