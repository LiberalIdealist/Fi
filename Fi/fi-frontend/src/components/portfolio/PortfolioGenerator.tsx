"use client";
import { useState } from 'react';
import { portfolioService, PortfolioData } from '../../services/portfolioService';
import { useAuth } from '../../hooks/useAuth';

export default function PortfolioGenerator() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    riskTolerance: 'moderate', // low, moderate, high
    investmentTimeframe: '5-10', // years
    initialInvestment: 10000,
    monthlyContribution: 500,
    goals: '',
    age: 30,
  });
  
  const [portfolio, setPortfolio] = useState<PortfolioData | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'initialInvestment' || name === 'monthlyContribution' || name === 'age' 
        ? Number(value) 
        : value 
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Add user ID if available
      const requestData = {
        ...formData,
        userId: user?.uid
      };
      
      const response = await portfolioService.generatePortfolio(requestData);
      setPortfolio(response.portfolio);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate portfolio');
      console.error('Error generating portfolio:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Portfolio Generator</h2>
      
      {!portfolio ? (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-gray-300">Risk Tolerance</label>
              <select
                name="riskTolerance"
                value={formData.riskTolerance}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Conservative (Low Risk)</option>
                <option value="moderate">Moderate</option>
                <option value="high">Aggressive (High Risk)</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-gray-300">Investment Timeframe (Years)</label>
              <select
                name="investmentTimeframe"
                value={formData.investmentTimeframe}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0-2">Short Term (0-2 years)</option>
                <option value="2-5">Medium Term (2-5 years)</option>
                <option value="5-10">Long Term (5-10 years)</option>
                <option value="10+">Very Long Term (10+ years)</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-gray-300">Initial Investment (₹)</label>
              <input
                type="number"
                name="initialInvestment"
                value={formData.initialInvestment}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-gray-300">Monthly Contribution (₹)</label>
              <input
                type="number"
                name="monthlyContribution"
                value={formData.monthlyContribution}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-gray-300">Your Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="100"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block mb-2 text-gray-300">Financial Goals</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="Retirement, home purchase, education, etc."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Portfolio'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Your Recommended Portfolio</h3>
          
          {/* Display the portfolio data */}
          <div className="prose prose-invert max-w-none">
            {typeof portfolio === 'string' ? (
              <pre className="whitespace-pre-wrap">{portfolio}</pre>
            ) : (
              <div>
                {portfolio.allocation && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Asset Allocation</h4>
                    <ul className="space-y-2">
                      {Object.entries(portfolio.allocation).map(([asset, percentage]: [string, any]) => (
                        <li key={asset} className="flex justify-between">
                          <span>{asset}</span>
                          <span>{percentage}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {portfolio.recommendations && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Recommendations</h4>
                    <div className="whitespace-pre-wrap">{portfolio.recommendations}</div>
                  </div>
                )}
                
                {portfolio.expectedReturns && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Expected Returns</h4>
                    <div className="whitespace-pre-wrap">{portfolio.expectedReturns}</div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setPortfolio(null)}
            className="mt-6 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}