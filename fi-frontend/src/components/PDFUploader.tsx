"use client";

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineFileAdd, AiOutlineDelete, AiOutlineCheckCircle } from 'react-icons/ai';
import { BiError } from 'react-icons/bi';

// Update the onDocumentProcessed prop to include all necessary metadata
interface PDFUploaderProps {
  onDocumentProcessed: (data: {
    documentId: string;
    documentType: 'bank' | 'credit' | 'demat' | 'tax' | 'other';
    fileName: string;
    analysisStatus?: 'pending' | 'complete' | 'error';
  }) => void;
}

export default function PDFUploader({ onDocumentProcessed }: PDFUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [documentType, setDocumentType] = useState<'bank' | 'credit' | 'demat' | 'tax' | 'other'>('bank');
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle file drop
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    onDrop: (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
      setUploadStatus(prev => {
        const newStatus: Record<string, 'pending' | 'success' | 'error'> = { ...prev };
        acceptedFiles.forEach(file => {
          newStatus[file.name] = 'pending';
        });
        return newStatus;
      });
    }
  });

  // Check if the PDF is password protected
  const checkPasswordProtection = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/check-pdf-protection', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error checking PDF protection: ${response.status}`);
      }
      
      const data = await response.json();
      return data.isPasswordProtected === true;
    } catch (error) {
      console.error('Error checking password protection:', error);
      return false;
    }
  };

  // Upload and store document for later analysis
  const uploadDocument = async (file: File) => {
    setCurrentFile(file);
    setUploading(true);
    setError(null);
    
    try {
      // First check if password is required
      const needsPassword = await checkPasswordProtection(file);
      
      if (needsPassword && !password) {
        setPasswordRequired(true);
        setUploading(false);
        return;
      }
      
      // Create form data with file and metadata
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      if (password) {
        formData.append('password', password);
      }
      
      // Upload to document storage endpoint
      const response = await fetch('/api/store-document', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle password required error
        if (response.status === 401) {
          setPasswordRequired(true);
          setUploading(false);
          return;
        }
        
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update status
      setUploadStatus(prev => ({
        ...prev,
        [file.name]: 'success'
      }));
      
      // Notify parent component
      onDocumentProcessed({
        documentId: result.documentId,
        documentType: documentType,
        fileName: file.name
      });

      // After successful upload, add this to trigger immediate analysis with Natural Language
      if (result.documentId) {
        // Queue document for Natural Language analysis
        await fetch('/api/analyze-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentId: result.documentId,
            documentType
          })
        });
      }
      
      // Reset password if it was used
      if (password) {
        setPassword('');
        setPasswordRequired(false);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      
      setUploadStatus(prev => ({
        ...prev,
        [file.name]: 'error'
      }));
    } finally {
      setUploading(false);
      setCurrentFile(null);
    }
  };

  // Upload all pending files
  const uploadAllFiles = async () => {
    for (const file of files) {
      if (uploadStatus[file.name] === 'pending') {
        await uploadDocument(file);
        // Break if password is required for this file
        if (passwordRequired) break;
      }
    }
  };

  // Remove file from the list
  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  // Handle password submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentFile) {
      uploadDocument(currentFile);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
      <h2 className="text-xl font-semibold text-white mb-4">Upload Financial Documents</h2>
      <p className="text-gray-400 mb-6">
        Upload bank statements, credit card statements, demat account statements, or tax documents for comprehensive analysis.
      </p>
      
      {/* Document Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as any)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="bank">Bank Statement</option>
          <option value="credit">Credit Card Statement</option>
          <option value="demat">Demat Account Statement</option>
          <option value="tax">Tax Document</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      {/* Dropzone for file upload */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >
        <input {...getInputProps()} />
        <AiOutlineFileAdd className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-400">
          Drag &amp; drop PDF files here, or click to select files
        </p>
      </div>
      
      {/* Password Modal */}
      {passwordRequired && (
        <div className="mt-4 p-4 border border-yellow-700 bg-yellow-900/20 rounded-lg">
          <h3 className="text-white font-medium mb-2">Password Protected PDF</h3>
          <p className="text-gray-300 text-sm mb-3">
            Please enter the password for: {currentFile?.name}
          </p>
          <form onSubmit={handlePasswordSubmit} className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              placeholder="Enter password"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-white font-medium mb-2">Files</h3>
          <ul className="space-y-2">
            {files.map(file => (
              <li key={file.name} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                <span className="text-gray-300 truncate">{file.name}</span>
                <div className="flex items-center">
                  {uploadStatus[file.name] === 'success' && (
                    <AiOutlineCheckCircle className="text-green-500 h-5 w-5 mr-2" />
                  )}
                  {uploadStatus[file.name] === 'error' && (
                    <BiError className="text-red-500 h-5 w-5 mr-2" />
                  )}
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <AiOutlineDelete className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          
          {files.some(file => uploadStatus[file.name] === 'pending') && (
            <button
              onClick={uploadAllFiles}
              disabled={uploading}
              className={`mt-4 w-full py-2 rounded-lg ${
                uploading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload All Files'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
