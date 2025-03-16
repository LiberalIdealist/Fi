"use client";

import React, { useState } from 'react';
import { FiUploadCloud, FiFile, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/authContext';
import api from '../../utils/api';

// Fixed interface with proper onUploadSuccess prop
interface PDFUploaderProps {
  onUploadSuccess: () => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const validateFile = (file: File): boolean => {
    // Check file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return false;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }
    
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
      e.target.value = ''; // Reset input
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!user) {
      setError('You must be logged in to upload files.');
      return;
    }
    
    try {
      setIsUploading(true);
      setProgress(0);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);
      
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setProgress(percentCompleted);
        },
      });
      
      setIsUploading(false);
      setFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Call the success callback passed from parent
      onUploadSuccess();
    } catch (error: any) {
      setIsUploading(false);
      setError(error?.response?.data?.error || 'Upload failed. Please try again.');
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-md text-red-200 flex items-center">
          <FiAlertTriangle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="mb-4">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-700/30 border-gray-600/50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {!file ? (
              <>
                <FiUploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF only (Max 10MB)</p>
              </>
            ) : (
              <div className="flex items-center text-blue-400">
                <FiFile className="w-6 h-6 mr-2" />
                <span className="font-medium truncate max-w-xs">{file.name}</span>
              </div>
            )}
          </div>
          <input 
            id="pdf-upload"
            type="file" 
            className="hidden" 
            accept="application/pdf" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      
      {file && !isUploading && (
        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
        >
          Upload Document
        </button>
      )}
      
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-300">Uploading...</span>
            <span className="text-sm font-medium text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;