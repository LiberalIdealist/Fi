"use client";
import { useSession } from "next-auth/react";
import { FinancialSummaryCard } from "./components/FinancialSummaryCard";
import { RecentTransactionsCard } from "./components/RecentTransactionsCard";
import { BudgetOverviewCard } from "./components/BudgetOverviewCard";
import LoadingState from "@/components/LoadingState";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8">
        <h1 className="gradient-heading mb-4">Your Financial Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Financial Summary Card */}
        <FinancialSummaryCard />

        {/* Recent Transactions Card */}
        <RecentTransactionsCard />

        {/* Budget Overview Card */}
        <BudgetOverviewCard />
      </div>
    </div>
  );
}
