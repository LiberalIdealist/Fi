"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function PDFUploader() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
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
