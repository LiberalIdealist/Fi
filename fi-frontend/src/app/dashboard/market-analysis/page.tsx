'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RiArrowLeftLine } from 'react-icons/ri';
import Chatbot from '@/components/Chatbot';

// Indian market indicators
const INDIAN_MARKET_INDICATORS = [
  { name: 'Sensex', value: '72,643.14', change: '+0.48%', trend: 'up' as const },
  { name: 'Nifty 50', value: '22,055.70', change: '+0.59%', trend: 'up' as const },
  { name: 'USD/INR', value: '₹83.07', change: '+0.14%', trend: 'down' as const },
];

export default function MarketAnalysisPage() {
  const [marketIndicators, setMarketIndicators] = useState(INDIAN_MARKET_INDICATORS);

  // Fetch live or simulated market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // In a production app, fetch real-time data
        // For now, use static data with small random changes
        const updatedIndicators = INDIAN_MARKET_INDICATORS.map(indicator => {
          const changeValue = (Math.random() * 0.5 - 0.25).toFixed(2);
          const trend = parseFloat(changeValue) >= 0 ? 'up' : 'down';
          return {
            ...indicator,
            change: `${changeValue}%`,
            trend: trend as 'up' | 'down'
          };
        });

        setMarketIndicators(updatedIndicators);
      } catch (err) {
        console.error("Failed to fetch market data:", err);
      }
    };

    fetchMarketData();
  }, []);

  return (
    <div className="space-y-6 bg-gradient min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">
          <RiArrowLeftLine size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Indian Market Analysis</h1>
      </div>

      {/* Market indicators */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        <h2 className="text-lg font-semibold text-white mb-4">Indian Market Indicators</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketIndicators.map((item) => (
            <div key={item.name} className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">{item.name}</div>
              <div className="text-xl font-semibold text-white">{item.value}</div>
              <div className={`text-sm ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {item.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat interface */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        <Chatbot marketIndicators={marketIndicators} />
      </div>
    </div>
  );
}