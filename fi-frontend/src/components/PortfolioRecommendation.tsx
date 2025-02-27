import React from 'react';
import { RiPieChart2Line, RiBarChartBoxLine, RiShieldLine } from 'react-icons/ri';

interface PortfolioRecommendationProps {
  portfolio: any; // Use the same type from chatGptAnalyzer.ts
}

const PortfolioRecommendation: React.FC<PortfolioRecommendationProps> = ({ portfolio }) => {
  if (!portfolio) {
    return <div className="text-gray-400">Portfolio data not available</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Recommended Portfolio Allocation</h2>
      
      {/* Allocation Chart */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center">
          <RiPieChart2Line className="mr-2" /> Asset Allocation
        </h3>
        <div className="flex mb-4">
          <div 
            className="h-8 bg-blue-500 rounded-l-md" 
            style={{ width: `${portfolio.fixedDeposits.percentage}%` }}
            title={`Fixed Deposits ${portfolio.fixedDeposits.percentage}%`}
          />
          <div 
            className="h-8 bg-green-500" 
            style={{ width: `${portfolio.stocks.percentage}%` }}
            title={`Stocks ${portfolio.stocks.percentage}%`}
          />
          <div 
            className="h-8 bg-purple-500" 
            style={{ width: `${portfolio.mutualFunds.percentage}%` }}
            title={`Mutual Funds ${portfolio.mutualFunds.percentage}%`}
          />
          <div 
            className="h-8 bg-yellow-500 rounded-r-md" 
            style={{ width: `${100 - portfolio.fixedDeposits.percentage - portfolio.stocks.percentage - portfolio.mutualFunds.percentage}%` }}
            title={`Other ${100 - portfolio.fixedDeposits.percentage - portfolio.stocks.percentage - portfolio.mutualFunds.percentage}%`}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
            <span className="text-gray-300">FD: {portfolio.fixedDeposits.percentage}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span className="text-gray-300">Stocks: {portfolio.stocks.percentage}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
            <span className="text-gray-300">MF: {portfolio.mutualFunds.percentage}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
            <span className="text-gray-300">Other: {100 - portfolio.fixedDeposits.percentage - portfolio.stocks.percentage - portfolio.mutualFunds.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Fixed Deposits */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Fixed Deposits</h3>
        <div className="space-y-3">
          {portfolio.fixedDeposits.recommendations.map((fd: any, idx: number) => (
            <div key={idx} className="p-3 bg-gray-700/50 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium text-blue-300">{fd.type}</span>
                <span className="text-green-400">{fd.expectedReturn}</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">Term: {fd.term}</div>
              <div className="text-sm text-gray-400 mt-1">{fd.rationale}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stocks */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center">
          <RiBarChartBoxLine className="mr-2" /> Recommended Stocks
        </h3>
        <div className="space-y-3">
          {portfolio.stocks.recommendations.map((stock: any, idx: number) => (
            <div key={idx} className="p-3 bg-gray-700/50 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium text-blue-300">{stock.name}</span>
                <span className="text-gray-400 text-sm">{stock.sector}</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">{stock.rationale}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mutual Funds */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Mutual Funds</h3>
        
        <div className="mb-4">
          <h4 className="text-sm text-gray-400 mb-2">Debt Funds</h4>
          <div className="space-y-2">
            {portfolio.mutualFunds.debt.map((fund: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-700/50 rounded-md">
                <div className="font-medium text-blue-300">{fund.name}</div>
                <div className="text-sm text-gray-400">{fund.type}</div>
                <div className="text-sm text-gray-400 mt-1">{fund.rationale}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm text-gray-400 mb-2">Hybrid Funds</h4>
          <div className="space-y-2">
            {portfolio.mutualFunds.hybrid.map((fund: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-700/50 rounded-md">
                <div className="font-medium text-blue-300">{fund.name}</div>
                <div className="text-sm text-gray-400">{fund.type}</div>
                <div className="text-sm text-gray-400 mt-1">{fund.rationale}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm text-gray-400 mb-2">Equity Funds</h4>
          <div className="space-y-2">
            {portfolio.mutualFunds.equity.map((fund: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-700/50 rounded-md">
                <div className="font-medium text-blue-300">{fund.name}</div>
                <div className="text-sm text-gray-400">{fund.type}</div>
                <div className="text-sm text-gray-400 mt-1">{fund.rationale}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insurance */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center">
          <RiShieldLine className="mr-2" /> Insurance Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-700/50 rounded-md">
            <h4 className="font-medium text-blue-300 mb-2">Health Insurance</h4>
            <div className="text-white mb-1">Cover: {portfolio.insurance.health.coverAmount}</div>
            <div className="text-sm text-gray-400">Type: {portfolio.insurance.health.type}</div>
            <div className="text-sm text-gray-400 mt-2">{portfolio.insurance.health.rationale}</div>
          </div>
          
          <div className="p-3 bg-gray-700/50 rounded-md">
            <h4 className="font-medium text-blue-300 mb-2">Life Insurance</h4>
            <div className="text-white mb-1">Cover: {portfolio.insurance.life.coverAmount}</div>
            <div className="text-sm text-gray-400">Type: {portfolio.insurance.life.type}</div>
            <div className="text-sm text-gray-400 mt-2">{portfolio.insurance.life.rationale}</div>
          </div>
          
          <div className="p-3 bg-gray-700/50 rounded-md">
            <h4 className="font-medium text-blue-300 mb-2">Term Insurance</h4>
            <div className="text-white mb-1">Cover: {portfolio.insurance.term.coverAmount}</div>
            <div className="text-sm text-gray-400">Term: {portfolio.insurance.term.term}</div>
            <div className="text-sm text-gray-400 mt-2">{portfolio.insurance.term.rationale}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioRecommendation;