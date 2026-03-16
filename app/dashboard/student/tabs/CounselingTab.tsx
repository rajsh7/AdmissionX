"use client";

import { useState } from "react";

interface Props {
  user: { id: number; name: string; email: string } | null;
}

interface Counselor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  available: boolean;
  avatar: string;
  languages: string[];
  expertise: string[];
}

interface ChatMessage {
  id: number;
  sender: "user" | "counselor";
  text: string;
  time: string;
}

interface BookingSlot {
  date: string;
  time: string;
  counselorId: number;
}

const COUNSELORS: Counselor[] = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialty: "Engineering & Technology",
    experience: "8 years",
    rating: 4.9,
    reviews: 312,
    available: true,
    avatar: "PS",
    languages: ["English", "Hindi"],
    expertise: ["JEE", "B.Tech Admissions", "IIT/NIT Guidance", "Scholarship"],
  },
  {
    id: 2,
    name: "Prof. Rajesh Kumar",
    specialty: "Medical & Pharmacy",
    experience: "12 years",
    rating: 4.8,
    reviews: 425,
    available: true,
    avatar: "RK",
    languages: ["English", "Hindi", "Tamil"],
    expertise: ["NEET", "MBBS Admissions", "Medical Colleges", "PG Medical"],
  },
  {
    id: 3,
    name: "Ms. Ananya Patel",
    specialty: "Management & MBA",
    experience: "6 years",
    rating: 4.7,
    reviews: 198,
    available: false,
    avatar: "AP",
    languages: ["English", "Gujarati"],
    expertise: ["CAT", "MBA Admissions", "IIM Guidance", "GMAT"],
  },
  {
    id: 4,
    name: "Mr. Suresh Nair",
    specialty: "Law & Humanities",
    experience: "10 years",
    rating: 4.8,
    reviews: 276,
    available: true,
    avatar: "SN",
    languages: ["English", "Malayalam", "Hindi"],
    expertise: ["CLAT", "LLB Admissions", "NLU Guidance", "Arts & Commerce"],
  },
];

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM",
];

const QUICK_QUESTIONS = [
  "What are the top engineering colleges in India?",
  "How do I apply for NEET counselling?",
  "What is the fee structure for B.Tech at IITs?",
  "Which colleges accept JEE Main score?",
  "How to get a scholarship for medical studies?",
  "What documents are required for admission?",
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`material-symbols-outlined text-[14px] ${
            s <= Math.floor(rating) ? "text-amber-400" : "text-slate-200"
          }`}
          style={s <= Math.floor(rating) ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          star
        </span>
      ))}
      <span className="text-xs font-bold text-slate-600 ml-1">{rating}</span>
    </div>
  );
}

export default function CounselingTab({ user }: Props) {
  const [view, setView]                   = useState<"list" | "chat" | "book">("list");
  const [selectedCounselor, setSelected]  = useState<Counselor | null>(null);
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [inputText, setInputText]         = useState("");
  const [booking, setBooking]             = useState<BookingSlot | null>(null);
  const [bookingDate, setBookingDate]     = useState("");
  const [bookingTime, setBookingTime]     = useState("");
  const [bookingDone, setBookingDone]     = useState(false);
  const [isBotTyping, setIsBotTyping]     = useState(false);

  const initials = (user?.name ?? "ST")
    .split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  // ── Auto-reply bot ────────────────────────────────────────────────────────
  async function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsBotTyping(true);

    await new Promise((r) => setTimeout(r, 1200));

    const lc = text.toLowerCase();
    let reply =
      lc.includes("fee") || lc.includes("cost")
        ? "Fee structures vary by college and course. For IITs, B.Tech fees are around ₹2–3 lakh/year. Private colleges can range from ₹1–10 lakh/year. I can help you find specific fee details for colleges you are interested in."
        : lc.includes("neet") || lc.includes("medical")
        ? "NEET is the national entrance exam for medical admissions. With a good NEET score (550+), you can get into government medical colleges. I can guide you through the counselling process and help shortlist the right colleges."
        : lc.includes("jee") || lc.includes("engineering") || lc.includes("iit")
        ? "JEE Main and JEE Advanced are the gateway to top engineering colleges. IITs, NITs, and IIITs accept JEE scores. Would you like me to help you shortlist colleges based on your expected rank?"
        : lc.includes("scholarship")
        ? "There are many scholarships available — merit-based, need-based, and government scholarships like NSP, AICTE scholarships, state government scholarships, and private scholarships. Tell me your course and state so I can suggest the right ones."
        : lc.includes("document")
        ? "Common documents needed: 10th & 12th marksheets, admit card, scorecard, ID proof (Aadhar/PAN), passport photos, caste certificate (if applicable), and income certificate. Requirements vary by college."
        : lc.includes("hello") || lc.includes("hi") || lc.includes("hey")
        ? `Hello ${(user?.name ?? "there").split(" ")[0]}! I'm here to help you with your college admission journey. Feel free to ask me anything about colleges, courses, entrance exams, or the admission process!`
        : "That's a great question! I'd be happy to provide detailed guidance on this. For the most accurate and personalised advice, I recommend booking a 1-on-1 session with one of our expert counselors. They can give you tailored guidance based on your profile and goals.";

    const botMsg: ChatMessage = {
      id: Date.now() + 1,
      sender: "counselor",
      text: reply,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, botMsg]);
    setIsBotTyping(false);
  }

  function startChat(c: Counselor) {
    setSelected(c);
    setMessages([
      {
        id: 1,
        sender: "counselor",
        text: `Hello ${(user?.name ?? "there").split(" ")[0]}! I'm ${c.name}, specialising in ${c.specialty}. How can I assist you today with your admission journey?`,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setView("chat");
  }

  function openBooking(c: Counselor) {
    setSelected(c);
    setBookingDate("");
    setBookingTime("");
    setBookingDone(false);
    setView("book");
  }

  function confirmBooking() {
    if (!bookingDate || !bookingTime || !selectedCounselor) return;
    setBooking({ date: bookingDate, time: bookingTime, counselorId: selectedCounselor.id });
    setBookingDone(true);
  }

  // ── Minimum date = today ──────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];

  // ══════════════════════════════════════════════════════════════════════════
  // BOOKING VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "book" && selectedCounselor) {
    return (
      <div className="max-w-2xl space-y-6">

        {/* Back */}
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Counselors
        </button>

        <div className="bg-white rounded-2xl border border-green-50 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-lg">{selectedCounselor.avatar}</span>
              </div>
              <div>
                <h2 className="font-black text-lg">{selectedCounselor.name}</h2>
                <p className="text-white/80 text-sm">{selectedCounselor.specialty}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {bookingDone ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-4xl text-green-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    event_available
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800">Session Booked!</h3>
                  <p className="text-sm text-slate-500">
                    Your counselling session with{" "}
                    <strong>{selectedCounselor.name}</strong> is scheduled.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl px-6 py-4 space-y-2 w-full max-w-xs">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Date</span>
                    <span className="font-black text-slate-800">
                      {new Date(bookingDate).toLocaleDateString("en-IN", {
                        weekday: "short", day: "2-digit", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Time</span>
                    <span className="font-black text-slate-800">{bookingTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Mode</span>
                    <span className="font-black text-green-600">Video Call</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  A confirmation will be sent to <strong>{user?.email}</strong>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setView("list")}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                  >
                    Back to List
                  </button>
                  <button
                    onClick={() => startChat(selectedCounselor)}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-200 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    Start Chat
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Select date */}
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                    Select Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={bookingDate}
                    onChange={(e) => { setBookingDate(e.target.value); setBookingTime(""); }}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
                  />
                </div>

                {/* Select time */}
                {bookingDate && (
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                      Select Time Slot <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setBookingTime(slot)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all duration-150 ${
                            bookingTime === slot
                              ? "bg-green-600 text-white border-green-600 shadow-sm shadow-green-200"
                              : "bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:text-green-600"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Session type */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Session Details</p>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-green-600 text-[18px]">videocam</span>
                    <span>30-minute video counselling session</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-green-600 text-[18px]">payments</span>
                    <span className="font-bold text-green-600">Free of charge</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-green-600 text-[18px]">mail</span>
                    <span>Confirmation sent to {user?.email}</span>
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  onClick={confirmBooking}
                  disabled={!bookingDate || !bookingTime}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-black hover:bg-green-700 transition-colors shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                  Confirm Booking
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHAT VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "chat" && selectedCounselor) {
    return (
      <div className="max-w-3xl space-y-4">

        {/* Back */}
        <button
          onClick={() => { setView("list"); setMessages([]); }}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Counselors
        </button>

        {/* Chat window */}
        <div className="bg-white rounded-2xl border border-green-50 shadow-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 260px)", minHeight: "500px" }}>

          {/* Chat header */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">{selectedCounselor.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm">{selectedCounselor.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                <span className="text-white/70 text-[11px] font-medium">Online — {selectedCounselor.specialty}</span>
              </div>
            </div>
            <button
              onClick={() => openBooking(selectedCounselor)}
              className="flex-shrink-0 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 border border-white/20"
            >
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              Book Session
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-green-500 to-green-700 text-white"
                      : "bg-gradient-to-br from-slate-600 to-slate-800 text-white"
                  }`}
                >
                  {msg.sender === "user" ? initials : selectedCounselor.avatar}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-white text-slate-700 border border-slate-100 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.sender === "user" ? "text-white/60 text-right" : "text-slate-400"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isBotTyping && (
              <div className="flex items-end gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-[11px] font-black text-white flex-shrink-0">
                  {selectedCounselor.avatar}
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-white flex-shrink-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Quick Questions</p>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="flex-shrink-0 text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="px-4 py-3 border-t border-slate-100 bg-white flex-shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(inputText); }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isBotTyping}
                className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-colors shadow-sm shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COUNSELORS LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 text-[22px]">support_agent</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">Counseling</h1>
          <p className="text-xs text-slate-400 font-medium">
            Get personalised guidance from expert admission counselors
          </p>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 rounded-2xl p-6 overflow-hidden shadow-lg shadow-green-200 text-white">
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-black leading-tight">
              Get Expert Admission Guidance — <span className="text-green-200">100% Free</span>
            </h2>
            <p className="text-white/75 text-sm max-w-md leading-relaxed">
              Our experienced counselors are available 24/7 to guide you through
              college selection, application, and the entire admission process.
            </p>
            <div className="flex items-center gap-4 pt-1 flex-wrap">
              {[
                { icon: "verified", text: "Expert Counselors" },
                { icon: "schedule", text: "24/7 Available"    },
                { icon: "payments", text: "Completely Free"   },
              ].map((b) => (
                <span key={b.text} className="flex items-center gap-1 text-[11px] font-semibold text-white/80">
                  <span className="material-symbols-outlined text-[14px] text-green-300">{b.icon}</span>
                  {b.text}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <button
              onClick={() => {
                const available = COUNSELORS.find((c) => c.available);
                if (available) startChat(available);
              }}
              className="px-4 py-2.5 bg-white text-green-700 font-black rounded-xl text-sm shadow-md hover:bg-green-50 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Chat Now
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: "support_agent", label: "Expert Counselors",  value: "50+",   color: "text-green-600",  bg: "bg-green-50"  },
          { icon: "people",        label: "Students Helped",    value: "10K+",  color: "text-blue-600",   bg: "bg-blue-50"   },
          { icon: "star",          label: "Average Rating",     value: "4.8",   color: "text-amber-500",  bg: "bg-amber-50"  },
          { icon: "schedule",      label: "Response Time",      value: "<5 min",color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-green-50 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined text-[20px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {s.icon}
              </span>
            </div>
            <div>
              <p className="text-lg font-black text-slate-800 leading-none">{s.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Counselor cards ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-slate-800">Our Expert Counselors</h2>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            {COUNSELORS.filter((c) => c.available).length} Available Now
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {COUNSELORS.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-green-50 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-green-700 font-black text-lg">{c.avatar}</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-slate-800 text-sm">{c.name}</h3>
                    {c.available ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Offline
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{c.specialty} • {c.experience} exp.</p>
                  <StarRating rating={c.rating} />
                  <p className="text-[10px] text-slate-400 mt-0.5">{c.reviews} reviews</p>
                  {/* Languages */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.languages.map((lang) => (
                      <span key={lang} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{lang}</span>
                    ))}
                  </div>
                  {/* Expertise */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {c.expertise.slice(0, 3).map((e) => (
                      <span key={e} className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                <button
                  onClick={() => startChat(c)}
                  disabled={!c.available}
                  className="flex-1 py-2 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  {c.available ? 'Chat Now' : 'Unavailable'}
                </button>
                <button
                  onClick={() => openBooking(c)}
                  className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
