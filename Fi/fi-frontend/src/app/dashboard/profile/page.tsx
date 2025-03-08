"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import UserProfile from '../../../components/profile/UserProfile';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}