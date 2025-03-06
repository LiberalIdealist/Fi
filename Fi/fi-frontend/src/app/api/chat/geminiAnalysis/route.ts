export async function GET(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
  
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
    }
  
    try {
      // ✅ Calling the existing backend API
      const response = await fetch("https://wealthme-19942791895.asia-south1.run.app/api/chat/geminiAnalysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
  
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to process AI profile" }), { status: 500 });
    }
  }