import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Fixed Header Placeholder ── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl h-16 bg-white/80 backdrop-blur-md border border-neutral-200 rounded-full animate-pulse" />

      {/* ── Hero Skeleton ── */}
      <div className="relative bg-neutral-900 pt-32 pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="w-32 h-4 bg-white/10 rounded-full mb-8 animate-pulse" />
          <div className="max-w-2xl space-y-4 mb-10">
            <div className="w-full h-12 bg-white/10 rounded-2xl animate-pulse" />
            <div className="w-3/4 h-12 bg-white/10 rounded-2xl animate-pulse" />
            <div className="w-full h-20 bg-white/5 rounded-2xl animate-pulse mt-6" />
          </div>
          <div className="flex flex-wrap gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl animate-pulse" />
                <div className="space-y-2">
                  <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                  <div className="w-12 h-3 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="w-40 h-14 bg-red-600/20 rounded-2xl animate-pulse" />
            <div className="w-40 h-14 bg-white/10 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── Features Skeleton ── */}
      <div className="bg-white py-16 border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center mb-12">
            <div className="w-48 h-8 bg-neutral-100 rounded-lg animate-pulse mb-3" />
            <div className="w-96 h-4 bg-neutral-50 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-2xl animate-pulse" />
                <div className="w-24 h-4 bg-neutral-200 rounded animate-pulse" />
                <div className="w-full h-12 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Destinations Skeleton ── */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10">
            <div className="w-64 h-8 bg-neutral-200 rounded-lg animate-pulse mb-2" />
            <div className="w-48 h-4 bg-neutral-100 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-40 bg-neutral-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* ── Streams Skeleton ── */}
      <div className="bg-white py-16 border-t border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="w-48 h-8 bg-neutral-200 rounded-lg animate-pulse mb-2" />
              <div className="w-32 h-4 bg-neutral-100 rounded-lg animate-pulse" />
            </div>
            <div className="w-20 h-4 bg-neutral-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="h-24 bg-neutral-50 rounded-2xl border border-neutral-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




