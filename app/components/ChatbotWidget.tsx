"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  role: "user" | "bot";
  text: string;
  time?: string;
}

function getTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function renderText(text: string) {
  const parts = text.split(/(\[.+?\]\(.+?\)|\n|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part === "\n") return <br key={i} />;
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i} className="font-semibold text-slate-900">{bold[1]}</strong>;
    const link = part.match(/^\[(.+?)\]\((.+?)\)$/);
    if (link) return (
      <a key={i} href={link[2]} className="inline-flex items-center gap-0.5 text-primary font-medium hover:underline underline-offset-2">
        {link[1]}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
      </a>
    );
    return <span key={i}>{part}</span>;
  });
}

const SUGGESTIONS = [
  { icon: "🏫", text: "Top engineering colleges" },
  { icon: "📝", text: "JEE exam details" },
  { icon: "🎓", text: "MBA admission process" },
  { icon: "🌍", text: "Study abroad options" },
  { icon: "💰", text: "Scholarship information" },
];

// Show contact form after this many user messages
const CONTACT_TRIGGER = 3;

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactDone, setContactDone] = useState(false);

  // Contact info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "👋 Hi! I'm **AdmissionX Assistant**, your personal education counsellor.\n\nI can help you find colleges, courses, exams, and guide you through admissions. What would you like to know?",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [userMsgCount, setUserMsgCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Prevent page scroll when scrolling inside chatbot
  useEffect(() => {
    const el = chatWindowRef.current;
    if (!el) return;

    const preventPageScroll = (e: WheelEvent) => {
      const target = messagesRef.current;
      if (!target) return;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const atTop = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
      if (!atTop && !atBottom) {
        e.stopPropagation();
      }
      e.stopPropagation();
    };

    el.addEventListener("wheel", preventPageScroll, { passive: false });
    return () => el.removeEventListener("wheel", preventPageScroll);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, showContactForm]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    if (showContactForm) setTimeout(() => nameRef.current?.focus(), 100);
  }, [showContactForm]);

  async function sendMessage(text: string) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    const newCount = userMsgCount + 1;
    setUserMsgCount(newCount);
    setMessages((prev) => [...prev, { role: "user", text: userMsg, time: getTime() }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history, sessionId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply, time: getTime() }]);

      // Show contact form after bot replies to the Nth user message
      if (newCount >= CONTACT_TRIGGER && !contactDone) {
        setTimeout(() => setShowContactForm(true), 600);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, something went wrong. Please try again.", time: getTime() }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactError("");

    if (!name.trim()) { setContactError("Please enter your name."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setContactError("Please enter a valid email address."); return; }
    if (!phone.trim() || phone.trim().length < 10) { setContactError("Please enter a valid 10-digit phone number."); return; }

    setContactLoading(true);
    try {
      const res = await fetch("/api/chatbot/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setContactDone(true);
      setShowContactForm(false);
      setMessages((prev) => [...prev, {
        role: "bot",
        text: `Thanks **${name.trim()}**! 🎉 Your details have been saved. Our team will follow up if needed.\n\nFeel free to keep asking questions!`,
        time: getTime(),
      }]);
    } catch {
      setContactError("Something went wrong. Please try again.");
    } finally {
      setContactLoading(false);
    }
  }

  function resetChat() {
    setMessages([{
      role: "bot",
      text: "👋 Hi! I'm **AdmissionX Assistant**, your personal education counsellor.\n\nI can help you find colleges, courses, exams, and guide you through admissions. What would you like to know?",
      time: getTime(),
    }]);
    setUserMsgCount(0);
    setShowContactForm(false);
    setContactDone(false);
    setName(""); setEmail(""); setPhone("");
    setSessionId("");
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center overflow-hidden"
        style={{ background: open ? "#e63535" : "linear-gradient(135deg, #FF3C3C 0%, #c0392b 100%)" }}
        aria-label="Toggle Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
              className="material-symbols-outlined text-white text-[22px]">close</motion.span>
          ) : (
            <motion.span key="open" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
              <img src="/A_MARK.png" alt="A" className="w-8 h-8 object-contain brightness-0 invert" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-primary" />}
      </motion.button>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={chatWindowRef}
            data-lenis-prevent
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden"
            style={{
              width: "420px",
              maxWidth: "calc(100vw - 24px)",
              height: "640px",
              maxHeight: "calc(100vh - 110px)",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-5 py-4 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #FF3C3C 0%, #c0392b 100%)" }}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5">
                <img src="/A_MARK.png" alt="A" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">AdmissionX Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-white/80 text-[11px] font-medium">Online · Always here to help</p>
                </div>
              </div>
              <button onClick={resetChat}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors" title="New chat">
                <span className="material-symbols-outlined text-white text-[16px]">refresh</span>
              </button>
            </div>

            {/* ── Messages ── */}
            <div
              ref={messagesRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4"
              style={{ background: "#f8fafc", overscrollBehavior: "contain" }}
            >

              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 overflow-hidden p-1"
                      style={{ background: "linear-gradient(135deg, #FF3C3C, #c0392b)" }}>
                      <img src="/A_MARK.png" alt="A" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                  )}
                  <div className={`flex flex-col gap-1 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 text-[13px] leading-relaxed ${msg.role === "user" ? "text-white rounded-2xl rounded-tr-sm" : "text-slate-700 rounded-2xl rounded-tl-sm border border-slate-100"}`}
                      style={msg.role === "user"
                        ? { background: "linear-gradient(135deg, #FF3C3C, #c0392b)", boxShadow: "0 4px 12px rgba(255,60,60,0.25)" }
                        : { background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                      {renderText(msg.text)}
                    </div>
                    {msg.time && <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden p-1"
                    style={{ background: "linear-gradient(135deg, #FF3C3C, #c0392b)" }}>
                    <img src="/A_MARK.png" alt="A" className="w-full h-full object-contain brightness-0 invert" />
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-white border border-slate-100 flex items-center gap-1.5"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    {[0, 150, 300].map((delay) => (
                      <span key={delay} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Inline Contact Form (appears after CONTACT_TRIGGER messages) ── */}
              <AnimatePresence>
                {showContactForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-primary/20 overflow-hidden"
                    style={{ background: "#fff8f8" }}
                  >
                    {/* Form header */}
                    <div className="px-4 py-3 flex items-center gap-2.5"
                      style={{ background: "linear-gradient(135deg, #FF3C3C, #c0392b)" }}>
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden p-0.5">
                        <img src="/A_MARK.png" alt="A" className="w-full h-full object-contain brightness-0 invert" />
                      </div>
                      <p className="text-white text-xs font-bold">Save your details for follow-up</p>
                    </div>

                    <form onSubmit={handleContactSubmit} className="px-4 py-3 space-y-2.5">
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Full Name <span className="text-primary">*</span></label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[15px]">person</span>
                          <input
                            ref={nameRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full pl-8 pr-3 py-2 text-[12px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-slate-800 placeholder-slate-400"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address <span className="text-primary">*</span></label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[15px]">mail</span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full pl-8 pr-3 py-2 text-[12px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-slate-800 placeholder-slate-400"
                            required
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Phone Number <span className="text-primary">*</span></label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[15px]">phone</span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            placeholder="10-digit mobile number"
                            className="w-full pl-8 pr-3 py-2 text-[12px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-slate-800 placeholder-slate-400"
                            required
                          />
                        </div>
                      </div>

                      {contactError && (
                        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">error</span>
                          {contactError}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => { setShowContactForm(false); setContactDone(true); }}
                          className="flex-1 py-2 rounded-lg text-slate-500 text-[12px] font-semibold border border-slate-200 hover:bg-slate-50 transition-all">
                          Skip
                        </button>
                        <button type="submit" disabled={contactLoading}
                          className="flex-1 py-2 rounded-lg text-white text-[12px] font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                          style={{ background: "linear-gradient(135deg, #FF3C3C, #c0392b)" }}>
                          {contactLoading ? (
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              Save & Continue
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* ── Suggestions (only on first message) ── */}
            {messages.length <= 1 && (
              <div className="flex-shrink-0 px-4 py-3 grid grid-cols-1 gap-2"
                style={{ borderTop: "1px solid #f1f5f9", background: "#ffffff" }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s.text} onClick={() => sendMessage(s.text)}
                    className="flex items-center gap-3 text-[13px] font-medium text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all bg-white text-left w-full">
                    <span className="text-base leading-none">{s.icon}</span>
                    <span>{s.text}</span>
                    <span className="material-symbols-outlined text-[14px] text-slate-300 ml-auto">arrow_forward_ios</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Input ── */}
            <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: "1px solid #f1f5f9", background: "#ffffff" }}>
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all bg-slate-50">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about colleges, exams, courses…"
                  className="flex-1 bg-transparent text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none"
                  disabled={loading}
                />
                <button type="submit" disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0"
                  style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #FF3C3C, #c0392b)" : "#e2e8f0" }}>
                  <span className="material-symbols-outlined text-[15px]"
                    style={{ color: input.trim() && !loading ? "white" : "#94a3b8", fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
