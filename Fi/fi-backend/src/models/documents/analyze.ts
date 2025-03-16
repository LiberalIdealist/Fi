import { Request, Response } from "express";
import { storage, db } from "../../config/firebase.js";
import { analyzeText } from "../../utils/googleNLP.js";
import { localDocumentStore } from "./localStore.js";
import pdfParse from "pdf-parse";

/**
 * Safely access Firestore to store analysis results with fallback to local storage
 * @param analysisResults Analysis data to store
 */
async function safelyStoreAnalysis(analysisResults: any): Promise<void> {
  try {
    // Ensure userId is present and valid
    if (!analysisResults.userId) {
      console.warn('Missing userId in analysis results, cannot store properly');
      throw new Error('Missing required user identification');
    }

    // Try Firestore first
    const collectionRef = db.collection('documentAnalyses');
    
    await collectionRef.add({
      ...analysisResults,
      createdAt: new Date() // Add timestamp
    });
    
    console.log(`Analysis stored successfully in Firestore for user: ${analysisResults.userId.substring(0, 8)}...`);
  } catch (dbError) {
    console.log('Failed to store analysis results in Firestore:', dbError);
    
    // Store in local storage instead
    try {
      // Check if this is a local document ID
      const isLocalDoc = analysisResults.documentId?.startsWith('local_');
      
      // Store analysis in local storage with consistent ID format
      const analysisId = `analysis_${isLocalDoc ? '' : 'cloud_'}${analysisResults.documentId}`;
      
      localDocumentStore.storeAnalysis(analysisId, {
        ...analysisResults,
        createdAt: new Date(),
        storageType: 'local' // Mark as locally stored
      });
      
      console.log(`Analysis stored successfully in local storage for user: ${analysisResults.userId.substring(0, 8)}...`);
    } catch (localError) {
      console.error('Failed to store analysis in local storage:', localError);
    }
  }
}

/**
 * Analyze uploaded PDF documents using Google NLP
 * Works with both Firebase Storage and locally stored documents
 */
export async function analyzeDocument(req: Request, res: Response) {
  try {
    // Ensure authenticated user ID is used
    const userId = req.user?.uid;
    
    // Validate user authentication
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { fileUrl, documentId } = req.body;
    
    if (!fileUrl && !documentId) {
      return res.status(400).json({ error: "Either fileUrl or documentId is required" });
    }

    // Determine if this is a local document
    const isLocalDocument = 
      (documentId && documentId.startsWith('local_')) || 
      (fileUrl && fileUrl.includes('/api/documents/local/'));
    
    console.log(`Analyzing document: ${fileUrl || documentId} (${isLocalDocument ? 'local' : 'cloud'} storage) for user: ${userId.substring(0, 8)}...`);
    
    let fileBuffer: Buffer;
    let extractedText: string;
    let documentOwnerUserId = userId; // Default to current user

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
        
        // Store the actual document owner's userId for permission checks and storage
        documentOwnerUserId = document.userId;
        
        // Check if user has permissions
        if (document.userId !== userId) {
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
        // For cloud documents, verify document ownership in Firestore
        if (documentId) {
          try {
            const docRef = db.collection('documents').doc(documentId);
            const docSnapshot = await docRef.get();
            
            if (!docSnapshot.exists) {
              return res.status(404).json({ error: "Document not found in Firestore" });
            }
            
            const docData = docSnapshot.data();
            documentOwnerUserId = docData?.userId;
            
            // Verify ownership
            if (docData?.userId !== userId) {
              return res.status(403).json({ error: "Access denied to this document" });
            }
          } catch (firestoreError) {
            console.warn("Failed to verify document ownership, proceeding with current user:", firestoreError);
            // Continue with current user ID if Firestore check fails
          }
        }

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
      // Analyze text using Google NLP
      const analysis = await analyzeText(extractedText);
      console.log("NLP Analysis complete");
      
      // Prepare results for storage and response
      const analysisResults = {
        documentId,
        userId: documentOwnerUserId, // Always use the document owner's ID
        analyzedAt: new Date(),
        ...analysis,
        statistics: {
          wordCount: extractedText.split(/\s+/).length,
          characterCount: extractedText.length,
          sentenceCount: extractedText.split(/[.!?]+/).filter(s => s.trim()).length
        }
      };
      
      // Store results
      await safelyStoreAnalysis(analysisResults);

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