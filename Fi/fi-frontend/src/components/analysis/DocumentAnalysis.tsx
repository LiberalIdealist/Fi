"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';
import { documentService } from '../../services/documentService';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { HiDocumentText, HiOutlineDocumentSearch } from 'react-icons/hi';
import { BiError } from 'react-icons/bi';

// Define interfaces based on the backend response structure
export interface DocumentAnalysisResult {
  documentId: string;
  documentName: string;
  uploadTimestamp: number;
  fileUrl?: string;
  analyzed?: boolean;
  needsAnalysis?: boolean;
  error?: string;
  source?: string;  // 'cloud' or 'local'
  insights?: string[];
  financialData?: {
    [key: string]: any;
  };
  entities?: Array<{
    name: string;
    type: string;
    salience: number;
  }>;
  sentiment?: {
    score: number;
    magnitude: number;
  };
  statistics?: {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
  };
}

export default function DocumentAnalysis() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<DocumentAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzeLoading, setAnalyzeLoading] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getDocuments(user.uid);
      setDocuments(docs);
      await fetchAnalyses(docs);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyses = async (docs: any[]) => {
    try {
      // Try to get existing analyses from the API
      try {
        const data = await documentService.getAnalyses(user.uid);
        if (data && data.length > 0) {
          setAnalyses(data);
          return;
        }
      } catch (e) {
        console.warn('Could not fetch analyses from API, will analyze on demand');
      }

      // If no analyses found, create placeholders for each document
      const placeholderAnalyses = docs.map(doc => ({
        documentId: doc.id,
        documentName: doc.name,
        uploadTimestamp: doc.uploadDate ? new Date(doc.uploadDate).getTime() : Date.now(),
        fileUrl: doc.fileUrl,
        insights: [],
        needsAnalysis: true
      }));

      setAnalyses(placeholderAnalyses);
    } catch (error) {
      console.error('Error preparing analyses:', error);
      // Continue showing documents even if analyses fail
    }
  };

  const analyzeDocument = async (docId: string, fileUrl: string) => {
    try {
      setAnalyzeLoading(prev => ({ ...prev, [docId]: true }));

      const result = await documentService.analyzeDocument(docId, fileUrl);

      if (result.success) {
        // Generate insights from analysis
        const insights = generateInsightsFromAnalysis(result.analysis);

        // Update the analyses list with the new results
        setAnalyses(prev => prev.map(a => 
          a.documentId === docId 
            ? { 
                ...a, 
                insights,
                entities: result.analysis.entities,
                sentiment: result.analysis.sentiment,
                statistics: result.analysis.statistics,
                analyzed: true,
                source: result.source
              } 
            : a
        ));

        // Auto-select the analyzed document
        setSelectedDocId(docId);
      }
    } catch (err: any) {
      console.error('Error analyzing document:', err);
      setAnalyses(prev => prev.map(a => 
        a.documentId === docId 
          ? { ...a, error: err.message || 'Analysis failed' } 
          : a
      ));
    } finally {
      setAnalyzeLoading(prev => ({ ...prev, [docId]: false }));
    }
  };

  // Add this helper function to generate insights from analysis results
  const generateInsightsFromAnalysis = (analysis: any): string[] => {
    const insights: string[] = [];

    // Add insights based on entities
    if (analysis.entities?.length) {
      const topEntities = analysis.entities
        .filter((e: any) => e.salience > 0.05)
        .slice(0, 5)
        .map((e: any) => e.name)
        .join(', ');

      insights.push(`Key topics identified: ${topEntities}`);
    }

    // Add sentiment-based insights
    if (analysis.sentiment) {
      const { score, magnitude } = analysis.sentiment;

      if (score > 0.3) {
        insights.push(`This document contains predominantly positive language (sentiment score: ${score.toFixed(2)})`);
      } else if (score < -0.3) {
        insights.push(`This document contains predominantly negative language (sentiment score: ${score.toFixed(2)})`);
      } else {
        insights.push(`This document contains neutral language (sentiment score: ${score.toFixed(2)})`);
      }

      if (magnitude > 3) {
        insights.push(`The document shows strong emotional content (magnitude: ${magnitude.toFixed(2)})`);
      }
    }

    // Add statistics-based insights
    if (analysis.statistics) {
      const { wordCount, sentenceCount } = analysis.statistics;

      if (wordCount > 1000) {
        insights.push(`Comprehensive document with ${wordCount} words`);
      } else if (wordCount < 300) {
        insights.push(`Brief document with only ${wordCount} words`);
      }

      // Calculate average sentence length
      const avgSentenceLength = sentenceCount ? Math.round(wordCount / sentenceCount) : 0;
      if (avgSentenceLength > 25) {
        insights.push(`Complex writing style with long sentences (avg ${avgSentenceLength} words per sentence)`);
      } else if (avgSentenceLength < 10 && avgSentenceLength > 0) {
        insights.push(`Concise writing style with short sentences (avg ${avgSentenceLength} words per sentence)`);
      }
    }

    // Add fallback insight if none were generated
    if (insights.length === 0) {
      insights.push('Basic document analysis completed');
    }

    return insights;
  };

  const toggleDocumentDetails = (docId: string) => {
    setSelectedDocId(selectedDocId === docId ? null : docId);
  };

  // Delete document and its analysis
  const handleDelete = async (docId: string) => {
    try {
      await documentService.deleteDocument(docId);
      setDocuments(documents.filter(doc => doc.id !== docId));
      setAnalyses(analyses.filter(analysis => analysis.documentId !== docId));
      if (selectedDocId === docId) {
        setSelectedDocId(null);
      }
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center">
          <AiOutlineLoading3Quarters className="animate-spin text-blue-500 text-3xl mb-3" />
          <p className="text-gray-300">Loading your documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg">
        <p className="font-bold flex items-center">
          <BiError className="mr-2 text-xl" /> Error:
        </p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 bg-red-800/60 hover:bg-red-700/60 text-white py-1 px-4 rounded text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <HiDocumentText className="text-4xl mb-2 text-gray-400 mx-auto" />
        <h3 className="text-xl font-bold mb-2 text-gray-200">No Documents Found</h3>
        <p className="text-gray-400 mb-4">
          Upload some documents to analyze their financial content.
        </p>
        <a
          href="/documents"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
        >
          Upload Documents
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-100">Document Analysis</h2>
        <a 
          href="/documents" 
          className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
        >
          <span className="mr-1">+</span> Upload More
        </a>
      </div>
      
      <p className="text-gray-300">
        View insights extracted from your financial documents.
      </p>
      
      <div className="space-y-4">
        {documents.map(doc => {
          const analysis = analyses.find(a => a.documentId === doc.id);
          const isSelected = selectedDocId === doc.id;
          const isAnalyzing = analyzeLoading[doc.id];
          const needsAnalysis = analysis?.needsAnalysis;
          
          return (
            <div key={doc.id} className="bg-gray-800/70 rounded-lg overflow-hidden border border-gray-700">
              <div 
                className="p-4 hover:bg-gray-700/40 flex justify-between items-center cursor-pointer"
                onClick={() => toggleDocumentDetails(doc.id)}
              >
                <div className="flex items-center">
                  <div className="bg-gray-700 p-2 rounded mr-3">
                    <HiDocumentText className="text-blue-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg text-gray-200">{doc.name}</h3>
                    <p className="text-sm text-gray-400">
                      {doc.uploadDate 
                        ? new Date(doc.uploadDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) 
                        : 'Recent upload'}
                    </p>
                  </div>
                </div>
                <div className="text-blue-500">
                  {isSelected ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              
              {isSelected && (
                <div className="p-5 border-t border-gray-700">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <AiOutlineLoading3Quarters className="animate-spin text-blue-400 text-3xl mb-3" />
                      <p className="text-gray-300">Analyzing document contents...</p>
                    </div>
                  ) : needsAnalysis ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-gray-800/50 rounded-lg border border-gray-700">
                      <HiOutlineDocumentSearch className="text-3xl mb-3 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">Document needs analysis</h3>
                      <p className="text-gray-400 mb-4 text-center max-w-md">
                        This document hasn't been analyzed yet. Click the button below to extract insights.
                      </p>
                      <button
                        onClick={() => analyzeDocument(doc.id, doc.fileUrl)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Analyze Document
                      </button>
                    </div>
                  ) : analysis?.error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                      <p className="text-red-300 mb-2">Analysis failed: {analysis.error}</p>
                      <button
                        onClick={() => analyzeDocument(doc.id, doc.fileUrl)}
                        className="bg-red-600/40 hover:bg-red-600/60 text-white py-1 px-4 rounded text-sm mt-2"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : analysis?.insights?.length > 0 ? (
                    <>
                      {/* Document Insights */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium mb-3 text-blue-300 flex items-center">
                          <span className="bg-blue-500/20 p-1 rounded mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                            </svg>
                          </span>
                          Document Insights
                        </h4>
                        <div className="space-y-2">
                          {analysis.insights.map((insight, idx) => (
                            <div key={idx} className="bg-gray-700/40 p-3 rounded-md">
                              <p className="text-gray-200">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Document Statistics */}
                      {analysis.statistics && (
                        <div className="mb-6">
                          <h4 className="text-md font-medium mb-3 text-green-300 flex items-center">
                            <span className="bg-green-500/20 p-1 rounded mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                              </svg>
                            </span>
                            Document Statistics
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-700/40 p-3 rounded-lg">
                              <div className="text-xs text-gray-400">Word Count</div>
                              <div className="font-medium text-gray-200 text-lg">{analysis.statistics.wordCount}</div>
                            </div>
                            <div className="bg-gray-700/40 p-3 rounded-lg">
                              <div className="text-xs text-gray-400">Characters</div>
                              <div className="font-medium text-gray-200 text-lg">{analysis.statistics.characterCount}</div>
                            </div>
                            <div className="bg-gray-700/40 p-3 rounded-lg">
                              <div className="text-xs text-gray-400">Sentences</div>
                              <div className="font-medium text-gray-200 text-lg">{analysis.statistics.sentenceCount}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Entities */}
                      {analysis.entities && analysis.entities.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-md font-medium mb-3 text-purple-300 flex items-center">
                            <span className="bg-purple-500/20 p-1 rounded mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            </span>
                            Key Entities
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700/50">
                              <thead className="bg-gray-700/30">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entity</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Relevance</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-700/50">
                                {analysis.entities.slice(0, 5).map((entity: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-gray-700/20">
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-200">{entity.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-300">{entity.type}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                                        <div 
                                          className="bg-blue-500 h-1.5 rounded-full" 
                                          style={{ width: `${entity.salience * 100}%` }}
                                        ></div>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      {/* Sentiment */}
                      {analysis.sentiment && (
                        <div className="mb-6">
                          <h4 className="text-md font-medium mb-3 text-yellow-300 flex items-center">
                            <span className="bg-yellow-500/20 p-1 rounded mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                              </svg>
                            </span>
                            Sentiment Analysis
                          </h4>
                          <div className="bg-gray-700/40 p-4 rounded-lg">
                            <div className="mb-2">
                              <span className="text-sm text-gray-400">Document Sentiment:</span>
                              <span className="ml-2 px-2 py-1 text-sm rounded-full
                                {analysis.sentiment.score > 0.3 ? 'bg-green-500/20 text-green-300' : 
                                 analysis.sentiment.score < -0.3 ? 'bg-red-500/20 text-red-300' : 
                                 'bg-yellow-500/20 text-yellow-300'}">
                                {analysis.sentiment.score > 0.3 ? 'Positive' : 
                                 analysis.sentiment.score < -0.3 ? 'Negative' : 
                                 'Neutral'}
                              </span>
                            </div>
                            
                            <div className="flex items-center mb-1">
                              <span className="text-xs text-gray-400 w-20">Negativity</span>
                              <div className="flex-grow">
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                  <div 
                                    className="bg-red-500 h-1.5 rounded-full" 
                                    style={{ width: `${Math.max(0, -analysis.sentiment.score * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400 w-20 text-right">Positivity</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full" 
                                style={{ width: `${Math.max(0, analysis.sentiment.score * 100)}%` }}
                              ></div>
                            </div>
                            
                            <div className="mt-3">
                              <span className="text-xs text-gray-400">Emotion Intensity:</span>
                              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-purple-500 h-1.5 rounded-full" 
                                  style={{ width: `${analysis.sentiment.magnitude * 10}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Source info */}
                      {analysis.source && (
                        <div className="text-xs text-gray-500 mt-2">
                          Analysis source: {analysis.source === 'local' ? 'Local text processing' : 'Cloud API'}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-6 text-center text-gray-400">
                      <p>No analysis data available for this document.</p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex justify-between mt-6 pt-3 border-t border-gray-700">
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      View Document
                    </a>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-400 hover:text-red-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}