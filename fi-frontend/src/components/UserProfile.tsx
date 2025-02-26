"use client";
import React from 'react';
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { UserProfileProps } from '@/types/components';
import Image from 'next/image';

const UserProfile: React.FC<UserProfileProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg p-6 rounded-xl border border-gray-800/50">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          {data.image ? (
            <Image 
              src={data.image}
              alt="Profile"
              width={64}
              height={64}
              className="rounded-full border-2 border-blue-500"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
              {data.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{data.name || 'User'}</h2>
          <p className="text-gray-400">{data.email}</p>
        </div>
      </div>

      {data.completedQuestionnaire ? (
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Risk Score</h3>
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium text-white">{data.riskScore}</div>
              <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                  style={{ width: `${(data.riskScore || 0) * 10}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Investment Style</h3>
            <p className="text-white">{data.investmentStyle || 'Not determined'}</p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-900/20 border border-blue-800/30 p-4 rounded-lg">
          <p className="text-blue-300">Please complete the financial questionnaire to see your profile details.</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
