export async function GET() {
    const response = await fetch("https://wealthme-19942791895.asia-south1.run.app/api/risk");
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  }