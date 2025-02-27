"use client";

import { useState, useEffect } from "react";
import { RiArrowLeftLine, RiAlertLine, RiRefreshLine, RiFileDownloadLine, RiBarChart2Line } from "react-icons/ri";
import Link from "next/link";

export default function Portfolio() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setPortfolio(data.portfolio);
        }
      } catch (err) {
        console.error("Error fetching portfolio:", err);
        setError("Failed to load your portfolio recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const handleGeneratePortfolio = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/portfolio-generation', {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setPortfolio(data.portfolio);
      }
    } catch (err) {
      console.error("Error generating portfolio:", err);
      setError("Failed to generate portfolio recommendations.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your portfolio recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-6">
          <RiArrowLeftLine /> Back to Dashboard
        </Link>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <RiAlertLine className="text-red-400 text-xl" />
            <h2 className="text-lg font-medium text-white">Error Loading Portfolio</h2>
          </div>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={handleGeneratePortfolio}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>Generate New Portfolio</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-6">
          <RiArrowLeftLine /> Back to Dashboard
        </Link>
        
        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-8 text-center">
          <div className="bg-blue-500/10 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <RiBarChart2Line className="text-blue-400 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Create Your Portfolio</h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Generate personalized investment recommendations based on your financial profile,
            risk tolerance, and financial documents.
          </p>
          <button 
            onClick={handleGeneratePortfolio}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-md transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {generating ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Generating Your Portfolio...
              </>
            ) : (
              <>Generate Portfolio Recommendations</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
          <RiArrowLeftLine /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGeneratePortfolio}
            disabled={generating}
            className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            {generating ? <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div> : <RiRefreshLine />}
            {generating ? 'Generating...' : 'Regenerate'}
          </button>
          <button className="text-white bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm flex items-center gap-1">
            <RiFileDownloadLine /> Export PDF
          </button>
        </div>
      </div>

      {/* Portfolio Header */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-3">Your Investment Portfolio</h1>
        <p className="text-gray-300 mb-4">{portfolio.summary}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Recommended Monthly Investment</div>
            <div className="text-xl font-medium text-white">₹{portfolio.monthlyInvestment.toLocaleString('en-IN')}</div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Emergency Fund</div>
            <div className="text-xl font-medium text-white">₹{portfolio.emergencyFund.toLocaleString('en-IN')}</div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Current Market Condition</div>
            <div className="text-lg font-medium text-white truncate">{portfolio.marketConditions?.split('.')[0]}</div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Last Updated</div>
            <div className="text-lg font-medium text-white">Today</div>
          </div>
        </div>
      </div>

      {/* Main Portfolio Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Fixed Deposits */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Fixed Deposits</h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Allocation</span>
                <span className="text-white">{portfolio.fixedDeposits.allocation}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: `${portfolio.fixedDeposits.allocation}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">{portfolio.fixedDeposits.duration}</span>
              </div>
              <p className="text-gray-300 text-sm">{portfolio.fixedDeposits.notes}</p>
            </div>
          </div>
          
          {/* Insurance */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Insurance Recommendations</h2>
            
            {/* Health Insurance */}
            <div className="mb-5 pb-5 border-b border-gray-800/50">
              <h3 className="text-white font-medium mb-2">Health Insurance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cover Amount</span>
                  <span className="text-white">₹{portfolio.insurance.health.coverAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Premium</span>
                  <span className="text-white">₹{portfolio.insurance.health.premium?.toLocaleString('en-IN')}/year</span>
                </div>
                <p className="text-gray-300 text-sm">{portfolio.insurance.health.notes}</p>
              </div>
            </div>
            
            {/* Term Insurance */}
            <div className="mb-5 pb-5 border-b border-gray-800/50">
              <h3 className="text-white font-medium mb-2">Term Insurance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cover Amount</span>
                  <span className="text-white">₹{portfolio.insurance.term.coverAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Premium</span>
                  <span className="text-white">₹{portfolio.insurance.term.premium?.toLocaleString('en-IN')}/year</span>
                </div>
                <p className="text-gray-300 text-sm">{portfolio.insurance.term.notes}</p>
              </div>
            </div>
            
            {/* Life Insurance */}
            <div>
              <h3 className="text-white font-medium mb-2">Life Insurance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cover Amount</span>
                  <span className="text-white">₹{portfolio.insurance.life.coverAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Premium</span>
                  <span className="text-white">₹{portfolio.insurance.life.premium?.toLocaleString('en-IN')}/year</span>
                </div>
                <p className="text-gray-300 text-sm">{portfolio.insurance.life.notes}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column (wider) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stocks */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recommended Stocks</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Ticker</th>
                    <th className="pb-3">Allocation</th>
                    <th className="pb-3">Rationale</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {portfolio.stocks.map((stock: any, i: number) => (
                    <tr key={i} className="border-t border-gray-800/50">
                      <td className="py-3 text-white">{stock.name}</td>
                      <td className="py-3">{stock.ticker}</td>
                      <td className="py-3">{stock.allocation}%</td>
                      <td className="py-3 text-sm">{stock.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Mutual Funds */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Mutual Fund Recommendations</h2>
            
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Equity Funds</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="pb-3">Fund Name</th>
                      <th className="pb-3">Allocation</th>
                      <th className="pb-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {portfolio.mutualFunds.equity.map((fund: any, i: number) => (
                      <tr key={i} className="border-t border-gray-800/50">
                        <td className="py-3 text-white">{fund.name}</td>
                        <td className="py-3">{fund.allocation}%</td>
                        <td className="py-3">{fund.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Hybrid Funds</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="pb-3">Fund Name</th>
                      <th className="pb-3">Allocation</th>
                      <th className="pb-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {portfolio.mutualFunds.hybrid.map((fund: any, i: number) => (
                      <tr key={i} className="border-t border-gray-800/50">
                        <td className="py-3 text-white">{fund.name}</td>
                        <td className="py-3">{fund.allocation}%</td>
                        <td className="py-3">{fund.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-3">Debt Funds</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="pb-3">Fund Name</th>
                      <th className="pb-3">Allocation</th>
                      <th className="pb-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {portfolio.mutualFunds.debt.map((fund: any, i: number) => (
                      <tr key={i} className="border-t border-gray-800/50">
                        <td className="py-3 text-white">{fund.name}</td>
                        <td className="py-3">{fund.allocation}%</td>
                        <td className="py-3">{fund.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* SWOT Analysis */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Portfolio SWOT Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-green-400 font-medium mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {portfolio.swotAnalysis.strengths.map((strength: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-yellow-400 font-medium mb-3">Weaknesses</h3>
                <ul className="space-y-2">
                  {portfolio.swotAnalysis.weaknesses.map((weakness: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-blue-400 font-medium mb-3">Opportunities</h3>
                <ul className="space-y-2">
                  {portfolio.swotAnalysis.opportunities.map((opportunity: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-red-400 font-medium mb-3">Threats</h3>
                <ul className="space-y-2">
                  {portfolio.swotAnalysis.threats.map((threat: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{threat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="text-gray-400 text-sm border-t border-gray-800/50 pt-4">
            <strong>Disclaimer:</strong> {portfolio.disclaimer || "The recommendations provided are for informational purposes only and do not constitute financial advice. Consult with a professional financial advisor before making investment decisions."}
          </div>
        </div>
      </div>
    </div>
  );
}