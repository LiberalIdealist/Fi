"use client";

import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div className="bg-white p-4 shadow-md rounded-lg">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Risk Level:</strong> {user.risk_level}</p>
        </div>
      ) : (
        <p>Error loading profile.</p>
      )}
    </div>
  );
}