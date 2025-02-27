"use client";

import { useState, useEffect } from "react";
import FinancialHealthSummary from "@/components/FinancialHealthSummary";
import FinancialInsights from "@/components/FinancialInsights";
import { RiUploadCloud2Line, RiAlertLine, RiCheckLine, RiRefreshLine } from "react-icons/ri";
import Link from "next/link";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [completeness, setCompleteness] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [refreshingInsights, setRefreshingInsights] = useState(false);

  // Fetch all financial data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch financial data completeness
        const completenessRes = await fetch('/api/financial-data-completeness');
        const completenessData = await completenessRes.json();

        if (!completenessData.error) {
          setCompleteness(completenessData);
        }

        // If financial profile exists, fetch more data
        if (completenessData.financialData) {
          // Fetch financial insights
          const insightsRes = await fetch('/api/financial-insights');
          const insightsData = await insightsRes.json();
          
          if (!insightsData.error) {
            setInsights(insightsData.insights);
          }
          
          setFinancialData(completenessData.financialData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load your financial dashboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefreshInsights = async () => {
    setRefreshingInsights(true);
    try {
      const res = await fetch('/api/financial-insights?refresh=true');
      const data = await res.json();
      
      if (!data.error) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error("Error refreshing insights:", err);
    } finally {
      setRefreshingInsights(false);
    }
  };

  const handleRefreshFinancialData = async () => {
    setLoading(true);
    try {
      await fetch('/api/refresh-financial-data', {
        method: 'POST'
      });
      
      // Refetch all data after refresh
      const completenessRes = await fetch('/api/financial-data-completeness');
      const completenessData = await completenessRes.json();
      setCompleteness(completenessData);
      setFinancialData(completenessData.financialData);
      
    } catch (err) {
      console.error("Error refreshing financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-lg">
          <div className="flex items-center gap-3 mb-3">
            <RiAlertLine className="text-red-400 text-xl" />
            <h2 className="text-lg font-medium text-white">Error Loading Dashboard</h2>
          </div>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show onboarding message if no financial data yet
  if (!financialData) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Welcome to Your Financial Dashboard</h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            To get started with personalized financial insights and portfolio recommendations,
            you'll need to upload some financial documents and complete a short questionnaire.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-10">
            <Link 
              href="/questionnaire" 
              className="flex flex-col items-center p-6 bg-blue-900/20 border border-blue-800/30 rounded-xl hover:bg-blue-900/30 transition-colors"
            >
              <div className="bg-blue-500/20 p-3 rounded-full mb-4">
                <RiCheckLine className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Complete Questionnaire</h3>
              <p className="text-gray-400 text-center">
                Tell us about your financial goals and risk tolerance
              </p>
            </Link>

            <Link 
              href="/documents" 
              className="flex flex-col items-center p-6 bg-purple-900/20 border border-purple-800/30 rounded-xl hover:bg-purple-900/30 transition-colors"
            >
              <div className="bg-purple-500/20 p-3 rounded-full mb-4">
                <RiUploadCloud2Line className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Upload Documents</h3>
              <p className="text-gray-400 text-center">
                Upload bank statements, salary slips, and investment documents
              </p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      {/* Data Completeness Banner */}
      <div className="mb-6">
        <div className={`rounded-xl p-4 flex items-center justify-between ${
          completeness?.overallCompleteness >= 80 
            ? 'bg-green-900/20 border border-green-800/30' 
            : 'bg-blue-900/20 border border-blue-800/30'
        }`}>
          <div>
            <h2 className="text-lg font-medium text-white mb-1">
              {completeness?.overallCompleteness >= 80 
                ? 'Your financial profile is complete!' 
                : 'Complete your financial profile'}
            </h2>
            <p className="text-gray-300 text-sm">
              {completeness?.overallCompleteness >= 80 
                ? 'You have provided all essential financial information needed for accurate recommendations.' 
                : 'Add more financial documents to improve the accuracy of your insights and recommendations.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Data completeness:</span>
                <span className="text-white font-medium">{completeness?.overallCompleteness}%</span>
              </div>
              <div className="w-40 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    completeness?.overallCompleteness >= 80 ? 'bg-green-500' :
                    completeness?.overallCompleteness >= 60 ? 'bg-blue-500' :
                    completeness?.overallCompleteness >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${completeness?.overallCompleteness || 0}%` }}
                ></div>
              </div>
            </div>
            {completeness?.overallCompleteness < 80 && (
              <Link 
                href="/documents"
                className="bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-md text-white text-sm"
              >
                Upload Documents
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health Summary */}
        <div className="lg:col-span-1">
          <FinancialHealthSummary data={financialData} />

          {completeness?.recommendations && completeness.recommendations.length > 0 && (
            <div className="mt-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
              <h2 className="text-xl font-bold text-white mb-4">Recommendations</h2>
              <ul className="space-y-3">
                {completeness.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <button
                  onClick={handleRefreshFinancialData}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  <RiRefreshLine className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Updating...' : 'Refresh Financial Data'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Financial Insights */}
        <div className="lg:col-span-2">
          {insights ? (
            <FinancialInsights 
              insights={insights} 
              onRefresh={handleRefreshInsights} 
              loading={refreshingInsights}
            />
          ) : (
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-3">Financial Insights</h2>
              <p className="text-gray-300 mb-4">
                We need more financial data to generate insights.
                Please upload additional financial documents.
              </p>
              <Link 
                href="/documents" 
                className="inline-block bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-white transition-colors"
              >
                Upload Documents
              </Link>
            </div>
          )}

          {/* Portfolio Recommendations - Preview/Link */}
          <div className="mt-6 bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Portfolio Recommendations</h2>
              <Link 
                href="/portfolio" 
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                View Full Portfolio →
              </Link>
            </div>
            <p className="text-gray-400 mt-2">
              View your personalized investment portfolio recommendations based on your financial profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
