export async function POST(req: Request) {
    const { message } = await req.json();
  
    const response = await fetch("https://wealthme-19942791895.asia-south1.run.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  
    const data = await response.json();
    return new Response(JSON.stringify({ reply: data.reply }), { status: 200 });
  }