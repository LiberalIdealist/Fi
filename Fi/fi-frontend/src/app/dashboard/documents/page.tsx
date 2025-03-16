"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PDFUploader from '../../../components/documents/PDFUploader';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import { useAuth } from '../../../contexts/authContext';
import api from '../../../utils/api';

interface Document {
  id: string;
  name: string;
  date: string;
  type: string;
  status: 'Analyzing' | 'Analyzed' | 'Failed';
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  // Initialize as empty array to prevent undefined issues
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load documents function
  const loadDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Loading documents for user:", user.uid);
      
      // Use your API if it's ready
      // const response = await api.get('/api/documents');
      // setDocuments(response.data.documents);
      
      // Or use mock data for now
      setTimeout(() => {
        setDocuments([
          {
            id: '1',
            name: 'Bank Statement',
            date: '2023-01-10',
            type: 'PDF',
            status: 'Analyzed'
          },
          {
            id: '2',
            name: 'Investment Portfolio',
            date: '2022-12-15',
            type: 'XLSX',
            status: 'Analyzed'
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error("Error loading documents:", err);
      setError("Failed to load documents. Please try again.");
      setLoading(false);
    }
  };
  
  // Handle document upload success
  const handleUploadSuccess = () => {
    loadDocuments();
  };
  
  // Load documents when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Documents</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
          <p className="text-gray-300 mb-6">
            Upload your financial documents for AI analysis. We support PDFs, images, and spreadsheets.
          </p>
          
          <PDFUploader onUploadSuccess={handleUploadSuccess} />
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Recent Documents</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              <p>{error}</p>
              <button 
                onClick={loadDocuments}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm"
              >
                Try Again
              </button>
            </div>
          ) : documents && documents.length > 0 ? (  // Fix here: add check for documents existence
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-white">{doc.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{doc.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{doc.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doc.status === 'Analyzed' 
                            ? 'bg-green-100 text-green-800' 
                            : doc.status === 'Analyzing' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/documents/${doc.id}`} className="text-blue-400 hover:text-blue-300">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No documents uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}