export default function AdminDashboardPage() {
  return (
    <div className="bg-background-dark text-gray-200 font-sans antialiased min-h-screen">
      {/* Main Header */}
      <header className="fixed top-0 z-50 w-full bg-neutral-900 border-b border-white/10 h-16 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/admissionx-logo.png"
              alt="AdmissionX logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <h1 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Admin Dashboard
          </h1>
        </div>

        {/* User Profile & Notifications */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">Super Admin</p>
              <p className="text-xs text-gray-500">Master Access</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center overflow-hidden">
              {/* Placeholder avatar */}
              <span className="text-xs text-red-500 font-semibold">SA</span>
            </div>
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-neutral-900 border-r border-white/10 hidden lg:flex flex-col py-6 overflow-y-auto">
        <nav className="flex-1 px-4 space-y-2">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white font-medium transition-all" href="#">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Dashboard
          </a>

          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all" href="#">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Students
          </a>

          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all" href="#">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Colleges
          </a>

          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all" href="#">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Applications
          </a>

          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all" href="#">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Transactions
          </a>

          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all" href="#">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Reports
          </a>

          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase mb-2">
              Management
            </p>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all" href="#">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              Content
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all" href="#">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              Settings
            </a>
          </div>
        </nav>

        <div className="px-8 mt-auto">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-6 space-y-8">
          {/* Content Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                Overview
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-1 bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-bold rounded uppercase">
                  Role: Super Admin
                </span>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Write
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Delete
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Export
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-neutral-900 border border-white/10 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                Generate Report
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                + Add College
              </button>
            </div>
          </header>

          {/* KPI Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* KPI cards – same structure as your HTML, trimmed for brevity */}
            {/* Total Students */}
            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10 shadow-md group hover:border-red-600/30 transition-colors">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-400">
                  Total Students
                </p>
                <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                  12.5%
                </span>
              </div>
              <p className="text-3xl font-display font-bold mt-2">12,450</p>
            </div>

            {/* Colleges Onboarded */}
            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10 shadow-md group hover:border-red-600/30 transition-colors">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-400">
                  Colleges Onboarded
                </p>
                <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                  4.2%
                </span>
              </div>
              <p className="text-3xl font-display font-bold mt-2">156</p>
            </div>

            {/* Active Applications */}
            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10 shadow-md group hover:border-red-600/30 transition-colors">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-400">
                  Active Applications
                </p>
                <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                  2.1%
                </span>
              </div>
              <p className="text-3xl font-display font-bold mt-2">3,892</p>
            </div>

            {/* Successful Payments */}
            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10 shadow-md group hover:border-red-600/30 transition-colors">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-400">
                  Successful Payments
                </p>
                <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                  18.4%
                </span>
              </div>
              <p className="text-3xl font-display font-bold mt-2">$2.4M</p>
            </div>
          </section>

          {/* You can continue porting the remaining sections (charts, tables, activity, system health)
              using the same JSX pattern as above when you’re ready. */}
        </div>
      </main>
    </div>
  );
}

