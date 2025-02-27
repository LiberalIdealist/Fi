"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { extractTextFromPDF } from "@/utils/pdfExtractor";
import { RiFileUploadLine, RiFileTextLine, RiLoader4Line } from "react-icons/ri";

type PDFUploaderProps = {
  onDocumentProcessed: (documentId: string) => void;
};

export default function PDFUploader({ onDocumentProcessed }: PDFUploaderProps) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadStatus('File selected: ' + file.name);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !session?.user?.email) {
      setError('Please select a file and ensure you are logged in');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');
    setError(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', selectedFile.name);
      formData.append('userEmail', session.user.email);

      // Send to API endpoint
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      const data = await response.json();
      setUploadStatus('Upload successful! Processing document...');
      
      // Start processing phase
      setIsProcessing(true);
      
      // Call the onDocumentProcessed callback with the document ID
      onDocumentProcessed(data.documentId);
      
      setUploadStatus('Document processed successfully!');
      setSelectedFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Upload Financial Document</h2>
      
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="sr-only">Choose PDF file</span>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-500 file:text-white
                    hover:file:bg-blue-600
                    cursor-pointer disabled:opacity-50"
            disabled={uploading || isProcessing}
          />
        </label>
        
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading || isProcessing}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
                   text-white py-2 px-4 rounded-md disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <>
              <RiLoader4Line className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <RiFileUploadLine />
              Upload Document
            </>
          )}
        </button>
        
        {uploadStatus && (
          <div className="text-sm text-gray-300 mt-2">
            {isProcessing ? (
              <div className="flex items-center">
                <RiLoader4Line className="animate-spin mr-2" />
                {uploadStatus}
              </div>
            ) : (
              uploadStatus
            )}
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md border border-red-800/50 mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
