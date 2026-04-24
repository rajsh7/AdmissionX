"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type PiePoint = {
  name: string;
  value: number;
  count: number;
  amount?: number;
};

const pieColors = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#0EA5E9", "#14B8A6"];

const fmtCurrency = (num: number) => {
  if (num >= 1_000_000) return `₹${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `₹${(num / 1_000).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
};

export default function TransactionChartsClient({
  studentTransactionPie,
  collegeTransactionPie
}: {
  studentTransactionPie: (PiePoint & { amount?: number })[];
  collegeTransactionPie: (PiePoint & { amount?: number })[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedStudentPie, setSelectedStudentPie] = useState<string | null>(null);
  const [selectedCollegePie, setSelectedCollegePie] = useState<string | null>(null);

  // Use mock data if no real data
  const mockData: (PiePoint & { amount?: number })[] = [
    { name: "Paid", value: 45000, count: 150, amount: 45000 },
    { name: "Pending", value: 30000, count: 100, amount: 30000 },
    { name: "Failed", value: 15000, count: 50, amount: 15000 },
  ];

  const studentData = studentTransactionPie && studentTransactionPie.length > 0 
    ? studentTransactionPie 
    : mockData;
  
  const collegeData = collegeTransactionPie && collegeTransactionPie.length > 0 
    ? collegeTransactionPie 
    : mockData;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ChartCard = ({
    title,
    data,
    selectedPie,
    setSelectedPie
  }: {
    title: string;
    data: (PiePoint & { amount?: number })[];
    selectedPie: string | null;
    setSelectedPie: (name: string | null) => void;
  }) => (
    <div className="bg-white rounded-[5px] border border-slate-100 shadow-sm p-6 flex-1 min-w-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-bold text-slate-800">{title}</h2>
      </div>
      <div className="h-56 w-full flex items-center justify-center">
        {isMounted ? (
          data && data.length > 0 ? (
            <div className="flex items-center gap-4 h-full w-full">
              <div className="flex flex-col gap-2 w-1/2 h-full overflow-y-auto pr-2">
                {data.map((p, i) => {
                  const isSelected = selectedPie === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setSelectedPie(isSelected ? null : p.name)}
                      className={`flex items-center gap-2 text-xs font-semibold rounded-full px-3 py-2 transition-all w-fit whitespace-nowrap ${
                        isSelected ? "bg-blue-600 text-white" : "text-slate-600 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: pieColors[i % pieColors.length] }}
                      />
                      <span className="truncate">{p.name}</span>
                      <span className={`text-[10px] ml-1 ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                        {p.count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="w-1/2 h-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={1}
                    >
                      {data.map((entry, idx) => (
                        <Cell key={`cell-${entry.name}-${idx}`} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0]?.payload as (PiePoint & { amount?: number }) | undefined;
                          return (
                            <div className="bg-slate-900 text-white px-3 py-2 rounded shadow-lg text-[12px] font-semibold">
                              <div>{item?.name}</div>
                              <div className="text-slate-300">{fmtCurrency(Number(item?.amount ?? item?.value ?? 0))}</div>
                              <div className="text-slate-400 text-[10px]">Count: {item?.count ?? 0}</div>
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
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
              No transaction data available
            </div>
          )
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse rounded-lg" />
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <ChartCard
        title="Student Transactions"
        data={studentData}
        selectedPie={selectedStudentPie}
        setSelectedPie={setSelectedStudentPie}
      />
      <ChartCard
        title="College Transactions"
        data={collegeData}
        selectedPie={selectedCollegePie}
        setSelectedPie={setSelectedCollegePie}
      />
    </div>
  );
}
