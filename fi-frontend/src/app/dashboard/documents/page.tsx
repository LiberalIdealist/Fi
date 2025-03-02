'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { RiArrowLeftLine, RiUpload2Line, RiFileTextLine } from 'react-icons/ri';
import { extractAndAnalyzeDocument, processProtectedDocument, checkDocumentProtection } from '@/utils/GeminiAnalyzer';

interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  analysis?: any;
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const fileInput = e.target;
    
    if (!fileInput.files || fileInput.files.length === 0 || !session?.user?.id) {
      return;
    }
    
    setError(null);
    setUploading(true);
    const file = fileInput.files[0];
    setCurrentFile(file);
    
    try {
      // Check if document is password protected
      const isProtected = await checkDocumentProtection(file);
      
      if (isProtected) {
        setPasswordRequired(true);
        setUploading(false);
        return;
      }
      
      // Process unprotected document
      const result = await extractAndAnalyzeDocument(file, session.user.id);
      
      if (result.success) {
        setDocuments([
          ...documents, 
          { 
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
            analysis: result.analysis
          }
        ]);
        
        // Show the analysis
        setAnalysis(result.analysis);
      } else {
        setError(result.message || 'Failed to analyze document');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setUploading(false);
      // Reset the input
      fileInput.value = '';
    }
  };

  const handlePasswordSubmit = async () => {
    if (!currentFile || !password || !session?.user?.id) {
      return;
    }
    
    setUploading(true);
    
    try {
      const result = await processProtectedDocument(
        currentFile, 
        password, 
        session.user.id, 
        'bank' // Or detect the type
      );
      
      if (result.success) {
        setDocuments([
          ...documents, 
          { 
            id: Date.now().toString(),
            name: currentFile.name,
            size: currentFile.size,
            type: currentFile.type,
            uploadedAt: new Date(),
            analysis: result.analysis
          }
        ]);
        
        // Show the analysis
        setAnalysis(result.analysis);
        setPasswordRequired(false);
        setPassword('');
      } else {
        setError(result.message || 'Failed to process protected document');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">
          <RiArrowLeftLine size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Documents</h1>
      </div>
      
      {/* Upload Section */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        <h2 className="text-lg font-semibold text-white mb-4">Upload Documents</h2>
        
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
          <RiUpload2Line className="mx-auto text-gray-500 mb-4" size={40} />
          <p className="text-gray-400 mb-4">Drag and drop files here, or click to select files</p>
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer ${
              uploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            {uploading ? 'Uploading...' : 'Select File'}
          </label>
        </div>
      </div>
      
      {/* Document List */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        <h2 className="text-lg font-semibold text-white mb-4">Your Documents</h2>
        
        {documents.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <RiFileTextLine className="mx-auto mb-3" size={30} />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                <RiFileTextLine className="text-blue-400 mr-3" size={20} />
                <div>
                  <div className="text-white">{doc.name}</div>
                  <div className="text-xs text-gray-400">
                    {doc.uploadedAt.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password dialog */}
      {passwordRequired && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Password Required</h3>
            <p className="text-gray-300 mb-4">This document is password protected. Please enter the password to continue.</p>
            
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded mb-4"
              placeholder="Enter document password"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={handlePasswordSubmit}
                disabled={!password || uploading}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "Processing..." : "Submit"}
              </button>
              
              <button
                onClick={() => {
                  setPasswordRequired(false);
                  setCurrentFile(null);
                  setPassword('');
                }}
                className="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Analysis display */}
      {analysis && (
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
          <h2 className="text-lg font-semibold text-white mb-4">Document Analysis</h2>
          
          {/* Account Summary */}
          {analysis.accountSummary && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Account Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-gray-400 text-sm">Balance</div>
                  <div className="text-lg font-semibold text-white">
                    ₹{analysis.accountSummary.totalBalance?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-gray-400 text-sm">Total Inflow</div>
                  <div className="text-lg font-semibold text-green-400">
                    ₹{analysis.accountSummary.totalInflow?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="text-gray-400 text-sm">Total Outflow</div>
                  <div className="text-lg font-semibold text-red-400">
                    ₹{analysis.accountSummary.totalOutflow?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Key Insights */}
          {analysis.insights && analysis.insights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Key Insights</h3>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <ul className="list-disc pl-5 text-gray-200 space-y-2">
                  {analysis.insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Transactions */}
          {analysis.transactions && analysis.transactions.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-2">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-800/70">
                    <tr>
                      <th className="py-2 px-4 text-left text-gray-300">Date</th>
                      <th className="py-2 px-4 text-left text-gray-300">Description</th>
                      <th className="py-2 px-4 text-left text-gray-300">Category</th>
                      <th className="py-2 px-4 text-right text-gray-300">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {analysis.transactions.slice(0, 10).map((tx: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-800/30">
                        <td className="py-2 px-4 text-gray-300">{tx.date}</td>
                        <td className="py-2 px-4 text-gray-300">{tx.description}</td>
                        <td className="py-2 px-4 text-gray-300">{tx.category}</td>
                        <td className={`py-2 px-4 text-right ${tx.type === 'debit' ? 'text-red-400' : 'text-green-400'}`}>
                          {tx.type === 'debit' ? '-' : '+'}₹{tx.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}