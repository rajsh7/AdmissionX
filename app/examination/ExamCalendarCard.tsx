"use client";

import { useMemo, useState } from "react";

type CalendarEvent = {
  month: number; // 0-11
  day: number;
  label: string;
};

const EVENTS: CalendarEvent[] = [
  { month: 10, day: 28, label: "CAT 2026 EXAM DAY" },
  { month: 10, day: 28, label: "CAT 2026 EXAM DAY" },
];

export default function ExamCalendarCard() {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const monthLabel = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const eventDays = EVENTS.filter((e) => e.month === month).map((e) => e.day);
  const rows = Array.from({ length: totalCells }, (_, i) => i - firstDay + 1);

  function prevMonth() {
    setView((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setView((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-[5px] p-5 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={prevMonth} className="text-neutral-400 hover:text-neutral-700 transition-colors" aria-label="Previous month">
          <span className="material-symbols-outlined text-3xl">chevron_left</span>
        </button>
        <div style={{ fontWeight: 500, fontSize: "14px", color: "rgba(62, 62, 62, 1)" }}>{monthLabel}</div>
        <button type="button" onClick={nextMonth} className="text-neutral-400 hover:text-neutral-700 transition-colors" aria-label="Next month">
          <span className="material-symbols-outlined text-3xl">chevron_right</span>
        </button>
      </div>

      <div className="flex justify-around text-center text-xs font-semibold text-neutral-400 mb-3">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="flex justify-between gap-3 flex-wrap text-center text-sm font-medium">
        {rows.map((dayNum, i) => {
          if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} className="h-9" />;
          let cls = "h-7 w-7 flex items-center justify-center rounded-[5px] transition-colors hover:bg-neutral-100";
          if (dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cls += " bg-red-100 text-red-600 font-bold";
          } else if (eventDays.includes(dayNum)) {
            cls += " bg-red-600 text-white font-bold";
          }
          return <div key={i} className={cls}>{dayNum}</div>;
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-neutral-100 space-y-4 text-sm">
        {EVENTS.filter((e) => e.month === month).length === 0 ? (
          <div className="text-neutral-400 text-xs">No events this month.</div>
        ) : (
          EVENTS.filter((e) => e.month === month).map((e, idx) => (
            <div key={`${e.day}-${idx}`} className="flex gap-3">
              <span className="text-red-500 mt-px">•</span>
              <div>
                <div className="font-semibold text-red-500">
                  {new Date(year, e.month, e.day).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }).toUpperCase()}
                </div>
                <div className="text-neutral-600">{e.label}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
