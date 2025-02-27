import React from 'react';

interface SwotAnalysisProps {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

const SwotAnalysis: React.FC<SwotAnalysisProps> = ({ swot }) => {
  if (!swot) {
    return <div className="text-gray-400">SWOT analysis not available</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">SWOT Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-900/20 border border-green-800/40 rounded-lg p-4">
          <h3 className="text-green-400 font-medium mb-2">Strengths</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {swot.strengths.map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-4">
          <h3 className="text-red-400 font-medium mb-2">Weaknesses</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {swot.weaknesses.map((weakness, idx) => (
              <li key={idx}>{weakness}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-4">
          <h3 className="text-blue-400 font-medium mb-2">Opportunities</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {swot.opportunities.map((opportunity, idx) => (
              <li key={idx}>{opportunity}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-4">
          <h3 className="text-yellow-400 font-medium mb-2">Threats</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {swot.threats.map((threat, idx) => (
              <li key={idx}>{threat}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SwotAnalysis;