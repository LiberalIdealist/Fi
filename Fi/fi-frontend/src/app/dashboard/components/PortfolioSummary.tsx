"use client";

import { useEffect, useState } from "react";

export default function PortfolioSummary() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recommendations/generatePortfolio")
      .then((res) => res.json())
      .then((data) => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-lg font-semibold">Portfolio Summary</h2>
      {loading ? (
        <p>Loading...</p>
      ) : portfolio ? (
        <ul>
          {portfolio.investments.map((item: any, index: number) => (
            <li key={index}>{item.name} - {item.allocation}%</li>
          ))}
        </ul>
      ) : (
        <p>Error fetching portfolio.</p>
      )}
    </div>
  );
}