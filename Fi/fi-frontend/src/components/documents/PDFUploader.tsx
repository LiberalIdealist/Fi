"use client";

import { useState } from 'react';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../contexts/authContext';

export default function PDFUploader({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const { user } = useAuth();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check if file is PDF
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setFile(null);
      return;
    }
    
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    
    setUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Use the documentService with progress tracking
      const result = await documentService.uploadDocument(file, user.uid, (p) => {
        setProgress(p);
      }) as { usingFallback?: boolean };
      
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      // If the upload was using fallback, show a notice
      if (result.usingFallback) {
        setError('Document uploaded using local storage (limited connectivity mode)');
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-4">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6">
          <input
            type="file"
            id="pdfFile"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="pdfFile"
            className="flex flex-col items-center justify-center h-32 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-gray-400">{file ? file.name : 'Click to select a PDF file'}</span>
          </label>
        </div>
        
        {uploading && (
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
            <p className="text-sm text-gray-400 mt-1 text-center">{progress}% Uploaded</p>
          </div>
        )}
        
        {error && (
          <div className={`text-sm p-3 rounded-md ${error.includes('limited connectivity') ? 'bg-amber-900/20 text-amber-300' : 'text-red-400'}`}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={!file || uploading || !user}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </form>
  );
}