import React from 'react';
import { RiPieChart2Line, RiMoneyDollarCircleLine, RiArrowLeftRightLine, RiAlarmWarningLine } from 'react-icons/ri';

interface FinancialHealthProps {
  data: {
    monthlyIncome?: number;
    monthlySpending?: number;
    savingsRate?: number;
    debtToIncomeRatio?: number;
    emergencyFundMonths?: number;
    dataCompleteness?: number;
  };
}

export default function FinancialHealthSummary({ data }: FinancialHealthProps) {
  const formatCurrency = (amount?: number) => {
    if (amount == null) return 'Not available';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatPercentage = (value?: number) => {
    if (value == null) return 'Not available';
    return `${(value * 100).toFixed(1)}%`;
  };
  
  const getSavingsRateStatus = (rate?: number) => {
    if (rate == null) return { status: 'unknown', color: 'gray' };
    if (rate >= 0.2) return { status: 'Excellent', color: 'text-green-400' };
    if (rate >= 0.1) return { status: 'Good', color: 'text-blue-400' };
    if (rate > 0) return { status: 'Needs improvement', color: 'text-yellow-400' };
    return { status: 'Critical', color: 'text-red-400' };
  };
  
  const getDebtRatioStatus = (ratio?: number) => {
    if (ratio == null) return { status: 'unknown', color: 'gray' };
    if (ratio < 0.1) return { status: 'Excellent', color: 'text-green-400' };
    if (ratio < 0.3) return { status: 'Good', color: 'text-blue-400' };
    if (ratio < 0.4) return { status: 'Caution', color: 'text-yellow-400' };
    return { status: 'High debt', color: 'text-red-400' };
  };
  
  const getEmergencyFundStatus = (months?: number) => {
    if (months == null) return { status: 'unknown', color: 'gray' };
    if (months >= 6) return { status: 'Excellent', color: 'text-green-400' };
    if (months >= 3) return { status: 'Good', color: 'text-blue-400' };
    if (months >= 1) return { status: 'Needs more', color: 'text-yellow-400' };
    return { status: 'Critical', color: 'text-red-400' };
  };
  
  const savingsStatus = getSavingsRateStatus(data.savingsRate);
  const debtStatus = getDebtRatioStatus(data.debtToIncomeRatio);
  const emergencyStatus = getEmergencyFundStatus(data.emergencyFundMonths);

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
      <h2 className="text-xl font-bold text-white mb-4">Financial Health Summary</h2>
      <p className="text-gray-400 mb-6">
        Based on your financial documents and questionnaire responses
      </p>
      
      <div className="space-y-6">
        {/* Income & Spending */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <RiMoneyDollarCircleLine className="text-green-400" size={20} />
                  <h3 className="text-gray-300 text-sm">Monthly Income</h3>
                </div>
                <div className="text-lg font-medium text-white">{formatCurrency(data.monthlyIncome)}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <RiPieChart2Line className="text-blue-400" size={20} />
                  <h3 className="text-gray-300 text-sm">Monthly Spending</h3>
                </div>
                <div className="text-lg font-medium text-white">{formatCurrency(data.monthlySpending)}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Financial Ratios */}
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RiArrowLeftRightLine className={savingsStatus.color} size={20} />
                  <h3 className="text-gray-300 text-sm">Savings Rate</h3>
                </div>
                <div className="text-lg font-medium text-white">{formatPercentage(data.savingsRate)}</div>
                <p className={`text-sm ${savingsStatus.color}`}>{savingsStatus.status}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RiAlarmWarningLine className={debtStatus.color} size={20} />
                  <h3 className="text-gray-300 text-sm">Debt-to-Income Ratio</h3>
                </div>
                <div className="text-lg font-medium text-white">{formatPercentage(data.debtToIncomeRatio)}</div>
                <p className={`text-sm ${debtStatus.color}`}>{debtStatus.status}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RiMoneyDollarCircleLine className={emergencyStatus.color} size={20} />
                  <h3 className="text-gray-300 text-sm">Emergency Fund</h3>
                </div>
                <div className="text-lg font-medium text-white">
                  {data.emergencyFundMonths != null ? `${data.emergencyFundMonths.toFixed(1)} months` : 'Not available'}
                </div>
                <p className={`text-sm ${emergencyStatus.color}`}>{emergencyStatus.status}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Data Completeness */}
        {data.dataCompleteness != null && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Data Completeness</span>
              <span className="text-sm text-gray-300">{data.dataCompleteness.toFixed(0)}%</span>
            </div>
            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full ${
                  data.dataCompleteness >= 70 ? 'bg-green-500' : 
                  data.dataCompleteness >= 40 ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${data.dataCompleteness}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}