'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { RiArrowLeftLine } from 'react-icons/ri';

// Define interface for form data
interface QuestionnaireData {
  timeHorizon: string;
  riskTolerance: string;
}

interface ProfileData {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  completedQuestionnaire: boolean;
  riskScore: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Simplified mock data to avoid API issues
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        id: "1",
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        completedQuestionnaire: false,
        riskScore: 0
      });
      setLoading(false);
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const handleQuestionnaireSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const answers = {
      timeHorizon: formData.get('timeHorizon') as string,
      riskTolerance: formData.get('riskTolerance') as string
    };
    
    console.log('Submitted answers:', answers);
    
    if (profileData) {
      setProfileData({
        ...profileData,
        completedQuestionnaire: true,
        riskScore: 7
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">
          <RiArrowLeftLine size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Your Profile</h1>
      </div>
      
      {/* User Info with Profile Image */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        <h2 className="text-lg font-semibold text-white mb-6">Personal Information</h2>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-800/50 rounded w-1/3"></div>
            <div className="h-8 bg-gray-800/50 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            {profileData?.image ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500">
                <Image
                  src={profileData.image}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {profileData?.name?.charAt(0) || 'U'}
              </div>
            )}
            
            {/* User Details */}
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <div className="text-white text-lg">{profileData?.name || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <div className="text-white">{profileData?.email || 'Not provided'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Financial Profile */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        <h2 className="text-lg font-semibold text-white mb-4">Financial Questionnaire</h2>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-24 bg-gray-800/50 rounded"></div>
          </div>
        ) : profileData?.completedQuestionnaire ? (
          <div>
            <div className="bg-green-900/20 border border-green-800/30 p-4 rounded-lg mb-4">
              <p className="text-green-300">You have completed your financial questionnaire.</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-white font-medium mb-2">Your Risk Score</h3>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-white">{profileData.riskScore}/10</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                    style={{ width: `${(profileData.riskScore || 0) * 10}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-6">Please complete this questionnaire to help us understand your financial profile.</p>
            
            {/* Simple Questionnaire Form */}
            <form onSubmit={handleQuestionnaireSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-white mb-2">What is your investment time horizon?</label>
                  <select name="timeHorizon" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                    <option value="">Select an option</option>
                    <option value="short">Less than 3 years</option>
                    <option value="medium">3-10 years</option>
                    <option value="long">10+ years</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white mb-2">What is your risk tolerance?</label>
                  <select name="riskTolerance" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                    <option value="">Select an option</option>
                    <option value="low">Conservative</option>
                    <option value="medium">Moderate</option>
                    <option value="high">Aggressive</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25"
              >
                Submit Questionnaire
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}