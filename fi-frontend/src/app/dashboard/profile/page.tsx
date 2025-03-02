'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { RiArrowLeftLine } from 'react-icons/ri';

interface ProfileData {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        id: "1",
        name: session.user.name,
        email: session.user.email,
        image: null,
      });
      setLoading(false);
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

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
      
      {/* You can add other profile-related sections here */}
    </div>
  );
}