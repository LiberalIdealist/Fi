"use client";

import { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        // In a real implementation, fetch this data from your API
        // For now using mock data
        setAnalytics({
          totalDocuments: 3,
          portfolioStatus: 'Generated',
          riskProfile: 'Moderate',
          questionnaireCompleted: true
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Financial Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
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
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-medium text-gray-400 mb-2">Risk Profile</h3>
                <p className="text-2xl font-bold">{analytics.riskProfile || 'Not Analyzed'}</p>
                <Link href="/dashboard/analysis">
                  <span className="text-blue-400 text-sm hover:underline mt-2 inline-block">
                    View Full Analysis
                  </span>
                </Link>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-medium text-gray-400 mb-2">Documents</h3>
                <p className="text-2xl font-bold">{analytics.totalDocuments}</p>
                <Link href="/dashboard/documents">
                  <span className="text-blue-400 text-sm hover:underline mt-2 inline-block">
                    Manage Documents
                  </span>
                </Link>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-medium text-gray-400 mb-2">Portfolio Status</h3>
                <p className="text-2xl font-bold">{analytics.portfolioStatus}</p>
                <Link href="/dashboard/portfolio">
                  <span className="text-blue-400 text-sm hover:underline mt-2 inline-block">
                    View Portfolio
                  </span>
                </Link>
              </div>
            </div>
            
            {/* Quick Actions */}
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link href="/dashboard/questionnaire">
                <div className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg cursor-pointer flex items-center">
                  <span className="bg-blue-500 p-2 rounded mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Update Questionnaire</span>
                </div>
              </Link>
              
              <Link href="/dashboard/documents">
                <div className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg cursor-pointer flex items-center">
                  <span className="bg-green-500 p-2 rounded mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Upload Documents</span>
                </div>
              </Link>
              
              <Link href="/dashboard/portfolio">
                <div className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg cursor-pointer flex items-center">
                  <span className="bg-purple-500 p-2 rounded mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                  </span>
                  <span>View Portfolio</span>
                </div>
              </Link>
              
              <Link href="/dashboard/chat">
                <div className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg cursor-pointer flex items-center">
                  <span className="bg-red-500 p-2 rounded mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Ask AI Assistant</span>
                </div>
              </Link>
            </div>
            
            {/* Dashboard Content - Replacing component references */}
            <h2 className="text-2xl font-bold mb-4">Your Financial Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Portfolio Summary Section - Replacing PortfolioSummary */}
              <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Portfolio Summary</h3>
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold">₹1,25,000</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Monthly Change</p>
                    <p className="text-xl font-semibold text-green-400">+1.2%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Yearly Return</p>
                    <p className="text-xl font-semibold text-green-400">+8.5%</p>
                  </div>
                </div>
                
                <h4 className="text-md font-medium mb-2 text-gray-300">Asset Allocation</h4>
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex mb-2">
                    <div className="w-full bg-gray-600 rounded-full h-4">
                      <div className="bg-blue-500 h-4 rounded-l-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                      Equity 60%
                    </div>
                    <div>
                      <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
                      Debt 25%
                    </div>
                    <div>
                      <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                      Gold 10%
                    </div>
                    <div>
                      <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-1"></span>
                      Cash 5%
                    </div>
                  </div>
                </div>
                
                <Link href="/dashboard/portfolio">
                  <span className="text-blue-400 hover:underline">View Full Portfolio →</span>
                </Link>
              </div>
              
              {/* Risk Assessment Section - Replacing RiskAssessment */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
                <div className="mb-4">
                  <p className="text-gray-400 mb-1">Your Risk Profile</p>
                  <p className="text-2xl font-bold">{analytics.riskProfile}</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          Risk Level
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-600">
                      <div style={{ width: "50%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                    </div>
                    <div className="flex text-xs justify-between">
                      <span>Low</span>
                      <span>Moderate</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm">
                  <p className="mb-2">Based on your profile, you have a moderate appetite for risk with a balanced approach to investing.</p>
                  <Link href="/dashboard/analysis">
                    <span className="text-blue-400 hover:underline">View Full Analysis →</span>
                  </Link>
                </div>
              </div>
              
              {/* Insights Section - Replacing Insights */}
              <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Financial Insights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-blue-400 mb-2">Savings Optimization</h4>
                    <p className="text-sm">Increasing your monthly SIP by ₹2,000 could grow your retirement corpus by 15% over 10 years.</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-green-400 mb-2">Tax Efficiency</h4>
                    <p className="text-sm">Consider tax-saving ELSS funds to optimize your Section 80C investments while growing your wealth.</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-400 mb-2">Portfolio Diversification</h4>
                    <p className="text-sm">Your portfolio is heavily weighted in technology. Consider adding other sectors for better diversification.</p>
                  </div>
                </div>
                
                <Link href="/dashboard/chat">
                  <span className="text-blue-400 hover:underline">Ask AI Assistant for More Insights →</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}