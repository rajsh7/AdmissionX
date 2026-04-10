"use client";

import { useState, useTransition } from "react";

interface DeleteButtonProps {
  /** Server action or async function to call on confirmed delete */
  action: () => Promise<void>;
  /** Optional label for the initial button */
  label?: string;
  /** Optional small size variant */
  size?: "sm" | "xs";
  /** Optional visual variant */
  variant?: "ghost" | "classic";
  /** Optional icon to display instead of or along with label */
  icon?: React.ReactNode;
}

export default function DeleteButton({
  action,
  label = "Delete",
  size = "sm",
  variant = "ghost",
  icon,
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
  const px      = size === "xs" ? "px-1.5 py-0.5" : "px-3 py-1";
  
  const isClassic = variant === "classic";
  const btnBase = isClassic 
    ? "bg-red-600 text-white hover:bg-red-700 font-bold uppercase tracking-tighter" 
    : "text-red-500 hover:text-red-700 hover:bg-red-50 font-semibold";

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
          className={`${textSm} font-bold px-2 py-1 bg-red-600 text-white rounded-[2px] hover:bg-red-700 transition-colors uppercase`}
        >
          Yes
        </button>
        <button
          onClick={handleCancel}
          className={`${textSm} font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-[2px] hover:bg-slate-200 transition-colors uppercase`}
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={handleFirstClick}
      className={`${textSm} ${icon ? "w-9 h-9 flex items-center justify-center" : px} rounded-[2px] ${btnBase} transition-colors min-w-[36px] shadow-sm`}
      title={label}
    >
      {icon ? icon : label}
    </button>
  );
}




