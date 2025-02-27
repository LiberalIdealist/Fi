'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PDFUploader from '@/components/PDFUploader';
import DocumentsList from '@/components/DocumentsList';
import { RiArrowLeftLine } from 'react-icons/ri';
import Link from 'next/link';

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleDocumentProcessed = () => {
    // Trigger a refresh of the documents list by changing the key
    setRefreshKey(prev => prev + 1);
  };
  
  if (status === 'loading') {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    return <div className="p-8 text-center">Please sign in to access this page</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">
          <RiArrowLeftLine size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Financial Documents</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PDFUploader onDocumentProcessed={handleDocumentProcessed} />
        </div>
        
        <div className="lg:col-span-2">
          <DocumentsList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}