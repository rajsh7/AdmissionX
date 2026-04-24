"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type GraphPoint = {
  key: string;
  label: string;
  year: number;
  month: number;
  uv: number;
};

export default function CollegeRegistrationChart({ 
  data, 
  ticks, 
  keyMap, 
  firstKeyByYear, 
  monthFilter 
}: { 
  data: GraphPoint[], 
  ticks: string[], 
  keyMap: Map<string, GraphPoint>, 
  firstKeyByYear: Map<number, string>, 
  monthFilter: string 
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="key"
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
          dy={15}
          interval={0}
          ticks={monthFilter === "All" ? ticks : undefined}
          tickFormatter={(value: string) => {
            const item = keyMap.get(value);
            if (!item) return "";
            if (monthFilter === "All") {
              return firstKeyByYear.get(item.year) === value ? String(item.year) : "";
            }
            return String(item.year);
          }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
          dx={-10}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0]?.payload as GraphPoint | undefined;
              return (
                <div className="relative">
                  <div className="bg-[#332222] text-white px-3 py-1 rounded shadow-xl text-[11px] font-bold">
                    {item?.label ?? ""}: {payload[0].value?.toLocaleString()}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#332222] rotate-45" />
                </div>
              );
            }
            return null;
          }}
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          offset={-40}
        />
        <Bar
          dataKey="uv"
          fill="#3B82F6"
          radius={[6, 6, 2, 2]}
          maxBarSize={22}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
