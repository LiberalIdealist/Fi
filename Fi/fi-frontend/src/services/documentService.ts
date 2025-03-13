import checkAuth from '../utils/api';

export const documentService = {
  uploadDocument: async (file: File, userId: string, onProgress?: (progress: number) => void) => {
    try {
      console.log(`Starting upload for user ${userId}, file: ${file.name}`);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('name', file.name);
      
      if (file.type) {
        formData.append('type', file.type);
      }
      
      // Check auth token before making request
      const token = localStorage.getItem('fi_auth_token');
      if (!token) {
        console.error('No auth token found');
        throw new Error('Authentication required. Please login again.');
      }
      
      // Verify API URL
      const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/upload`;
      console.log(`Uploading to: ${uploadUrl}`);
      
      return new Promise((resolve, reject) => {
        // Use XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', event => {
          if (event.lengthComputable && onProgress) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (parseError) {
              console.error('Error parsing response:', parseError);
              reject(new Error('Invalid server response'));
            }
          } else {
            let errorMessage = 'Upload failed';
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMessage = errorResponse.error || `Server error: ${xhr.status}`;
            } catch (e) {
              errorMessage = `Server error: ${xhr.status}`;
            }
            reject(new Error(errorMessage));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });
        
        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timed out'));
        });
        
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 60000; // 1 minute timeout
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      throw error;
    }
  },
  
  getDocuments: async (userId: string) => {
    try {
      const token = localStorage.getItem('fi_auth_token');
      if (!token) throw new Error('Authentication required');
      
      // First, try to get regular documents
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.statusText}`);
        }
        
        const documents = await response.json();
        
        // Next, try to get local documents and merge them
        try {
          const localResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/local?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (localResponse.ok) {
            const localDocs = await localResponse.json();
            return [...documents, ...localDocs]; 
          }
        } catch (localError) {
          console.warn('Could not fetch local documents:', localError);
          // Continue with cloud documents only
        }
        
        return documents;
      } catch (cloudError) {
        console.warn('Could not fetch cloud documents:', cloudError);
        
        // Try local documents only as fallback
        const localResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/local?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!localResponse.ok) {
          throw new Error(`Failed to fetch documents: ${localResponse.statusText}`);
        }
        
        return await localResponse.json();
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
  
  deleteDocument: async (documentId: string) => {
    try {
      const token = localStorage.getItem('fi_auth_token');
      if (!token) throw new Error('Authentication required');
      
      // Determine if it's a local document based on the ID format
      const isLocalDoc = documentId.startsWith('local_');
      const endpoint = isLocalDoc 
        ? `${process.env.NEXT_PUBLIC_API_URL}/documents/local/${documentId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
  
  // New method for document analysis
  analyzeDocument: async (documentId: string, fileUrl: string) => {
    try {
      const token = localStorage.getItem('fi_auth_token');
      if (!token) throw new Error('Authentication required');
      
      console.log(`Analyzing document: ${documentId}`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ documentId, fileUrl })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  },
  
  // Get all analyses for a user
  getAnalyses: async (userId: string) => {
    try {
      const token = localStorage.getItem('fi_auth_token');
      if (!token) throw new Error('Authentication required');
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/analyses?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch analyses: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (apiError) {
        console.warn('Could not fetch analyses from API, creating placeholders...');
        
        // Fall back to getting regular documents and creating placeholders
        const documents = await documentService.getDocuments(userId);
        
        // Generate placeholder analysis objects
        return documents.map((doc: any) => ({
          documentId: doc.id,
          documentName: doc.name,
          uploadTimestamp: doc.uploadDate ? new Date(doc.uploadDate).getTime() : Date.now(),
          fileUrl: doc.fileUrl,
          insights: [],
          needsAnalysis: true
        }));
      }
    } catch (error) {
      console.error('Error in getAnalyses:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },
  
  // Get specific document by ID
  getDocument: async (documentId: string) => {
    try {
      const token = localStorage.getItem('fi_auth_token');
      if (!token) throw new Error('Authentication required');
      
      // Determine if it's a local document
      const isLocalDoc = documentId.startsWith('local_');
      let document;
      
      if (isLocalDoc) {
        const localResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/local/${documentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!localResponse.ok) {
          throw new Error(`Failed to fetch document: ${localResponse.statusText}`);
        }
        
        document = await localResponse.json();
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }
        
        document = await response.json();
      }
      
      return document;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      throw error;
    }
  }
};

export default documentService;