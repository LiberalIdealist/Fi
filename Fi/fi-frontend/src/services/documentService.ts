import api from '../utils/api';

export const documentService = {
  uploadFile: async (file: File, userId: string) => {
    try {
      console.log(`Starting upload for user ${userId}, file: ${file.name}`);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      // Check auth token before making request
      const token = localStorage.getItem('fi_auth_token');
      if (!token) {
        console.error('No auth token found');
        throw new Error('Authentication required. Please login again.');
      }
      
      // Verify API URL
      const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/upload`;
      console.log(`Uploading to: ${uploadUrl}`);
      
      // Add explicit debugging for the request
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percentComplete}%`);
          // Call a progress callback function
        }
      });
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type with FormData - browser sets it with boundary
        },
        body: formData
      });
      
      // Log response status
      console.log(`Upload response status: ${response.status}`);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response:', contentType);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200) + '...');
        throw new Error('Server returned an invalid response format');
      }
      
      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.error || `Server error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  
  // Other document-related methods...
  getDocuments: async (userId: string) => {
    // implementation...
  },
  
  deleteDocument: async (documentId: string) => {
    // implementation...
  }
};