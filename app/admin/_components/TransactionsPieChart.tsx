"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#FF3C3C", "#F59E0B", "#EF4444", "#6366F1", "#0EA5E9", "#14B8A6"];

export default function TransactionsPieChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 italic text-sm">
        No transaction data available.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 h-full w-full">
      {/* Left Legend */}
      <div className="flex flex-col gap-3 flex-shrink-0 min-w-[140px]">
        {data.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div>
              <p className="text-[12px] font-bold text-slate-700 leading-tight">{item.name}</p>
              <p className="text-[11px] text-slate-400 font-medium">Count: {item.count}</p>
              {item.amount != null && (
                <p className="text-[11px] font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                  ₹{item.amount.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div className="flex-1 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs">
                      <p className="font-bold text-slate-800 mb-1">{item.name}</p>
                      <p className="text-slate-500">Count: {item.count}</p>
                      {item.amount != null && (
                        <p className="text-primary font-bold mt-1">₹{item.amount.toLocaleString()}</p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
