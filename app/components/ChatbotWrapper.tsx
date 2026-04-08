"use client";

import { usePathname } from "next/navigation";
import ChatbotWidget from "./ChatbotWidget";

export default function ChatbotWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <ChatbotWidget />;
}
