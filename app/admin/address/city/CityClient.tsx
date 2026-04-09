"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import CityForm from "./CityForm";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import Link from "next/link";

interface CityClientProps {
  cities: any[];
  countries: { id: number; name: string }[];
  states: { id: number; name: string; country_id: number | null }[];
  onDelete: (id: number) => Promise<void>;
  onAdd: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    offset: number;
    pageSize: number;
    q: string;
  };
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };

export default function CityClient({
  cities,
  countries,
  states,
  onDelete,
  onAdd,
  onEdit,
  pagination
}: CityClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);

  const handleEdit = (city: any) => {
    setEditingCity(city);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCity(null);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingCity(null);
  };

  const { page, totalPages, total, offset, pageSize, q } = pagination;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/address/city${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/25 transition-all group"
        >
          <span className="material-symbols-rounded text-[20px]" style={ICO_FILL}>add_circle</span>
          Add City
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">City Name</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">State / Country</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400 font-semibold">
                     No cities found.
                  </td>
                </tr>
              ) : (
                cities.map((r) => (
                  <tr key={r.id} className="hover:bg-cyan-50/20 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-800 uppercase tracking-tight">{r.name}</td>
                    <td className="px-4 py-4">
                       <div className="flex flex-col gap-1">
                         <span className="inline-flex text-[10px] font-bold text-slate-600">
                           {r.stateName || "Unknown State"}
                         </span>
                         <span className="inline-flex items-center text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded w-fit uppercase tracking-tighter ring-1 ring-slate-100">
                           {r.countryName || "Unknown Country"}
                         </span>
                       </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleEdit(r)}
                            className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all" 
                            title="Update"
                          >
                            <span className="material-symbols-rounded text-[18px]">edit</span>
                          </button>
                          <DeleteButton action={onDelete.bind(null, r.id)} size="sm" />
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* -- Pagination ----------------------------------------------------- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing <strong>{offset + 1}–{Math.min(offset + pageSize, total)}</strong> of <strong>{total.toLocaleString()}</strong> cities
            </p>
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={buildUrl(page - 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
              )}
              <div className="hidden sm:flex items-center gap-1 px-2">
                 <span className="text-xs font-bold text-slate-400">Page {page} of {totalPages}</span>
              </div>
              {page < totalPages ? (
                <Link href={buildUrl(page + 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCity ? "Update City" : "Add New City"}
      >
        <CityForm 
          countries={countries}
          states={states}
          initialData={editingCity}
          onSubmitAction={editingCity ? onEdit : onAdd}
          onSuccess={handleFormSuccess}
        />
      </AdminModal>
    </>
  );
}




