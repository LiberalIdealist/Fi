// src/app/dashboard/documents/page.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { RiArrowLeftLine, RiUpload2Line, RiFileTextLine } from 'react-icons/ri';

interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export default function DocumentsPage() {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const fileInput = e.target;
    
    if (!fileInput.files || fileInput.files.length === 0) {
      return;
    }
    
    setUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const file = fileInput.files![0];
      if (file) {
        setDocuments([
          ...documents, 
          { 
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date()
          }
        ]);
      }
      setUploading(false);
      // Reset the input
      fileInput.value = '';
    }, 1500);
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
    </div>
  );
}