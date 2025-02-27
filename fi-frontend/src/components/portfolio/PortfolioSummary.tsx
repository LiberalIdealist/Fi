import React from 'react';
import { RiDatabaseLine } from 'react-icons/ri';

interface PortfolioSummaryProps {
  summary: string;
  monthlyInvestment: number;
  emergencyFund: number;
}

export default function PortfolioSummary({ summary, monthlyInvestment, emergencyFund }: PortfolioSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
      <h2 className="text-xl font-bold text-white mb-4">Portfolio Summary</h2>
      <p className="text-gray-300 mb-6">{summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm">Recommended Monthly Investment</h3>
              <div className="text-lg font-medium text-white">{formatCurrency(monthlyInvestment)}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center">
              <RiDatabaseLine className="text-blue-400" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-400 text-sm">Recommended Emergency Fund</h3>
              <div className="text-lg font-medium text-white">{formatCurrency(emergencyFund)}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-900/30 flex items-center justify-center">
              <RiDatabaseLine className="text-green-400" size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}