"use client";

import { useEffect, useState } from "react";

export default function RiskAssessment() {
  const [riskLevel, setRiskLevel] = useState("");

  useEffect(() => {
    fetch("/api/recommendations/riskAssessment")
      .then((res) => res.json())
      .then((data) => setRiskLevel(data.risk_level));
  }, []);

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-lg font-semibold">Risk Assessment</h2>
      <p>Your risk level: {riskLevel ? riskLevel : "Loading..."}</p>
    </div>
  );
}