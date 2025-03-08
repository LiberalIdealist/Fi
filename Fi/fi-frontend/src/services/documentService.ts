import api from '../utils/api';

export const documentService = {
  // Upload document for analysis
  uploadDocument: (formData: FormData) => 
    api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  
  // Get document analysis results
  getDocumentAnalysis: (documentId: string) => 
    api.get(`/documents/analyze/${documentId}`),
  
  // Delete document
  deleteDocument: (documentId: string) => 
    api.delete(`/documents/delete/${documentId}`)
};