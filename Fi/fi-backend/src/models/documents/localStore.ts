// This is a new file to create an in-memory document store

// Simple in-memory storage for documents when Firestore is unavailable
interface LocalDocument {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category?: string;
  fileUrl?: string;
  localUrl?: string; // For locally stored files
  size: number;
  mimeType: string;
  uploadDate: Date;
  textContent?: string;
}

class LocalDocumentStore {
  private documents: Map<string, LocalDocument> = new Map();
  private fileBlobs: Map<string, Buffer> = new Map();
  private nextId = 1;
  private analyses: Map<string, any> = new Map();
  
  // Add a new document
  addDocument(doc: Omit<LocalDocument, 'id'>): LocalDocument {
    // Generate a unique ID for the document
    const id = `local_${Date.now()}_${this.nextId++}`;
    const document = { ...doc, id };
    
    this.documents.set(id, document);
    console.log(`Saved document to local store: ${id}`);
    return document;
  }
  
  // Store file data
  storeFile(id: string, buffer: Buffer): void {
    this.fileBlobs.set(id, buffer);
  }
  
  // Get file data
  getFile(id: string): Buffer | undefined {
    return this.fileBlobs.get(id);
  }
  
  // Get all documents for a user
  getDocumentsForUser(userId: string): LocalDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }
  
  // Get a document by ID
  getDocument(id: string): LocalDocument | undefined {
    return this.documents.get(id);
  }
  
  // Delete a document
  deleteDocument(id: string): boolean {
    const deleted = this.documents.delete(id);
    if (deleted) {
      this.fileBlobs.delete(id);
      console.log(`Deleted document from local store: ${id}`);
    }
    return deleted;
  }

  // Store document analysis
  storeAnalysis(analysisId: string, analysisData: any): void {
    this.analyses.set(analysisId, analysisData);
    console.log(`Analysis stored in local store: ${analysisId}`);
  }

  // Get a specific analysis by ID
  getAnalysis(analysisId: string): any {
    return this.analyses.get(analysisId);
  }

  // Get all analyses for a document
  getAnalysesForDocument(documentId: string): any[] {
    const prefix = `analysis_${documentId.startsWith('local_') ? '' : 'cloud_'}${documentId}`;
    const results: any[] = [];
    
    this.analyses.forEach((analysis, id) => {
      if (id === prefix || id.startsWith(prefix + '_')) {
        results.push({
          id,
          ...analysis
        });
      }
    });
    
    return results;
  }

  // Get all analyses for a user
  getAnalysesForUser(userId: string): any[] {
    const results: any[] = [];
    
    this.analyses.forEach((analysis) => {
      if (analysis.userId === userId) {
        results.push(analysis);
      }
    });
    
    return results.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}

// Create a singleton instance
export const localDocumentStore = new LocalDocumentStore();