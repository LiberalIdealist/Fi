"use client";

import { useAuth } from '../../../hooks/useAuth';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import PortfolioGenerator from '../../../components/portfolio/PortfolioGenerator';

export default function PortfolioPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Portfolio Recommendations</h1>
        
        <div className="mb-8">
          <p className="text-gray-300">
            Based on your profile, questionnaire responses, and document analysis, we can generate personalized 
            investment portfolio recommendations. Adjust the parameters below to see different scenarios.
          </p>
        </div>
        
        <PortfolioGenerator />
      </div>
    </ProtectedRoute>
  );
}