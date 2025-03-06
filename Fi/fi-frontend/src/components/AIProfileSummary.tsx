import { useEffect, useState } from "react";

const AIProfileSummary = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAIProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Calling the existing backend API
      const response = await fetch(`/api/chat/geminiAnalysis?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch AI profile");

      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchAIProfile();
  }, [userId]);

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-lg font-semibold">AI-Powered Financial Profile</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchAIProfile}
            className="mt-2 bg-red-500 text-white px-4 py-1 rounded"
          >
            Retry
          </button>
        </div>
      ) : profile ? (
        <div>
          <p><strong>Risk Level:</strong> {profile.risk_level || "Not available"}</p>
          <p><strong>Recommended Investment Type:</strong> {profile.investment_type || "N/A"}</p>
          <p><strong>Savings Strategy:</strong> {profile.savings_plan || "N/A"}</p>
        </div>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default AIProfileSummary;