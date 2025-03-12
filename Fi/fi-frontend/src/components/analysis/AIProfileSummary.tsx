import { useEffect, useState } from "react";

const AIProfileSummary = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAIProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the auth token from local storage
      const token = localStorage.getItem('fi_auth_token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      // Fetch the profile data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analysis?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch AI profile: ${response.status} ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      console.error("AI Profile fetch error:", err);
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
          <p><strong>Risk Profile:</strong> {profile.riskProfile || "Not available"}</p>
          <p><strong>Risk Score:</strong> {profile.riskScore || "N/A"}/10</p>
          
          {profile.portfolioAllocation && (
            <div className="mt-3">
              <p><strong>Portfolio Allocation:</strong></p>
              <ul className="list-disc ml-5">
                <li>Stocks: {profile.portfolioAllocation.stocks}%</li>
                <li>Bonds: {profile.portfolioAllocation.bonds}%</li>
                <li>Cash: {profile.portfolioAllocation.cash}%</li>
              </ul>
            </div>
          )}
          
          {profile.insights && (
            <div className="mt-3">
              <p><strong>Key Insights:</strong></p>
              <ul className="list-disc ml-5">
                {profile.insights.map((insight: string, index: number) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
          
          {profile.recommendations && (
            <div className="mt-3">
              <p><strong>Recommendations:</strong></p>
              <ul className="list-disc ml-5">
                {profile.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default AIProfileSummary;