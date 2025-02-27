import React from 'react';

interface PortfolioAllocationProps {
  fixedDeposits: number;
  stocks: number;
  debt: number;
  hybrid: number;
  equity: number;
}

export default function PortfolioAllocation({
  fixedDeposits,
  stocks,
  debt,
  hybrid,
  equity,
}: PortfolioAllocationProps) {
  // Normalize percentages to ensure they sum to 100%
  const total = fixedDeposits + stocks + debt + hybrid + equity;
  const normalize = (value: number) => (total > 0 ? (value / total) * 100 : 0);

  const normalizedData = {
    fixedDeposits: normalize(fixedDeposits),
    stocks: normalize(stocks),
    debt: normalize(debt),
    hybrid: normalize(hybrid),
    equity: normalize(equity),
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
      <h2 className="text-xl font-bold text-white mb-6">Portfolio Allocation</h2>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Chart visualization */}
        <div className="w-full md:w-1/2 flex-shrink-0">
          <div className="relative h-60 w-60 mx-auto">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${normalizedData.fixedDeposits}%`,
                  float: 'left',
                }}
              ></div>
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${normalizedData.stocks}%`,
                  float: 'left',
                }}
              ></div>
              <div
                className="h-full bg-yellow-500"
                style={{
                  width: `${normalizedData.debt}%`,
                  float: 'left',
                }}
              ></div>
              <div
                className="h-full bg-purple-500"
                style={{
                  width: `${normalizedData.hybrid}%`,
                  float: 'left',
                }}
              ></div>
              <div
                className="h-full bg-red-500"
                style={{
                  width: `${normalizedData.equity}%`,
                  float: 'left',
                }}
              ></div>
            </div>
            <div className="absolute inset-4 bg-gray-900 rounded-full"></div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 w-full md:w-1/2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-300">Fixed Deposits</span>
            </div>
            <span className="text-white font-medium">{normalizedData.fixedDeposits.toFixed(1)}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-300">Stocks</span>
            </div>
            <span className="text-white font-medium">{normalizedData.stocks.toFixed(1)}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-300">Debt Mutual Funds</span>
            </div>
            <span className="text-white font-medium">{normalizedData.debt.toFixed(1)}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-gray-300">Hybrid Mutual Funds</span>
            </div>
            <span className="text-white font-medium">{normalizedData.hybrid.toFixed(1)}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-300">Equity Mutual Funds</span>
            </div>
            <span className="text-white font-medium">{normalizedData.equity.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}