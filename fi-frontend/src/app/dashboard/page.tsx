"use client";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

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
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
          {/* Add summary content */}
        </div>

        {/* Recent Transactions Card */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          {/* Add transactions list */}
        </div>

        {/* Budget Overview Card */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
          {/* Add budget content */}
        </div>
      </div>
    </div>
  );
}
