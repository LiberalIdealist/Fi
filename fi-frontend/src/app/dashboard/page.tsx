"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FinancialSummaryCard } from "./components/FinancialSummaryCard";
import { RecentTransactionsCard } from "./components/RecentTransactionsCard";
import { BudgetOverviewCard } from "./components/BudgetOverviewCard";
import UserProfile from "@/components/UserProfile";
import FinancialQuestionnaire from "@/components/FinancialQuestionnaire";
import LoadingSpinner from "@/components/LoadingSpinner";
import PDFUploader from "@/components/PDFUploader";
import AIProfileSummary from "@/components/AIProfileSummary";
import type { 
  DashboardProps, 
  UserProfileData, 
  QuestionnaireAnswers,
  ApiResponse 
} from '@/types/shared';

export default function DashboardPage({ showQuestionnaire = true }: DashboardProps) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated") {
    window.location.href = "/auth/signin";
    return null;
  }

  const handleQuestionnaireSubmit = async (answers: QuestionnaireAnswers) => {
    setLoading(true);
    try {
      await fetch('/api/user/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers)
      });
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-gray-100">
          {userProfile?.completedQuestionnaire 
            ? `Your Risk Score: ${userProfile.riskScore}`
            : 'Complete the questionnaire to get your risk score'}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FinancialSummaryCard />
        <RecentTransactionsCard />
        <BudgetOverviewCard />
      </div>

      {/* User Profile and Questionnaire Section */}
      <div className="mt-8 space-y-6">
        <UserProfile data={userProfile} />
        {showQuestionnaire && !userProfile?.completedQuestionnaire && (
          <FinancialQuestionnaire onSubmit={handleQuestionnaireSubmit} />
        )}
      </div>

      {/* Document Upload and AI Summary Section */}
      <div className="mt-8 space-y-6">
        <PDFUploader />
        <AIProfileSummary />
      </div>
    </div>
  );
}
