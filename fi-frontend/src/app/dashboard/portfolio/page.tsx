'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { RiArrowLeftLine, RiLoader4Line, RiFileChartLine, RiRefreshLine } from 'react-icons/ri';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import PortfolioAllocation from '@/components/portfolio/PortfolioAllocation';
import SwotAnalysis from '@/components/portfolio/SwotAnalysis';
import StockRecommendations from '@/components/portfolio/StockRecommendations';
import MutualFundRecommendations from '@/components/portfolio/MutualFundRecommendations';
import InsuranceSummary from '@/components/portfolio/InsuranceSummary';

export default function PortfolioPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    fetchPortfolio();
  }, [session]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/portfolio');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      
      const data = await response.json();
      setPortfolio(data.portfolio);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Could not load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const generatePortfolio = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await fetch('/api/portfolio-generation', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate portfolio recommendations');
      }
      
      await fetchPortfolio();
    } catch (err) {
      console.error('Error generating portfolio:', err);
      setError('Failed to generate portfolio recommendations');
    } finally {
      setGenerating(false);
    }
  };

  // Check if we need to prompt to complete the questionnaire first
  if (!loading && !portfolio && !generating && !error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <RiArrowLeftLine size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Portfolio Recommendations</h1>
        </div>
        
        <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800/50 text-center">
          <div className="mb-6">
            <RiFileChartLine size={48} className="text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Complete Your Financial Profile</h2>
            <p className="text-gray-400 mb-6">
              To get personalized portfolio recommendations, first complete the financial questionnaire.
            </p>
            <Link
              href="/dashboard/gemini-questionnaire"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white inline-block"
            >
              Complete Questionnaire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <RiArrowLeftLine size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Portfolio Recommendations</h1>
        </div>
        
        <button
          onClick={generatePortfolio}
          disabled={loading || generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50"
        >
          {generating ? (
            <RiLoader4Line className="animate-spin" size={18} />
          ) : (
            <RiRefreshLine size={18} />
          )}
          {generating ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/40 text-red-300 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <p>{error}</p>
          </div>
        </div>
      )}

      {(loading || generating) && (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <RiLoader4Line className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {loading ? 'Loading portfolio data...' : 'Generating personalized recommendations...'}
            </p>
          </div>
        </div>
      )}

      {!loading && !generating && portfolio && (
        <div className="space-y-6">
          {/* Portfolio Summary */}
          <PortfolioSummary 
            summary={portfolio.summary}
            monthlyInvestment={portfolio.monthlyInvestment}
            emergencyFund={portfolio.emergencyFund}
          />
          
          {/* Portfolio Allocation Chart */}
          <PortfolioAllocation
            fixedDeposits={portfolio.fixedDeposits?.allocation || 0}
            stocks={portfolio.stocks?.reduce((sum: number, stock: any) => sum + stock.allocation, 0) || 0}
            debt={portfolio.mutualFunds?.debt?.reduce((sum: number, fund: any) => sum + fund.allocation, 0) || 0}
            hybrid={portfolio.mutualFunds?.hybrid?.reduce((sum: number, fund: any) => sum + fund.allocation, 0) || 0}
            equity={portfolio.mutualFunds?.equity?.reduce((sum: number, fund: any) => sum + fund.allocation, 0) || 0}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Recommendations */}
            <StockRecommendations stocks={portfolio.stocks || []} />
            
            {/* Mutual Fund Recommendations */}
            <MutualFundRecommendations 
              debt={portfolio.mutualFunds?.debt || []}
              hybrid={portfolio.mutualFunds?.hybrid || []}
              equity={portfolio.mutualFunds?.equity || []}
            />
          </div>
          
          {/* Insurance Summary */}
          <InsuranceSummary insurance={portfolio.insurance} />
          
          {/* SWOT Analysis */}
          <SwotAnalysis swot={portfolio.swotAnalysis} marketConditions={portfolio.marketConditions} />
          
          <div className="bg-yellow-900/20 border border-yellow-800/40 p-4 rounded-lg text-yellow-200 text-sm">
            <p className="font-medium mb-1">Disclaimer</p>
            <p>{portfolio.disclaimer || "This is a sample portfolio recommendation based on the information provided. It is not financial advice. Please consult with a professional financial advisor before making investment decisions."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
