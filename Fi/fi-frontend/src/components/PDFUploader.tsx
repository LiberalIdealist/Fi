"use client";

import { useState } from "react";

export default function PDFUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`Upload successful: ${result.fileName}`);
      } else {
        setMessage(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      setMessage("Error uploading file.");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">Upload Financial Documents</h2>
      <input
        type="file"
        accept=".pdf"
        className="w-full bg-gray-800 text-white p-2 rounded mb-4"
        onChange={handleFileChange}
      />
      <button
        className={`w-full py-2 rounded ${
          uploading ? "bg-gray-600" : "bg-blue-500 hover:bg-blue-700"
        }`}
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}