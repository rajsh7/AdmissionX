"use client";

import {
  AreaChart,
  Area,
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

export default function StudentRegistrationChart({ 
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
      <AreaChart data={data} margin={{ top: 20, right: 30, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF3C3C" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#FF3C3C" stopOpacity={0}/>
          </linearGradient>
        </defs>
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
          cursor={{ stroke: '#FF3C3C', strokeWidth: 1, strokeDasharray: '3 3' }}
          offset={-40}
        />
        <Area 
          type="monotone" 
          dataKey="uv" 
          stroke="#FF3C3C" 
          strokeWidth={2} 
          dot={{ r: 2.5, fill: '#FF3C3C', strokeWidth: 0 }}
          fillOpacity={1}
          fill="url(#colorUv)"
          activeDot={{ r: 5, fill: '#FF3C3C', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
