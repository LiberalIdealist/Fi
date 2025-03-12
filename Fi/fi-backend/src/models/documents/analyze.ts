import { Request, Response } from "express";
import { storage } from "../../config/firebase.js";
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

    console.log("Analyzing document:", fileUrl);

    // Extract bucket name and file path from GCS URL
    const bucketName = process.env.GCS_BUCKET_NAME || 'your-bucket-name';
    let fileName;
    
    try {
      // Handle different URL formats
      if (fileUrl.includes(`/${bucketName}/`)) {
        fileName = fileUrl.split(`/${bucketName}/`)[1];
      } else if (fileUrl.startsWith('gs://')) {
        fileName = fileUrl.replace(`gs://${bucketName}/`, '');
      } else {
        throw new Error('Invalid file URL format');
      }
    } catch (parseError) {
      console.error("Error parsing file URL:", parseError);
      return res.status(400).json({ error: "Invalid file URL format" });
    }

    console.log(`Downloading from bucket ${bucketName}, file ${fileName}`);
    
    try {
      const file = storage.bucket(bucketName).file(fileName);
      const [exists] = await file.exists();
      
      if (!exists) {
        return res.status(404).json({ error: "File not found in storage" });
      }
      
      const [fileBuffer] = await file.download();
      console.log("File downloaded, size:", fileBuffer.length);
      
      const pdfData = await pdfParse(fileBuffer);
      const extractedText = pdfData.text;

      if (!extractedText) {
        return res.status(500).json({ error: "Could not extract text from PDF" });
      }

      console.log("Text extracted, length:", extractedText.length);
      
      // Analyze text using Google NLP
      const analysis = await analyzeText(extractedText);
      console.log("Analysis complete");

      res.json({ success: true, analysis });
    } catch (fileError) {
      console.error("File processing error:", fileError);
      const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
      return res.status(500).json({ error: "Error processing file: " + errorMessage });
    }
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}