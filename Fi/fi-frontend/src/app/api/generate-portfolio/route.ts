export async function POST() {
    const response = await fetch("https://wealthme-19942791895.asia-south1.run.app/api/generate-portfolio", {
      method: "POST",
    });
  
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to generate portfolio" }), { status: 500 });
    }
  
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  }