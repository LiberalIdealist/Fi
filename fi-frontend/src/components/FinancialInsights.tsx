import React, { useState } from 'react';
import { RiErrorWarningLine, RiShieldCheckLine, RiArrowRightUpLine, RiLightbulbLine, RiRefreshLine } from 'react-icons/ri';
import { motion } from 'framer-motion';

interface InsightsProps {
  insights: {
    summary: string;
    keyObservations: string[];
    strengths: string[];
    improvementAreas: string[];
    actionableAdvice: string[];
    savingsRate: {
      current: number | null;
      recommended: number;
      analysis: string;
    };
    debtManagement: {
      status: 'Good' | 'Concerning' | 'Critical';
      analysis: string;
    };
    emergencyFund: {
      currentMonths: number | null;
      recommendedMonths: number;
      analysis: string;
    };
    investmentStrategy: {
      recommendation: 'Conservative' | 'Moderate' | 'Aggressive';
      analysis: string;
    };
    generatedAt?: string;
  };
  onRefresh?: () => void;
  loading?: boolean;
}

export default function FinancialInsights({ insights, onRefresh, loading = false }: InsightsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'metrics'>('overview');
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good': return 'text-green-400';
      case 'concerning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'conservative': return 'text-blue-400';
      case 'moderate': return 'text-yellow-400';
      case 'aggressive': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };
  
  const getProgressColor = (current: number | null, recommended: number) => {
    if (current === null) return 'bg-gray-600';
    if (current >= recommended) return 'bg-green-500';
    if (current >= recommended * 0.75) return 'bg-blue-500';
    if (current >= recommended * 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-800/50">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold text-white">Financial Insights</h2>
          <button 
            onClick={onRefresh} 
            disabled={loading}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm bg-blue-900/20 px-2 py-1 rounded-md transition-colors"
          >
            <RiRefreshLine className={`${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
        <p className="text-gray-400 text-sm">
          Last updated: {formatDate(insights.generatedAt)}
        </p>
        <div className="mt-4">
          <p className="text-white">{insights.summary}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-800/50">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium flex-1 ${
              activeTab === 'overview' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 text-sm font-medium flex-1 ${
              activeTab === 'actions' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Action Steps
          </button>
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 text-sm font-medium flex-1 ${
              activeTab === 'metrics' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Financial Metrics
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Key Observations */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <RiLightbulbLine className="text-blue-400" />
                Key Observations
              </h3>
              <ul className="space-y-2">
                {insights.keyObservations.map((observation, index) => (
                  <li key={index} className="text-gray-300 text-sm bg-gray-800/30 p-3 rounded-lg">
                    {observation}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Strengths and Improvement Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <RiShieldCheckLine className="text-green-400" />
                  Financial Strengths
                </h3>
                <ul className="space-y-2">
                  {insights.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <RiErrorWarningLine className="text-yellow-400" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {insights.improvementAreas.map((area, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'actions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <RiArrowRightUpLine className="text-blue-400" />
              Recommended Action Steps
            </h3>
            
            <div className="space-y-3">
              {insights.actionableAdvice.map((advice, index) => (
                <div key={index} className="bg-gray-800/30 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start">
                    <div className="bg-blue-500/20 text-blue-400 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-200 ml-3">{advice}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'metrics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Savings Rate */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">Savings Rate</h3>
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">Current: {formatPercentage(insights.savingsRate.current)}</div>
                <div className="text-gray-400 text-sm">Recommended: {formatPercentage(insights.savingsRate.recommended)}</div>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full rounded-full ${getProgressColor(
                    insights.savingsRate.current, 
                    insights.savingsRate.recommended
                  )}`}
                  style={{ 
                    width: insights.savingsRate.current !== null 
                      ? `${Math.min(100, (insights.savingsRate.current / insights.savingsRate.recommended) * 100)}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <p className="text-gray-300 text-sm">{insights.savingsRate.analysis}</p>
            </div>
            
            {/* Debt Management */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">Debt Management</h3>
                <span className={`text-sm ${getStatusColor(insights.debtManagement.status)}`}>
                  {insights.debtManagement.status}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{insights.debtManagement.analysis}</p>
            </div>
            
            {/* Emergency Fund */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">Emergency Fund</h3>
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">
                  Current: {insights.emergencyFund.currentMonths !== null 
                    ? `${insights.emergencyFund.currentMonths.toFixed(1)} months` 
                    : 'Unknown'}
                </div>
                <div className="text-gray-400 text-sm">
                  Recommended: {insights.emergencyFund.recommendedMonths} months
                </div>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full rounded-full ${getProgressColor(
                    insights.emergencyFund.currentMonths, 
                    insights.emergencyFund.recommendedMonths
                  )}`}
                  style={{ 
                    width: insights.emergencyFund.currentMonths !== null 
                      ? `${Math.min(100, (insights.emergencyFund.currentMonths / insights.emergencyFund.recommendedMonths) * 100)}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <p className="text-gray-300 text-sm">{insights.emergencyFund.analysis}</p>
            </div>
            
            {/* Investment Strategy */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">Investment Strategy</h3>
                <span className={`text-sm ${getStatusColor(insights.investmentStrategy.recommendation)}`}>
                  {insights.investmentStrategy.recommendation}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{insights.investmentStrategy.analysis}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}