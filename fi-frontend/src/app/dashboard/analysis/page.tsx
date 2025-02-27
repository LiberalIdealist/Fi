'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { RiLoader4Line } from 'react-icons/ri';

export default function AnalysisPage() {
  const router = useRouter();
  const [documentDetails, setDocumentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentDetails = async (documentId: string) => {
    try {
      const response = await fetch(`/api/document-details?documentId=${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document details');
      }
      const data = await response.json();
      setDocumentDetails(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch document details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { documentId } = router.query;
    if (documentId) {
      fetchDocumentDetails(documentId as string);
    }
  }, [router.query, fetchDocumentDetails, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RiLoader4Line className="animate-spin text-blue-400 mr-2" size={24} />
        <span>Loading document details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-900/30 p-4 rounded-md border border-red-800/50">
        {error}
      </div>
    );
  }

  if (!documentDetails) {
    return (
      <div className="text-gray-400 bg-gray-900/30 p-4 rounded-md border border-gray-800/50">
        No document details available.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Document Analysis</h1>
      <div className="glass-panel p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">{documentDetails.fileName}</h2>
        <p className="text-gray-300 mb-4">Uploaded on: {new Date(documentDetails.uploadedAt).toLocaleDateString()}</p>
        <div className="bg-gray-800/40 p-4 rounded-lg text-gray-300">
          {documentDetails.contentText}
        </div>
      </div>
    </div>
  );
}