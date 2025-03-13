import { Request, Response } from "express";
import { storage } from "../../config/firebase.js";
import { analyzeText } from "../../utils/googleNLP.js";
import { localDocumentStore } from "./localStore.js";
import pdfParse from "pdf-parse";

/**
 * Analyzes uploaded PDF documents using Google NLP
 * Works with both Firebase Storage and locally stored documents
 */
export async function analyzeDocument(req: Request, res: Response) {
  try {
    const { fileUrl, documentId } = req.body;
    
    if (!fileUrl && !documentId) {
      return res.status(400).json({ error: "Either fileUrl or documentId is required" });
    }

    // Determine if this is a local document
    const isLocalDocument = 
      (documentId && documentId.startsWith('local_')) || 
      (fileUrl && fileUrl.includes('/api/documents/local/'));
    
    console.log(`Analyzing document: ${fileUrl || documentId} (${isLocalDocument ? 'local' : 'cloud'} storage)`);
    
    let fileBuffer: Buffer;
    let extractedText: string;

    // CASE 1: Local document
    if (isLocalDocument) {
      try {
        // Extract the document ID if it wasn't directly provided
        const localDocId = documentId || fileUrl.split('/local/')[1];
        
        if (!localDocId) {
          return res.status(400).json({ error: "Invalid local document reference" });
        }
        
        // Get the document and file from local storage
        const document = localDocumentStore.getDocument(localDocId);
        
        if (!document) {
          return res.status(404).json({ error: "Local document not found" });
        }
        
        // Check if user has permissions (if req.user is available)
        if (req.user && document.userId !== req.user.uid) {
          return res.status(403).json({ error: "Access denied to this document" });
        }
        
        // Get file buffer from local storage
        fileBuffer = localDocumentStore.getFile(localDocId) as Buffer;
        
        if (!fileBuffer) {
          return res.status(404).json({ error: "Local file content not found" });
        }
        
        console.log("Retrieved local file, size:", fileBuffer.length);
        
        // If document has pre-extracted text content, use it
        if (document.textContent) {
          extractedText = document.textContent;
          console.log("Using pre-extracted text content");
        } else {
          // Otherwise parse the PDF
          if (document.mimeType === 'application/pdf') {
            const pdfData = await pdfParse(fileBuffer);
            extractedText = pdfData.text;
            console.log("Text extracted from local PDF, length:", extractedText.length);
          } else if (document.mimeType.startsWith('text/')) {
            extractedText = fileBuffer.toString('utf-8');
            console.log("Converted text file to string, length:", extractedText.length);
          } else {
            return res.status(400).json({ error: "Unsupported file type for analysis" });
          }
        }
      } catch (localError) {
        console.error("Error processing local document:", localError);
        return res.status(500).json({ 
          error: "Error processing local document", 
          details: localError instanceof Error ? localError.message : 'Unknown error' 
        });
      }
    }
    // CASE 2: Cloud storage document
    else {
      try {
        const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'wealthme-fi.firebasestorage.app';
        let fileName: string;

        // Extract file path from URL
        try {
          if (fileUrl.includes(`${bucketName}`)) {
            // Handle format like https://storage.googleapis.com/bucket-name/path
            const urlObj = new URL(fileUrl);
            fileName = urlObj.pathname.split('/').slice(2).join('/');
          } else if (fileUrl.startsWith('gs://')) {
            // Handle gs:// format
            fileName = fileUrl.replace(`gs://${bucketName}/`, '');
          } else {
            throw new Error('Unsupported file URL format');
          }
        } catch (parseError) {
          console.error("Error parsing file URL:", parseError);
          return res.status(400).json({ error: "Invalid file URL format" });
        }

        console.log(`Downloading from bucket ${bucketName}, file ${fileName}`);
        
        // Download file from Firebase Storage
        const file = storage.bucket(bucketName).file(fileName);
        const [exists] = await file.exists();
        
        if (!exists) {
          return res.status(404).json({ error: "File not found in storage" });
        }
        
        [fileBuffer] = await file.download();
        console.log("File downloaded, size:", fileBuffer.length);
        
        // Parse the PDF content
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;

        if (!extractedText) {
          return res.status(500).json({ error: "Could not extract text from PDF" });
        }

        console.log("Text extracted from cloud PDF, length:", extractedText.length);
      } catch (cloudError) {
        console.error("Error processing cloud document:", cloudError);
        return res.status(500).json({ 
          error: "Error processing cloud document", 
          details: cloudError instanceof Error ? cloudError.message : 'Unknown error'
        });
      }
    }

    // Common processing for both document sources
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(500).json({ error: "No text content could be extracted for analysis" });
    }
    
    try {
      // Try to use Google NLP for more advanced analysis
      let entities: any[] = [];
      let sentiment = { score: 0, magnitude: 0 };

      try {
        // Import and use NLP analysis
        const { analyzeText } = await import('../../utils/googleNLP.js');
        
        // Only analyze a reasonable amount of text (first 100KB)
        const textToAnalyze = extractedText.substring(0, 100000); 
        
        const nlpResult = await analyzeText(textToAnalyze);
        entities = nlpResult.entities.map(e => ({ name: e, type: 'UNKNOWN', salience: 1 }));
        sentiment = { 
          score: nlpResult.sentimentScore, 
          magnitude: nlpResult.sentimentMagnitude 
        };
      } catch (nlpError) {
        console.warn('Google NLP analysis failed, using basic analysis:', nlpError);
        
        // Basic entity extraction as fallback (extract capitalized words)
        const words = extractedText.split(/\s+/);
        const extractedEntities = new Set<string>();
        
        words.forEach(word => {
          const cleanWord = word.replace(/[.,;:!?()]/g, '');
          if (cleanWord.length > 3 && /^[A-Z][a-z]/.test(cleanWord)) {
            extractedEntities.add(cleanWord);
          }
        });
        
        entities = Array.from(extractedEntities).slice(0, 20).map(name => ({
          name,
          type: 'UNKNOWN',
          salience: 1
        }));
      }

      // Word count and other statistics
      const wordCount = extractedText.split(/\s+/).length;
      const characterCount = extractedText.length;
      const sentenceCount = extractedText.split(/[.!?]+/).filter(s => s.trim()).length;

      // Extract some key phrases as insights
      const sentencesArr = extractedText.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const insights = sentencesArr
        .filter((_s, i) => i % Math.ceil(sentencesArr.length / 5) === 0)  // Get ~5 evenly spaced sentences
        .slice(0, 5)
        .map(s => s.trim());

      // Save analysis results
      const analysisResults = {
        documentId,
        userId: req.user ? req.user.uid : null,
        analyzedAt: new Date(),
        statistics: {
          wordCount,
          characterCount,
          sentenceCount
        },
        entities,
        sentiment,
        insights,
        source: isLocalDocument ? 'local' : 'cloud'
      };

      res.json({ 
        success: true, 
        analysis: analysisResults,
        source: isLocalDocument ? 'local' : 'cloud',
        textLength: extractedText.length
      });
    } catch (analysisError) {
      console.error("Text analysis error:", analysisError);
      return res.status(500).json({ 
        error: "Error analyzing document content", 
        details: analysisError instanceof Error ? analysisError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error("General analysis error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Enhanced version of analyzeText with fallback to avoid NLP API errors
 */
export async function analyzeDocumentText(text: string): Promise<any> {
  try {
    // Try Google NLP
    const nlpResults = await analyzeText(text);
    return {
      source: 'google-nlp',
      ...nlpResults
    };
  } catch (error) {
    console.error("Google NLP failed, using fallback analysis:", error);
    
    // Simple fallback analysis
    return {
      source: 'fallback',
      entities: extractBasicEntities(text),
      sentimentScore: 0,
      sentimentMagnitude: 0
    };
  }
}

/**
 * Very basic entity extraction as fallback
 */
function extractBasicEntities(text: string): string[] {
  // Extract potential entities (capitalized words that aren't at the start of sentences)
  const words = text.split(/\s+/);
  const entities = new Set<string>();
  
  // Financial terms to look for
  const financialTerms = [
    'stock', 'bond', 'dividend', 'interest', 'investment', 'portfolio',
    'retirement', 'IRA', '401k', 'fund', 'ETF', 'mutual', 'index', 'market',
    'asset', 'liability', 'debt', 'credit', 'loan', 'mortgage', 'insurance',
    'tax', 'income', 'expense', 'savings', 'budget', 'cash', 'equity'
  ];
  
  // Find capitalized words and financial terms
  words.forEach(word => {
    const cleanWord = word.replace(/[.,;:!?()]/g, '');
    
    if (cleanWord.length > 2) {
      // Check if word starts with capital letter
      if (/^[A-Z][a-z]/.test(cleanWord)) {
        entities.add(cleanWord);
      }
      
      // Check if word is a financial term
      if (financialTerms.some(term => 
        cleanWord.toLowerCase().includes(term.toLowerCase()))) {
        entities.add(cleanWord);
      }
    }
  });
  
  return Array.from(entities).slice(0, 30); // Limit to 30 entities
}