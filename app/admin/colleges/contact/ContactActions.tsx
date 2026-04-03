"use client";

import { useState } from "react";

interface ContactActionsProps {
  email: string;
  collegeName: string;
  contactName: string;
}

export default function ContactActions({ email, collegeName, contactName }: ContactActionsProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSendEmail() {
    if (loading || sent) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/colleges/contact/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          college_name: collegeName,
          contact_name: contactName,
        }),
      });

      if (!res.ok) throw new Error("Failed to send email");
      
      setSent(true);
      // Optional: show a toast or alert
    } catch (err) {
      console.error(err);
      alert("Error sending email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 flex justify-center">
      <button
        onClick={handleSendEmail}
        disabled={loading || sent}
        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all border ${
          sent 
            ? "bg-green-50 text-green-600 border-green-200 cursor-default" 
            : "bg-white text-slate-500 hover:text-blue-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Sending...
          </span>
        ) : sent ? (
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[18px]">check_circle</span>
            Email Sent
          </span>
        ) : (
          "Send welcome email"
        )}
      </button>
    </div>
  );
}




