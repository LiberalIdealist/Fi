"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Link from 'next/link';

interface AnalyticsSummary {
  totalDocuments: number;
  portfolioStatus: string;
  riskProfile?: string;
  questionnaireCompleted: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalDocuments: 0,
    portfolioStatus: 'Not Generated',
    questionnaireCompleted: false
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Simple debug output
  console.log("Dashboard render:", { user: user?.uid || null, dataLoaded });

  // Load data once we have a user
  useEffect(() => {
    if (!user) return;
    
    console.log("Dashboard: User available, loading data");
    
    // Mock data loading
    setAnalytics({
      totalDocuments: 3,
      portfolioStatus: 'Generated',
      riskProfile: 'Moderate',
      questionnaireCompleted: true
    });
    
    setDataLoaded(true);
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Financial Dashboard</h1>
        
        {/* Welcome section */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.displayName || 'Investor'}</h2>
          <p className="text-gray-300 mb-4">Here's your financial overview and next actions.</p>
          
          {!analytics.questionnaireCompleted && (
            <Link href="/dashboard/questionnaire">
              <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded">
                Complete Your Profile
              </span>
            </Link>
          )}
        </div>
        
        {/* Analytics summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-medium mb-4">Documents</h3>
            <p className="text-3xl font-bold">{analytics.totalDocuments}</p>
            <p className="text-gray-400 mt-2">Uploaded documents</p>
            <Link href="/dashboard/documents">
              <span className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
                Manage Documents →
              </span>
            </Link>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-medium mb-4">Portfolio Status</h3>
            <p className="text-3xl font-bold">{analytics.portfolioStatus}</p>
            <p className="text-gray-400 mt-2">Current status</p>
            <Link href="/dashboard/portfolio">
              <span className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
                View Portfolio →
              </span>
            </Link>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-medium mb-4">Risk Profile</h3>
            <p className="text-3xl font-bold">{analytics.riskProfile || 'Not Assessed'}</p>
            <p className="text-gray-400 mt-2">Your risk tolerance</p>
            <Link href="/dashboard/risk-assessment">
              <span className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
                Risk Assessment →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}