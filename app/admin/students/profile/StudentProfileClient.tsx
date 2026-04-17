"use client";

import { useState } from "react";
import Link from "next/link";
import StudentProfileFormModal from "./StudentProfileFormModal";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import PaginationFixed from "@/app/components/PaginationFixed";

interface StudentProfileRow {
  id: number | string;
  users_id: number | string;
  student_name: string;
  student_email: string;
  phone?: string;
  gender: string;
  dateofbirth: string;
  parentsname: string;
  parentsnumber: string;
  entranceexamname?: string;
  entranceexamnumber?: string;
  hobbies?: string;
  interests?: string;
  projects?: string;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
}

interface StudentProfileClientProps {
  profiles: StudentProfileRow[];
  users: UserOption[];
  total: number;
  page: number;
  totalPages: number;
  selectedStudentName?: string;
  selectedEmail?: string;
  selectedPhoneNumber?: string;
  selectedGender?: string;
  selectedParentsName?: string;
  createProfile: (data: FormData) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
}

export default function StudentProfileClient({
  profiles,
  users,
  total,
  page,
  totalPages,
  selectedStudentName = "",
  selectedEmail = "",
  selectedPhoneNumber = "",
  selectedGender = "",
  selectedParentsName = "",
  createProfile,
  deleteProfile,
}: StudentProfileClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(
    Boolean(
      selectedStudentName ||
        selectedEmail ||
        selectedPhoneNumber ||
        selectedGender ||
        selectedParentsName,
    ),
  );
  const [visibleCount, setVisibleCount] = useState(25);

  // Reset visibleCount when profiles change (new page loaded)
  const profilesKey = profiles[0]?.id ?? "empty";
  const [lastKey, setLastKey] = useState(profilesKey);
  if (profilesKey !== lastKey) {
    setLastKey(profilesKey);
    setVisibleCount(25);
  }

  const showPagination = totalPages > 1 && visibleCount >= Math.min(100, profiles.length);
  const showMore = visibleCount < profiles.length && !showPagination;

  const start = total > 0 ? (page - 1) * 100 + 1 : 0;
  const end = total > 0 ? (page - 1) * 100 + Math.min(visibleCount, profiles.length) : 0;

  const formatPhone = (val: string | null | undefined) => {
    if (!val) return "-";
    return val.startsWith("+") ? val : `+91 ${val}`;
  };

  const buildPageHref = (targetPage: number) => {
    const query = new URLSearchParams({ page: String(targetPage) });
    if (selectedStudentName) query.set("studentName", selectedStudentName);
    if (selectedEmail) query.set("email", selectedEmail);
    if (selectedPhoneNumber) query.set("phoneNumber", selectedPhoneNumber);
    if (selectedGender) query.set("gender", selectedGender);
    if (selectedParentsName) query.set("parentsname", selectedParentsName);
    return `/admin/students/profile?${query.toString()}`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black text-slate-800">Profile Information</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and monitor all student profiles</p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((value) => !value)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">filter_alt</span>
          Filters
        </button>
      </div>

      {showFilters && (
        <form method="GET" action="/admin/students/profile" className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-4 p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Student Name</label>
              <input
                type="text"
                name="studentName"
                defaultValue={selectedStudentName}
                placeholder="Enter student name here"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email Address</label>
              <input
                type="email"
                name="email"
                defaultValue={selectedEmail}
                placeholder="Enter user email address here"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                defaultValue={selectedPhoneNumber}
                placeholder="Enter user phone number here"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Parents Name</label>
              <input
                type="text"
                name="parentsname"
                defaultValue={selectedParentsName}
                placeholder="Enter parents name here"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Gender</label>
              <select
                name="gender"
                defaultValue={selectedGender}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Default">Default</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2 sm:justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-all"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Close
            </button>
          </div>
        </form>
      )}

      <div className="bg-white">
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
              {profiles.slice(0, visibleCount).map((profile, i) => (
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
                      {profile.phone ? `+91 ${profile.phone}` : formatPhone(profile.parentsnumber)}
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
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100 transition-colors shadow-sm"
                        title="Edit profile"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          edit
                        </span>
                        Edit
                      </Link>
                      <DeleteButton
                        action={async () => {
                          await deleteProfile(Number(profile.id));
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

      {/* Show More */}
      {showMore && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            onClick={() => setVisibleCount((c) => Math.min(c + 25, profiles.length))}
            className="group flex flex-col items-center gap-1 text-neutral-400 hover:text-[#FF3C3C] transition-colors"
            type="button"
          >
            <span className="text-xs font-bold uppercase tracking-widest">
              Show More
            </span>
            <span className="material-symbols-outlined text-[36px] group-hover:text-[#FF3C3C] animate-bounce">
              keyboard_arrow_down
            </span>
          </button>
        </div>
      )}

      {/* Pagination — shows after all load more clicks */}
      {showPagination && (
        <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 mt-6 mb-6">
          <p className="text-sm text-slate-400 font-medium">
            Showing <strong>{start}</strong>-<strong>{end}</strong> of <strong>{total.toLocaleString()}</strong> profiles
          </p>
          <PaginationFixed currentPage={page} totalPages={totalPages} useUrl />
        </div>
      )}

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
