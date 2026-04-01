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
    <button
      onClick={handleSendEmail}
      disabled={loading || sent}
      className={`mt-4 w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
        sent 
          ? "bg-green-100 text-green-700 cursor-default" 
          : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600"
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
  );
}




