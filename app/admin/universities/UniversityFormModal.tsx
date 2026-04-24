"use client";

import { useState } from "react";
import AdminModal from "@/app/admin/_components/AdminModal";
import ImageUpload from "@/app/admin/_components/ImageUpload";

interface UniversityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  university?: any;
}

export default function UniversityFormModal({
  isOpen,
  onClose,
  onSubmit,
  university,
}: UniversityFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const imgUrl = (raw: string | null) => {
    if (!raw) return null;
    if (raw.startsWith("http") || raw.startsWith("/")) return raw;
    return `https://admin.admissionx.in/uploads/${raw}`;
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={university ? "Edit University Images" : "Add University"}
    >
      <form action={handleAction} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {university && <input type="hidden" name="id" value={university.id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload
            name="bannerimage_file"
            label="Banner Image"
            initialImage={imgUrl(university?.bannerimage)}
            existingName="bannerimage_existing"
          />
          <ImageUpload
            name="logoimage_file"
            label="Logo Image"
            initialImage={imgUrl(university?.logoimage)}
            existingName="logoimage_existing"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Images"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
