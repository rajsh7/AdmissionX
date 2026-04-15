"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const StudentLoginForm = dynamic(() => import("./StudentLoginForm"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
    </div>
  ),
});

export default function StudentLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <StudentLoginForm />
    </Suspense>
  );
}
