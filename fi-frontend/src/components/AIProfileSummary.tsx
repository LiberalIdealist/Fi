"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";

type FinancialProfile = {
  riskScore: number;
  investmentStyle: string;
  savingsRate: number;
  diversification: string;
  aiRecommendation: string;
};

export default function AIProfileSummary() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/profile?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching profile data:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) return <LoadingSpinner />;
  if (!profile) return <p className="text-gray-400">No profile data available.</p>;

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">AI-Generated Financial Profile</h2>
      
      <div className="grid grid-cols-2 gap-4 text-gray-200">
        <p><strong>Risk Score:</strong> {profile.riskScore}/100</p>
        <p><strong>Investment Style:</strong> {profile.investmentStyle}</p>
        <p><strong>Monthly Savings Rate:</strong> {profile.savingsRate}%</p>
        <p><strong>Diversification Level:</strong> {profile.diversification}</p>
      </div>

      <div className="mt-4 bg-gray-800 p-4 rounded">
        <h3 className="font-bold text-white">AI Recommendations</h3>
        <p className="text-gray-300">{profile.aiRecommendation}</p>
      </div>
    </div>
  );
}
