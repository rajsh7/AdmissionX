"use client";

import { useState } from "react";
import Link from "next/link";
import StudentProfileFormModal from "./StudentProfileFormModal";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/app/admin/_components/DeleteButton";

interface StudentProfileClientProps {
  profiles: any[];
  users: any[];
  total: number;
  totalPages: number;
  createProfile: (data: FormData) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
}

export default function StudentProfileClient({
  profiles,
  users,
  total,
  totalPages,
  createProfile,
  deleteProfile,
}: StudentProfileClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openAddModal() {
    setIsModalOpen(true);
  }

  const start = total > 0 ? 1 : 0;
  const end = Math.min(profiles.length, total || profiles.length);

  const formatPhone = (val: string | null | undefined) => {
    if (!val) return "-";
    return val.startsWith("+") ? val : `+91 ${val}`;
  };

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center justify-end gap-2 mb-0 mt-2 px-2">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-admin-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Profile
        </button>
      </div>

      {/* Table (matches profile information table style) */}
      <div className="bg-white">
        {/* Table header info */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            {total > 0 ? (
              <>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {start}-{end}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {total.toLocaleString()}
                </span>{" "}
                profiles
              </>
            ) : (
              "No profiles found"
            )}
          </p>
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-300">
                person
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-700">
              No student profiles found
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">
                  S.No
                </th>
                <th className="px-4 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  DOB
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Parent Details
                </th>
                <th className="px-3 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((profile, i) => (
                <tr key={profile.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-black text-slate-500">
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate leading-tight" title={profile.student_name}>
                        {profile.student_name || "Unknown"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {profile.student_email || "-"}
                      </p>
                      <p className="text-[10px] text-slate-300">
                        User ID: {profile.users_id ?? "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-slate-600 text-sm font-medium">
                      {formatPhone(profile.parentsnumber)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                      {profile.gender || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-slate-500 text-sm">
                      {formatDate(profile.dateofbirth)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-slate-700 truncate">
                        {profile.parentsname || "-"}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {formatPhone(profile.parentsnumber)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-row items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/students/profile/${profile.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#008080] text-white text-[11px] font-bold hover:bg-[#006666] transition-colors shadow-sm"
                        title="Edit profile"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          edit
                        </span>
                        Edit
                      </Link>
                      <DeleteButton
                        action={async () => {
                          await deleteProfile(profile.id);
                        }}
                        label="Delete"
                        size="xs"
                        icon={
                          <span className="material-symbols-outlined text-[13px]">
                            delete
                          </span>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <StudentProfileFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createProfile}
        profile={undefined}
        users={users}
      />
    </>
  );
}
