"use client";

import { useState, useTransition } from "react";

interface DeleteButtonProps {
  /** Server action or async function to call on confirmed delete */
  action: () => Promise<void>;
  /** Optional label for the initial button */
  label?: string;
  /** Optional size variant */
  size?: "lg" | "sm" | "xs";
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
  const px      = size === "xs" ? "px-1.5 py-0.5" : size === "lg" ? "px-2 py-2.5 w-full text-center" : "px-3 py-1";
  
  const isClassic = variant === "classic";
  const btnBase = isClassic 
    ? "bg-red-600 text-white hover:bg-red-700 font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-red-500/20" 
    : "text-red-500 hover:text-red-700 hover:bg-red-50 font-semibold";

  const borderRadius = size === "lg" ? "rounded-xl" : "rounded-[2px]";

  if (isPending) {
    return (
      <span className={`${textSm} text-slate-400 font-medium italic ${size === "lg" ? "w-full text-center py-2 block" : ""}`}>
        Deleting…
      </span>
    );
  }

  if (confirming) {
    if (size === "lg") {
      return (
        <span className="inline-flex items-center justify-center gap-1 w-full bg-red-50 border border-red-100 rounded-xl py-1 px-1 text-center">
          <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter mr-1">Sure?</span>
          <button
            onClick={handleConfirm}
            className="text-[10px] font-black px-2 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors uppercase"
          >
            Yes
          </button>
          <button
            onClick={handleCancel}
            className="text-[10px] font-black px-2 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors uppercase"
          >
            No
          </button>
        </span>
      );
    }
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
      className={`${textSm} ${icon ? "w-9 h-9 flex items-center justify-center" : px} ${borderRadius} ${btnBase} transition-colors min-w-[36px] shadow-sm`}
      title={label}
    >
      {icon ? icon : label}
    </button>
  );
}




