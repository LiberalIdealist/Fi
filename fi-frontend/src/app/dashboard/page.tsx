'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  RiLineChartLine, RiFileList3Line, RiUserLine, 
  RiPieChartLine, RiArrowRightLine 
} from 'react-icons/ri';

// Define interface for ProfileData
interface ProfileData {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  completedQuestionnaire: boolean;
  riskScore: number;
}

// Simple inline component to avoid dependencies
function ProfileSummary({ data }: { data: ProfileData }) {
  if (!data) return null;
  
  return (
    <div className="flex items-center gap-4">
      {data.image ? (
        <div className="relative w-16 h-16 overflow-hidden rounded-full border-2 border-blue-500">
          <Image 
            src={data.image}
            alt="Profile"
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
          {data.name?.charAt(0) || 'U'}
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-white">{data.name || 'User'}</h2>
        <p className="text-gray-400">{data.email}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  // Add type annotation to useState
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
  
  const userName = session?.user?.name || 'there';
  
  return (
    <div className="space-y-8 pb-12">
      {/* Welcome card */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-8 rounded-xl border border-gray-800/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">{userName}</span>
          </h1>
          
          <p className="text-gray-400 max-w-lg mb-4">
            {loading ? 'Loading your profile...' : 'Complete your financial profile to unlock personalized insights.'}
          </p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Profile */}
        <Link href="/dashboard/profile" className="block">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50 group hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-300 font-medium">Your Profile</h3>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                <RiUserLine size={20} className="text-white" />
              </div>
            </div>
            <p className="text-gray-400 mb-4">View and update your financial profile</p>
            <div className="flex items-center text-blue-400 group-hover:underline">
              <span>Go to profile</span>
              <RiArrowRightLine className="ml-1" />
            </div>
          </div>
        </Link>
        
        {/* Card 2: Documents */}
        <Link href="/dashboard/documents" className="block">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50 group hover:border-purple-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-300 font-medium">Documents</h3>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                <RiFileList3Line size={20} className="text-white" />
              </div>
            </div>
            <p className="text-gray-400 mb-4">Upload and manage your financial documents</p>
            <div className="flex items-center text-purple-400 group-hover:underline">
              <span>Go to documents</span>
              <RiArrowRightLine className="ml-1" />
            </div>
          </div>
        </Link>
        
        {/* Card 3: Market Analysis */}
        <Link href="/dashboard/market-analysis" className="block">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50 group hover:border-pink-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-300 font-medium">Market Analysis</h3>
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/20">
                <RiPieChartLine size={20} className="text-white" />
              </div>
            </div>
            <p className="text-gray-400 mb-4">Get insights from our AI market analysis</p>
            <div className="flex items-center text-pink-400 group-hover:underline">
              <span>View analysis</span>
              <RiArrowRightLine className="ml-1" />
            </div>
          </div>
        </Link>

        {/* Card 4: Financial Profile */}
        <Link href="/dashboard/financial-profile" className="block">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50 group hover:border-green-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-300 font-medium">Financial Profile</h3>
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-600/20">
                <RiLineChartLine size={20} className="text-white" />
              </div>
            </div>
            <p className="text-gray-400 mb-4">Complete your financial assessment and get AI-powered insights</p>
            <div className="flex items-center text-green-400 group-hover:underline">
              <span>View financial profile</span>
              <RiArrowRightLine className="ml-1" />
            </div>
          </div>
        </Link>
      </div>
      
      {/* Profile Summary */}
      <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/50">
        <h2 className="text-lg font-semibold text-white mb-4">Profile Summary</h2>
        {loading ? (
          <div className="animate-pulse h-32 bg-gray-800/50 rounded-xl"></div>
        ) : (
          profileData && <ProfileSummary data={profileData} />
        )}
      </div>
    </div>
  );
}
