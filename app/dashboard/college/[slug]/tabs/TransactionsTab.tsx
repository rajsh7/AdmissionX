"use client";

import { useState, useEffect, useCallback } from "react";
import type { CollegeUser } from "../CollegeDashboardClient";

interface Props {
  college: CollegeUser;
}

interface Transaction {
  id: string;
  application_ref: string;
  student_name: string;
  student_email: string;
  course_name: string;
  amount_paid: number;
  transaction_id: string;
  updated_at: string;
}

interface Stats {
  totalRevenue: number;
  totalCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TransactionsTab({ college }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalCount: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({
        page: String(page),
        search: debouncedSearch,
      });
      const res = await fetch(`/api/college/dashboard/${college.slug}/transactions?${sp}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load transactions");
      
      setTransactions(data.transactions);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [college.slug, page, debouncedSearch]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Transaction Details
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          View and manage all fee payments received for your college
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-rounded text-6xl text-emerald-500">payments</span>
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <span className="material-symbols-rounded text-sm">trending_up</span>
            Gross earnings from online applications
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-rounded text-6xl text-blue-500">receipt_long</span>
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Successful Payments</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
            {stats.totalCount}
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-blue-600 dark:text-blue-400 font-bold text-xs">
            <span className="material-symbols-rounded text-sm">check_circle</span>
            Total completed transactions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-rounded text-6xl text-purple-500">avg_pace</span>
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Ticket</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">
            {formatCurrency(stats.totalCount > 0 ? stats.totalRevenue / stats.totalCount : 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-purple-600 dark:text-purple-400 font-bold text-xs">
            <span className="material-symbols-rounded text-sm">analytics</span>
            Average amount per application
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="relative w-full sm:w-96">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-xl pointer-events-none">search</span>
          <input 
            type="text" 
            placeholder="Search by student, TXN ID, or application ref..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
           <button 
            onClick={() => loadTransactions()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
           >
             <span className={`material-symbols-rounded text-lg ${loading ? 'animate-spin' : ''}`}>refresh</span>
             Refresh
           </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Transaction Info</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Student Details</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-slate-800">
                    <td className="px-6 py-4"><div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl w-40" /></td>
                    <td className="px-6 py-4"><div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl w-48" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-lg w-20 ml-auto" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-full w-24 mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-rounded text-4xl text-slate-300">receipt_long</span>
                    </div>
                    <h3 className="text-slate-800 dark:text-white font-black text-lg">No Transactions Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-[280px] mx-auto">
                      Whenever students pay for their applications, they will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded w-fit">
                          {txn.application_ref}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                          {txn.transaction_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px]">
                          {txn.student_name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {txn.course_name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-slate-800 dark:text-white">
                        {formatCurrency(txn.amount_paid)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Success
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(txn.updated_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
             <p className="text-xs font-bold text-slate-500">
                Showing {transactions.length} of {pagination.total} results
             </p>
             <div className="flex items-center gap-1">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                >
                  <span className="material-symbols-rounded">chevron_left</span>
                </button>
                <span className="px-3 text-xs font-black text-slate-800 dark:text-white">
                  Page {page} of {pagination.totalPages}
                </span>
                <button 
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                >
                  <span className="material-symbols-rounded">chevron_right</span>
                </button>
             </div>
          </div>
        )}
      </div>

       {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
          <span className="material-symbols-rounded">error</span>
          <span className="text-sm font-bold">{error}</span>
          <button onClick={() => loadTransactions()} className="ml-auto underline font-black text-xs">Try Again</button>
        </div>
      )}
    </div>
  );
}
