"use client";

import { usePathname } from "next/navigation";
import SmoothScrollProvider from "./SmoothScrollProvider";
import PageTransition from "./PageTransition";

export default function PublicProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <SmoothScrollProvider>
      <PageTransition>{children}</PageTransition>
    </SmoothScrollProvider>
  );
}
