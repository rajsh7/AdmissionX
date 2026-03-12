"use client";

import { useState, useTransition } from "react";

interface DeleteButtonProps {
  /** Server action or async function to call on confirmed delete */
  action: () => Promise<void>;
  /** Optional label for the initial button */
  label?: string;
  /** Optional small size variant */
  size?: "sm" | "xs";
}

export default function DeleteButton({
  action,
  label = "Delete",
  size = "sm",
}: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFirstClick() {
    setConfirming(true);
  }

  function handleCancel() {
    setConfirming(false);
  }

  function handleConfirm() {
    startTransition(async () => {
      await action();
      setConfirming(false);
    });
  }

  const textSm  = size === "xs" ? "text-[11px]" : "text-xs";
  const px      = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-1";

  if (isPending) {
    return (
      <span className={`${textSm} text-slate-400 font-medium italic`}>
        Deleting…
      </span>
    );
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className={`${textSm} font-semibold text-red-600`}>Sure?</span>
        <button
          onClick={handleConfirm}
          className={`${textSm} font-bold ${px} bg-red-600 text-white rounded hover:bg-red-700 transition-colors`}
        >
          Yes
        </button>
        <button
          onClick={handleCancel}
          className={`${textSm} font-semibold ${px} bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors`}
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={handleFirstClick}
      className={`${textSm} font-semibold ${px} rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors`}
    >
      {label}
    </button>
  );
}
