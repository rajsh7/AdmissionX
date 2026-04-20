"use client";

import Clarity from "@microsoft/clarity";

const ENABLED = !!process.env.NEXT_PUBLIC_CLARITY_ID;

export function clarityEvent(name: string) {
  if (!ENABLED) return;
  try { Clarity.event(name); } catch {}
}

export function clarityTag(key: string, value: string | string[]) {
  if (!ENABLED) return;
  try { Clarity.setTag(key, value); } catch {}
}

export function clarityUpgrade(reason: string) {
  if (!ENABLED) return;
  try { Clarity.upgrade(reason); } catch {}
}

export function clarityIdentify(id: string, name?: string, role?: string) {
  if (!ENABLED) return;
  try {
    Clarity.identify(id, undefined, undefined, name);
    if (role) Clarity.setTag("role", role);
  } catch {}
}
