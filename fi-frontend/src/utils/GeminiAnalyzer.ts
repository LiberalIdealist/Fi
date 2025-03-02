import { QuestionnaireAnswers } from '@/types/shared';

interface AnalysisData {
  questionnaireAnswers?: QuestionnaireAnswers;
  documentText?: string;
  userInfo?: {
    name?: string | null;
    email?: string | null;
  };
  followUpAnswers?: Record<string, string>;
}

/**
 * Handles password protected document extraction and processing
 */
export async function processProtectedDocument(
  file: File,
  password: string,
  userId: string,
  documentType: 'bank' | 'credit' | 'demat' | 'tax' | 'other'
) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    formData.append('userId', userId);
    formData.append('documentType', documentType);
    
    // Upload and process via API
    const response = await fetch('/api/document-analysis/protected', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process protected document');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error processing protected document:', error);
    throw error;
  }
}

/**
 * Checks if a document is password protected
 */
export async function checkDocumentProtection(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Check for PDF encryption markers
    const pdfString = new TextDecoder().decode(bytes.slice(0, 1024));
    return pdfString.includes('/Encrypt') || 
           pdfString.includes('/EncryptMetadata') || 
           pdfString.includes('/Filter/Standard');
  } catch (error) {
    console.error('Error checking document protection:', error);
    return false;
  }
}

/**
 * Extracts and analyzes document content
 */
export async function extractAndAnalyzeDocument(file: File, userId: string): Promise<any> {
  try {
    // First check if document is protected
    const isProtected = await checkDocumentProtection(file);
    
    if (isProtected) {
      // Return special status to prompt for password
      return {
        success: false,
        requiresPassword: true,
        message: 'Document is password protected'
      };
    }
    
    // Process unprotected document
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    const response = await fetch('/api/document-analysis', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze document');
    }
    
    const result = await response.json();
    
    // Forward data to gemini.ts for comprehensive analysis
    await saveDocumentAnalysisForUser(userId, result.analysis);
    
    return {
      success: true,
      analysis: result.analysis
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
}

/**
 * Save document analysis for further processing by gemini.ts
 */
async function saveDocumentAnalysisForUser(userId: string, analysis: any) {
  try {
    await fetch('/api/document-analysis/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, analysis })
    });
  } catch (error) {
    console.error('Error saving document analysis:', error);
  }
}