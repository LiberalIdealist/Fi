import { useEffect, useState } from "react";

export default function SWOTAnalysis() {
  const [swot, setSwot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recommendations/swotAnalysis")
      .then((res) => res.json())
      .then((data) => {
        setSwot(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-lg font-semibold">Portfolio SWOT Analysis</h2>
      {loading ? (
        <p>Loading...</p>
      ) : swot ? (
        <div>
          <h3 className="font-semibold">Strengths:</h3>
          <ul>{swot.strengths.map((s: string, idx: number) => <li key={idx}>✔ {s}</li>)}</ul>
        </div>
      ) : (
        <p>Error fetching SWOT data.</p>
      )}
    </div>
  );
}