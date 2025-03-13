"use client";

import { useState } from "react";
import { useAuth } from "../../../contexts/authContext";
import DocumentAnalysis from "../../../components/analysis/DocumentAnalysis";
import AIProfileSummary from "../../../components/analysis/AIProfileSummary";
import ProtectedRoute from "../../../components/common/ProtectedRoute";
import ErrorBoundary from "../../../components/common/ErrorBoundary";

export default function AnalysisPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "documents">("profile");

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-100">Financial Analysis</h1>

        {/* Tab navigation */}
        <div className="flex mb-6 border-b border-gray-600">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "profile"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile Analysis
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "documents"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("documents")}
          >
            Document Analysis
          </button>
        </div>

        {/* Content area with improved styling */}
        <div className="mb-8">
          {activeTab === "profile" && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
              {user ? (
                <AIProfileSummary userId={user.uid} />
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-bold mb-2 text-gray-200">
                    Authentication Required
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Please log in to view your personalized profile analysis.
                  </p>
                  <a
                    href="/auth/login"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
                  >
                    Log In
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <ErrorBoundary>
              <DocumentAnalysis />
            </ErrorBoundary>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a
            href="/dashboard"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded text-center"
          >
            Back to Dashboard
          </a>
          <a
            href="/portfolio"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded text-center"
          >
            View Portfolio Recommendations
          </a>
        </div>
      </div>
    </ProtectedRoute>
  );
}