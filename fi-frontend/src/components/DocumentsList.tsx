import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { RiFileTextLine, RiSearchLine, RiLoader4Line, RiFileChartLine } from 'react-icons/ri';
import Link from 'next/link';

type Document = {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  analyzedAt: string | null;
};

export default function DocumentsList() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/user-documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to load documents');
      }
    } finally {
      setLoading(false);
    }
  };

  const analyzeDocument = async (documentId: string) => {
    setAnalyzing(documentId);
    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }
      
      // Refresh the documents list to show updated analysis status
      fetchDocuments();
      
      // Redirect to document analysis view
      window.location.href = `/dashboard/documents/${documentId}`;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to analyze document');
      }
    } finally {
      setAnalyzing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RiLoader4Line className="animate-spin text-blue-400 mr-2" size={24} />
        <span>Loading documents...</span>
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

  if (documents.length === 0) {
    return (
      <div className="bg-gray-800/40 p-6 rounded-lg text-center">
        <RiFileTextLine className="mx-auto text-gray-500" size={48} />
        <p className="mt-4 text-gray-300">You haven&apos;t uploaded any documents yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Your Documents</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-gray-300 text-sm border-b border-gray-700">
            <tr>
              <th className="py-3 px-4">Document Name</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Uploaded</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-800/60 hover:bg-gray-800/20">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <RiFileTextLine className="text-blue-400 mr-2" />
                    {doc.fileName}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {Math.round(doc.fileSize / 1024)} KB
                </td>
                <td className="py-3 px-4">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {doc.analyzedAt ? (
                      <Link href={`/dashboard/documents/${doc.id}`} className="text-blue-400 hover:text-blue-300">
                        View Analysis
                      </Link>
                    ) : (
                      <button 
                        onClick={() => analyzeDocument(doc.id)}
                        disabled={analyzing === doc.id}
                        className="text-green-400 hover:text-green-300 flex items-center disabled:opacity-50"
                      >
                        {analyzing === doc.id ? (
                          <>
                            <RiLoader4Line className="animate-spin mr-1" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <RiFileChartLine className="mr-1" />
                            Analyze
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}