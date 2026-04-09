import Link from "next/link";

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default function AdminUsersNewPage() {
  return (
    <div className="p-6 max-w-[600px]">

      {/* -- Breadcrumb ----------------------------------------------------- */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link
          href="/admin/users"
          className="hover:text-slate-600 font-semibold transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-rounded text-[14px]" style={ICO}>
            shield_person
          </span>
          Admin Users
        </Link>
        <span className="material-symbols-rounded text-[14px]" style={ICO}>
          chevron_right
        </span>
        <span className="text-slate-500 font-semibold">New Admin</span>
      </div>

      {/* -- Card ----------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Header stripe */}
        <div className="bg-slate-700 px-6 py-5 flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <span
              className="material-symbols-rounded text-white text-[22px]"
              style={ICO_FILL}
            >
              person_add
            </span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Create New Admin</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Administrator account registration
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-10 flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <span
              className="material-symbols-rounded text-amber-500 text-[32px]"
              style={ICO_FILL}
            >
              construction
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              Coming in Phase 11
            </h2>
            <p className="text-sm text-slate-500 max-w-[380px] leading-relaxed">
              Admin account creation, password management, and role-based
              permissions are planned for the next phase of development.
            </p>
          </div>

          {/* Phase badge */}
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
            <span
              className="material-symbols-rounded text-slate-500 text-[16px]"
              style={ICO_FILL}
            >
              schedule
            </span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Phase 11 · Planned
            </span>
          </div>

          {/* What's coming list */}
          <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-5 text-left space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              What&apos;s planned
            </p>
            {[
              { icon: "person_add",         label: "Create admin accounts with name & email"    },
              { icon: "lock",               label: "Secure password hashing (bcrypt)"           },
              { icon: "verified_user",      label: "Role assignment (superadmin / editor)"      },
              { icon: "mail",               label: "Welcome email with temporary password"      },
              { icon: "manage_accounts",    label: "Self-service password change for admins"    },
            ].map((item) => (
              <div key={item.icon} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-rounded text-slate-400 text-[14px]"
                    style={ICO_FILL}
                  >
                    {item.icon}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{item.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3 mt-2">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
            >
              <span className="material-symbols-rounded text-[16px]" style={ICO}>
                arrow_back
              </span>
              Back to Users
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <span className="material-symbols-rounded text-[16px]" style={ICO_FILL}>
                dashboard
              </span>
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* -- Legacy note ----------------------------------------------------- */}
      <p className="text-xs text-slate-400 text-center mt-4">
        To create an admin account now, use the{" "}
        <code className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono text-[11px]">
          seed-admin.mjs
        </code>{" "}
        script from the project root.
      </p>
    </div>
  );
}




