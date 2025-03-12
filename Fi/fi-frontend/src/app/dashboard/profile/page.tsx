"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/authContext';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import UserProfile from '../../../components/profile/UserProfile';

export default function UserDashboard() {
  const { user } = useAuth();
  const profile = user?.profile || {};
  
  // Access personalization preferences
  const dashboardLayout = profile.preferences?.dashboardLayout || 'default';
  const favoriteCategories = profile.preferences?.favoriteCategories || [];
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, {user?.displayName}</h1>
        {/* Personalized dashboard content based on preferences */}
      </div>
    </ProtectedRoute>
  );
}