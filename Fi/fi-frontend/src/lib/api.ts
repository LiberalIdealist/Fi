export async function fetchUserProfile() {
    const response = await fetch("/api/profile/getProfile");
    if (!response.ok) throw new Error("Failed to fetch user profile");
    return response.json();
  }
  
  export async function fetchPortfolio() {
    const response = await fetch("/api/recommendations/generatePortfolio");
    if (!response.ok) throw new Error("Failed to fetch portfolio");
    return response.json();
  }
  
  export async function fetchRiskAssessment() {
    const response = await fetch("/api/recommendations/riskAssessment");
    if (!response.ok) throw new Error("Failed to fetch risk assessment");
    return response.json();
  }