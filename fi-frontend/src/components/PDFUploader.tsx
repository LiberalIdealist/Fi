"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { extractTextFromPDF } from "@/utils/pdfExtractor"; // Import the function

export default function PDFUploader() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [profileStage, setProfileStage] = useState<string | null>('initial');
  const [error, setError] = useState<string | null>(null);

  const generateAIAnalysis = async () => {
    // Implement your AI analysis logic here
    console.log("Generating AI analysis...");
    // For now, just simulate a delay
    return new Promise((resolve) => setTimeout(resolve, 2000));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadStatus('uploading');
    setError(null);
    
    try {
      const files = Array.from(e.target.files);
      
      // Add uploaded document names to state
      const newDocs = files.map(f => f.name);
      setDocuments(prev => [...prev, ...newDocs]);
      
      setUploadStatus('success');
      
      // For PDFs, try to extract content
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length > 0) {
        setUploadStatus('analyzing');
        
        try {
          // Extract text from first PDF only for simplicity
          const pdfText = await extractTextFromPDF(pdfFiles[0]);
          
          // Store the extracted text for analysis
          setDocumentText(pdfText || `Document: ${pdfFiles[0].name}`);
          
          // If we have text, proceed to analysis
          setProfileStage('analysis');
          await generateAIAnalysis();
        } catch (error) {
          console.error('Error analyzing PDF:', error);
          // If PDF analysis fails, fall back to questionnaire
          setProfileStage('questionnaire');
        }
      } else {
        // No PDFs to analyze, move to questionnaire
        setProfileStage('questionnaire');
      }
      
      setUploadStatus('idle');
    } catch (err) {
      console.error('Error uploading documents:', err);
      setUploadStatus('error');
      setError('Document upload failed. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("email", session?.user?.email || "unknown");

    try {
      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setUploadStatus("Upload successful!");
      } else {
        setUploadStatus(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus("Upload failed. Try again.");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Upload Financial Documents</h2>
      <input
        type="file"
        accept="application/pdf"
        className="text-white"
        onChange={handleFileChange}
      />
      <button
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 mt-4"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
      {uploadStatus && <p className="text-white mt-2">{uploadStatus}</p>}
    </div>
  );
}
