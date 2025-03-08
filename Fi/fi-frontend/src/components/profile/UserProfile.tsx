"use client";

import { useEffect, useState } from "react";

interface UserProfileData {
  name?: string;
  email?: string;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  yearlyInsurancePremiums?: {
    life: number;
    health: number;
    term: number;
    vehicle: number;
  };
  EMIs?: number;
  savings?: {
    fixedDeposits: number;
    stocks: number;
    mutualFunds: number;
    realEstate: number;
  };
}

export default function UserProfile() {
  const [user, setUser] = useState<UserProfileData | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setUser(data);
    }
    fetchUserData();
  }, []);

  if (!user) {
    return <p className="text-white text-center">Loading profile...</p>;
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>

      <div className="mb-4">
        <p><strong>Name:</strong> {user.name || "N/A"}</p>
        <p><strong>Email:</strong> {user.email || "N/A"}</p>
      </div>

      <div className="mb-4">
        <p><strong>Monthly Income:</strong> ₹{user.monthlyIncome?.toLocaleString() || "N/A"}</p>
        <p><strong>Monthly Expenses:</strong> ₹{user.monthlyExpenses?.toLocaleString() || "N/A"}</p>
        <p><strong>EMIs:</strong> ₹{user.EMIs?.toLocaleString() || "N/A"}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-bold">Insurance Premiums (Yearly)</h3>
        <p><strong>Life:</strong> ₹{user.yearlyInsurancePremiums?.life || 0}</p>
        <p><strong>Health:</strong> ₹{user.yearlyInsurancePremiums?.health || 0}</p>
        <p><strong>Term:</strong> ₹{user.yearlyInsurancePremiums?.term || 0}</p>
        <p><strong>Vehicle:</strong> ₹{user.yearlyInsurancePremiums?.vehicle || 0}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-bold">Savings</h3>
        <p><strong>Fixed Deposits:</strong> ₹{user.savings?.fixedDeposits || 0}</p>
        <p><strong>Stocks:</strong> ₹{user.savings?.stocks || 0}</p>
        <p><strong>Mutual Funds:</strong> ₹{user.savings?.mutualFunds || 0}</p>
        <p><strong>Real Estate:</strong> ₹{user.savings?.realEstate || 0}</p>
      </div>

      <button
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 mt-4"
        onClick={() => alert("Profile reset functionality coming soon!")}
      >
        Reset Profile
      </button>
    </div>
  );
}