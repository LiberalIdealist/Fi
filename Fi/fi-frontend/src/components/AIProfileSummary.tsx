"use client";

import { useState, useEffect } from "react";
import { fetchAIProfile } from "@/utils/vertexAI";
import LoadingState from "./LoadingState";

interface AIProfile {
  riskScore: number;
  insights: { category: string; text: string }[];
  psychologicalProfile: string;
  recommendedActions: string[];
  swotAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  portfolioRecommendation?: {
    fixedDeposits?: { allocation: number; duration: string; notes: string }[];
    stocks?: { name: string; ticker: string; allocation: number; rationale: string }[];
    mutualFunds?: { name: string; type: string; allocation: number; rationale: string }[];
    insurance?: {
      health?: { coverAmount: number; premium: number };
      life?: { coverAmount: number; premium: number };
      term?: { coverAmount: number; premium: number };
    };
  };
}

const AIProfileSummary = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<AIProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchAIProfile(userId);
        setProfile(data);
      } catch (err) {
        setError("Failed to load profile insights.");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [userId]);

  if (loading) return <LoadingState />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gradient">AI Profile Summary</h2>

      {/* Risk Score */}
      <div className="mt-4">
        <p className="text-lg font-semibold">Risk Score: {profile?.riskScore}</p>
      </div>

      {/* Insights */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Insights</h3>
        <ul className="list-disc pl-4">
          {profile?.insights?.map((insight, index) => (
            <li key={index} className="text-gray-300">
              <strong>{insight.category}: </strong>
              {insight.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Psychological Profile */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Psychological Profile</h3>
        <p className="text-gray-300">{profile?.psychologicalProfile}</p>
      </div>

      {/* Recommended Actions */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Recommended Actions</h3>
        <ul className="list-disc pl-4">
          {profile?.recommendedActions?.map((action, index) => (
            <li key={index} className="text-gray-300">{action}</li>
          ))}
        </ul>
      </div>

      {/* SWOT Analysis */}
      {profile?.swotAnalysis && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">SWOT Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-lg font-semibold text-green-400">Strengths</h4>
              <ul className="list-disc pl-4 text-gray-300">
                {profile.swotAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-red-400">Weaknesses</h4>
              <ul className="list-disc pl-4 text-gray-300">
                {profile.swotAnalysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-400">Opportunities</h4>
              <ul className="list-disc pl-4 text-gray-300">
                {profile.swotAnalysis.opportunities.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-yellow-400">Threats</h4>
              <ul className="list-disc pl-4 text-gray-300">
                {profile.swotAnalysis.threats.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Recommendation */}
      {profile?.portfolioRecommendation && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Portfolio Recommendation</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Fixed Deposits */}
            {profile.portfolioRecommendation.fixedDeposits && (
              <div>
                <h4 className="text-lg font-semibold text-blue-400">Fixed Deposits</h4>
                <ul className="list-disc pl-4 text-gray-300">
                  {profile.portfolioRecommendation.fixedDeposits.map((fd, i) => (
                    <li key={i}>
                      {fd.allocation}% - {fd.duration} ({fd.notes})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stocks */}
            {profile.portfolioRecommendation.stocks && (
              <div>
                <h4 className="text-lg font-semibold text-green-400">Stocks</h4>
                <ul className="list-disc pl-4 text-gray-300">
                  {profile.portfolioRecommendation.stocks.map((stock, i) => (
                    <li key={i}>
                      {stock.name} ({stock.ticker}): {stock.allocation}% - {stock.rationale}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mutual Funds */}
            {profile.portfolioRecommendation.mutualFunds && (
              <div>
                <h4 className="text-lg font-semibold text-purple-400">Mutual Funds</h4>
                <ul className="list-disc pl-4 text-gray-300">
                  {profile.portfolioRecommendation.mutualFunds.map((mf, i) => (
                    <li key={i}>
                      {mf.name} ({mf.type}): {mf.allocation}% - {mf.rationale}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insurance */}
            {profile.portfolioRecommendation.insurance && (
              <div>
                <h4 className="text-lg font-semibold text-yellow-400">Insurance</h4>
                <p>Health: ₹{profile.portfolioRecommendation.insurance.health?.coverAmount}</p>
                <p>Life: ₹{profile.portfolioRecommendation.insurance.life?.coverAmount}</p>
                <p>Term: ₹{profile.portfolioRecommendation.insurance.term?.coverAmount}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIProfileSummary;