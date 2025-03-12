"use client";

import { useEffect, useState } from "react";
import { useAuth } from '../../contexts/authContext';

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

export default function Profile() {
  const { user } = useAuth();
  
  // Access basic auth fields
  const displayName = user?.displayName || 'User';
  const email = user?.email;
  
  // Access extended profile fields
  const profile = user?.profile || {};
  const role = profile.role || 'user';
  const createdAt = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString() 
    : 'N/A';
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{displayName}'s Profile</h2>
      <div className="mt-4 space-y-2">
        <div>
          <span className="font-medium">Email:</span> {email}
        </div>
        <div>
          <span className="font-medium">Role:</span> {role}
        </div>
        <div>
          <span className="font-medium">Member Since:</span> {createdAt}
        </div>
        {/* Additional profile fields */}
      </div>
    </div>
  );
}