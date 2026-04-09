"use client";

import dynamic from "next/dynamic";

const TransactionChartsClient = dynamic(
  () => import("../colleges/events/TransactionChartsClient"),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[420px] rounded-[5px] bg-slate-100 animate-pulse" />
        <div className="h-[420px] rounded-[5px] bg-slate-100 animate-pulse" />
      </div>
    ),
  }
);

interface ChartsWrapperProps {
  studentTransactionPie: any[];
  collegeTransactionPie: any[];
}

export default function ChartsWrapper({ studentTransactionPie, collegeTransactionPie }: ChartsWrapperProps) {
  return (
    <TransactionChartsClient
      studentTransactionPie={studentTransactionPie}
      collegeTransactionPie={collegeTransactionPie}
    />
  );
}