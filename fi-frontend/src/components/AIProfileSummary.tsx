"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  RiShieldCheckLine, RiAlertLine, RiMentalHealthLine, 
  RiPieChart2Line, RiLineChartLine, RiBubbleChartLine,
  RiArrowRightUpLine, RiArrowRightDownLine, RiCheckboxCircleLine
} from 'react-icons/ri';

interface Insight {
  category: string;
  text: string;
}

interface AIProfileSummaryProps {
  riskScore: number;
  summary: string;
  insights: Insight[];
  psychologicalProfile: string;
  recommendedActions: string[];
}

const AIProfileSummary: React.FC<AIProfileSummaryProps> = ({
  riskScore,
  summary,
  insights,
  psychologicalProfile,
  recommendedActions
}) => {
  // Define risk level text and color based on score
  const getRiskLevel = () => {
    if (riskScore <= 3) return { text: 'Conservative', color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-700/20' };
    if (riskScore <= 6) return { text: 'Moderate', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-600/20' };
    return { text: 'Aggressive', color: 'text-red-400', bg: 'from-red-500/20 to-red-700/20' };
  };
  
  const riskLevel = getRiskLevel();

  // Function to render risk score indicator
  const renderRiskScore = () => {
    const markers = [];
    for (let i = 1; i <= 10; i++) {
      markers.push(
        <div 
          key={i}
          className={`h-8 w-3 rounded-full ${
            i <= riskScore 
              ? i <= 3 
                ? 'bg-blue-500' 
                : i <= 6 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
              : 'bg-gray-700'
          }`}
        />
      );
    }
    return markers;
  };

  return (
    <div className="space-y-8">
      {/* Overview Card with Risk Score */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="md:w-1/2">
            <h3 className="text-lg font-medium text-white mb-2">Financial Risk Profile</h3>
            <p className="text-gray-400 mb-4">{summary}</p>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${riskLevel.bg} mr-3`}>
                <RiShieldCheckLine size={24} className={riskLevel.color} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Risk Level</div>
                <div className={`text-lg font-semibold ${riskLevel.color}`}>{riskLevel.text}</div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-400 mb-4">Risk Score</div>
              <div className="flex items-end gap-1 h-12 mb-2">
                {renderRiskScore()}
              </div>
              <div className="w-full flex justify-between text-xs text-gray-500">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>
              <div className="mt-4 text-2xl font-bold text-white">
                {riskScore}<span className="text-gray-400 text-lg">/10</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Psychological Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <RiMentalHealthLine size={20} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-white">Psychological Profile</h3>
        </div>
        <p className="text-gray-300 leading-relaxed">{psychologicalProfile}</p>
      </motion.div>
      
      {/* Financial Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {insights.map((insight, index) => {
          // Different icons for different categories
          let IconComponent;
          let iconColorClass;
          let bgGradient;
          
          switch(insight.category.toLowerCase()) {
            case 'risk tolerance':
              IconComponent = RiAlertLine;
              iconColorClass = 'text-red-400';
              bgGradient = 'from-red-500/20 to-red-700/20';
              break;
            case 'financial habits':
              IconComponent = RiLineChartLine;
              iconColorClass = 'text-green-400';
              bgGradient = 'from-green-500/20 to-green-700/20';
              break;
            case 'investment approach':
              IconComponent = RiPieChart2Line;
              iconColorClass = 'text-blue-400';
              bgGradient = 'from-blue-500/20 to-blue-700/20';
              break;
            default:
              IconComponent = RiBubbleChartLine;
              iconColorClass = 'text-yellow-400';
              bgGradient = 'from-yellow-500/20 to-yellow-700/20';
          }
          
          return (
            <div 
              key={index}
              className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/40"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${bgGradient}`}>
                  <IconComponent size={18} className={iconColorClass} />
                </div>
                <h4 className="text-base font-medium text-white">{insight.category}</h4>
              </div>
              <p className="text-gray-300 text-sm">{insight.text}</p>
            </div>
          );
        })}
      </motion.div>
      
      {/* Recommended Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20">
            <RiArrowRightUpLine size={20} className="text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-white">Recommended Actions</h3>
        </div>
        <div className="space-y-3">
          {recommendedActions.map((action, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 bg-gray-700/30 p-3 rounded-lg"
            >
              <RiCheckboxCircleLine className="text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300">{action}</p>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Additional Information Card */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-5">
        <h4 className="text-blue-300 font-medium mb-2">Personalized Investment Strategy</h4>
        <p className="text-gray-300 text-sm">
          Based on your risk profile, we recommend scheduling a consultation with a financial advisor to discuss
          personalized investment strategies that align with your risk tolerance and financial goals.
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Schedule Consultation
        </button>
      </div>
    </div>
  );
};

export default AIProfileSummary;
