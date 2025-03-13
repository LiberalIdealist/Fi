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
}

// Create a singleton instance
export const localDocumentStore = new LocalDocumentStore();