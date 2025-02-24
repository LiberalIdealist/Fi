import React from 'react';

export function RecentTransactionsCard() {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-4">
        {/* Add transaction list items here */}
        <p className="text-gray-400">No recent transactions</p>
      </div>
    </div>
  );
}