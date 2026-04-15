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
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
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
                  {item.amount && (
                    <p className="text-primary font-bold mt-1">
                      ₹{item.amount.toLocaleString()}
                    </p>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
