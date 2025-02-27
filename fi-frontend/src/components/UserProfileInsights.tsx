import React from 'react';

interface UserProfileInsightsProps {
  profileSummary: string;
}

const UserProfileInsights: React.FC<UserProfileInsightsProps> = ({ profileSummary }) => {
  if (!profileSummary) {
    return <div className="text-gray-400">Profile insights not available</div>;
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Your Financial Profile</h2>
      <div className="text-gray-300 whitespace-pre-line">
        {profileSummary}
      </div>
    </div>
  );
};

export default UserProfileInsights;