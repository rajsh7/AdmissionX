"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "bot";
  text: string;
}

function renderText(text: string) {
  // Convert markdown links [label](url) and newlines to JSX
  const parts = text.split(/(\[.+?\]\(.+?\)|\n)/g);
  return parts.map((part, i) => {
    if (part === "\n") return <br key={i} />;
    const linkMatch = part.match(/^\[(.+?)\]\((.+?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          className="text-red-400 underline underline-offset-2 hover:text-red-300 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const SUGGESTIONS = [
  "Top engineering colleges",
  "How to apply for admission?",
  "JEE exam details",
  "MBA courses available",
  "Scholarship information",
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "👋 Hi! I'm AdmissionX Assistant.\n\nAsk me about colleges, courses, exams, or admissions!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendMessage(text: string) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all hover:-translate-y-1 active:scale-95 shadow-xl overflow-hidden"
        style={{ background: "transparent" }}
        aria-label="Open chat assistant"
      >
        {open ? (
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-[24px]">close</span>
          </div>
        ) : (
          <img
            src="/chatbot-icon.avif"
            alt="Chat assistant"
            className="w-16 h-16 object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-[300px] max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "420px", background: "#0f0f19", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Header */}
          <div className="px-3 py-2.5 flex items-center gap-2.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-400 text-[16px]">smart_toy</span>
            </div>
            <div>
              <p className="text-white font-semibold text-xs leading-tight">AdmissionX Assistant</p>
              <p className="text-white/40 text-[10px]">Ask me anything about admissions</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mr-1.5 flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-red-400 text-[11px]">smart_toy</span>
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-red-500 text-white rounded-br-sm"
                      : "text-white/85 rounded-bl-sm"
                  }`}
                  style={msg.role === "bot" ? { background: "rgba(255,255,255,0.07)" } : {}}
                >
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mr-1.5 flex-shrink-0">
                  <span className="material-symbols-outlined text-red-400 text-[11px]">smart_toy</span>
                </div>
                <div className="px-3 py-2.5 rounded-xl rounded-bl-sm flex items-center gap-1" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-2.5 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="flex-shrink-0 text-[10px] font-medium text-red-400 px-2.5 py-1 rounded-full hover:bg-red-500/20 transition-colors whitespace-nowrap"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-2.5 py-2.5 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about colleges, exams…"
                className="flex-1 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
