export async function GET(req: Request) {
    const token = req.headers.get("Authorization");
    if (!token) return new Response("Unauthorized", { status: 401 });
  
    const response = await fetch("https://wealthme-19942791895.asia-south1.run.app/api/profile", {
      headers: { Authorization: token },
    });
    const data = await response.json();
  
    return new Response(JSON.stringify(data), { status: 200 });
  }