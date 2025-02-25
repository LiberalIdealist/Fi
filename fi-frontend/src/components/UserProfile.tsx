"use client";
import React from 'react';
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { UserProfileProps } from '@/types/components';

const UserProfile: React.FC<UserProfileProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
      {data.completedQuestionnaire ? (
        <>
          <p>Risk Score: {data.riskScore}</p>
          <p>Investment Style: {data.investmentStyle}</p>
        </>
      ) : (
        <p>Please complete the questionnaire to see your profile details.</p>
      )}
    </div>
  );
};

export default UserProfile;
