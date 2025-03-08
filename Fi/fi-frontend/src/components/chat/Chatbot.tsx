import { useState } from "react";

export const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const response = await fetch("/models/chat/chatGPTProfiling", { // Changed from /api/chat
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();
    setMessages([...messages, `You: ${input}`, `AI: ${data.reply}`]);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-white shadow-lg p-4 rounded-lg">
      <h2 className="text-lg font-semibold">Chat with AI</h2>
      <div className="h-40 overflow-y-auto border p-2 mb-2">
        {messages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        className="w-full p-2 border rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="w-full mt-2 bg-blue-500 text-white p-2 rounded" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};