"use client";

import { useState, useEffect } from "react";
import UserProfile from "@/components/UserProfile";
import FinancialQuestionnaire from "@/components/FinancialQuestionnaire";
import AIProfileSummary from "@/components/AIProfileSummary";

export default function Dashboard() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) throw new Error("Failed to check profile data");

        const data = await response.json();
        setHasProfile(!!data.riskScore);
      } catch (error) {
        console.error("Error checking user profile:", error);
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-300">Loading dashboard...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {hasProfile ? (
        <>
          <UserProfile />
          <AIProfileSummary />
        </>
      ) : (
        <FinancialQuestionnaire />
      )}
    </div>
  );
}