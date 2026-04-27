"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const ICO = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

interface NotifItem {
  id: string;
  type: string;
  title: string;
  desc: string;
  time: string;
  href: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Dropdown({
  icon, items, emptyText, viewAllHref, viewAllLabel, seen, onOpen,
}: {
  icon: string;
  items: NotifItem[];
  emptyText: string;
  viewAllHref: string;
  viewAllLabel: string;
  seen: boolean;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpen() {
    setOpen(v => !v);
    if (!open) onOpen();
  }

  const unseen = !seen && items.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative hover:text-slate-900 transition-colors p-1"
        suppressHydrationWarning
      >
        <span className="material-symbols-rounded text-[24px]" style={open ? ICO_FILL : ICO}>{icon}</span>
        {unseen && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">{viewAllLabel}</p>
            {items.length > 0 && (
              <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{items.length} new</span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {items.length === 0 ? (
              <div className="py-10 text-center">
                <span className="material-symbols-rounded text-4xl text-slate-200 block mb-2" style={ICO_FILL}>{icon}</span>
                <p className="text-xs text-slate-400">{emptyText}</p>
              </div>
            ) : (
              items.map(item => (
                <Link key={item.id} href={item.href} onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.type === "student"  ? "bg-blue-100 text-blue-600" :
                    item.type === "college"  ? "bg-purple-100 text-purple-600" :
                    item.type === "contact"  ? "bg-amber-100 text-amber-600" :
                    "bg-emerald-100 text-emerald-600"
                  }`}>
                    <span className="material-symbols-rounded text-[16px]" style={ICO_FILL}>
                      {item.type === "student" ? "person" : item.type === "college" ? "account_balance" : "forum"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{timeAgo(item.time)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
            <Link href={viewAllHref} onClick={() => setOpen(false)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              View all →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNotifications() {
  const [bells,    setBells]    = useState<NotifItem[]>([]);
  const [messages, setMessages] = useState<NotifItem[]>([]);
  const [bellSeen,    setBellSeen]    = useState(false);
  const [messageSeen, setMessageSeen] = useState(false);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setBells(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data.bells)) setBellSeen(false);
        return data.bells;
      });
      setMessages(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data.messages)) setMessageSeen(false);
        return data.messages;
      });
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  return (
    <div className="flex items-center gap-3 text-slate-600">
      <Dropdown
        icon="chat_bubble_outline"
        items={messages}
        emptyText="No new queries"
        viewAllHref="/admin/queries"
        viewAllLabel="New Queries"
        seen={messageSeen}
        onOpen={() => setMessageSeen(true)}
      />
      <Dropdown
        icon="notifications"
        items={bells}
        emptyText="No new registrations"
        viewAllHref="/admin/members/registrations"
        viewAllLabel="New Registrations"
        seen={bellSeen}
        onOpen={() => setBellSeen(true)}
      />
    </div>
  );
}
