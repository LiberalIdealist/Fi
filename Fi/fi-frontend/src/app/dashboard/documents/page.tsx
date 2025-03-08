"use client";

import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import PDFUploader from '../../../components/documents/PDFUploader';
import Link from 'next/link';

export default function DocumentsPage() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    // Reset success message after 5 seconds
    setTimeout(() => {
      setUploadSuccess(false);
    }, 5000);
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Document Management</h1>
        
        {uploadSuccess && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 p-4 rounded-lg mb-6">
            Document uploaded successfully! Our AI is analyzing your document.
          </div>
        )}
        
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Upload Financial Documents</h2>
          <p className="text-gray-300 mb-6">
            Upload your financial documents (statements, reports, tax returns, etc.) for AI-powered analysis.
            We support PDF files up to 10MB.
          </p>
          
          <PDFUploader onUploadSuccess={handleUploadSuccess} />
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Document Analysis</h2>
          <p className="text-gray-300 mb-6">
            View the analysis of your uploaded documents including insights and recommendations.
          </p>
          
          <Link href="/dashboard/analysis">
            <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded">
              View Document Analysis
            </span>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}