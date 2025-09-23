"use client";
import { useState } from "react";

interface Message {
  from: "user" | "bot";
  text: string;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { from: "user", text: input.trim() };
    setMessages((m: Message[]) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      const botMsg: Message = {
        from: "bot",
        text:
          "Thanks for reaching out! We'll help you buy or design the perfect merchandise.",
      };
      setMessages((m: Message[]) => [...m, botMsg]);
    }, 500);
  };

  return (
    <div className="w-full max-w-lg bg-[#181F36] rounded-lg p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-80">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-xs text-sm ${
              msg.from === "user"
                ? "bg-[var(--color-secondary)] self-end"
                : "bg-[var(--color-primary)] text-black self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 rounded-md bg-[#10182B] focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-[var(--color-primary)] px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
}
