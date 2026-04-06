"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const el = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", clearProps: "all" }
      );
    });
    return () => ctx.revert();
  }, [pathname]);

  return (
    <div ref={el}>
      {children}
    </div>
  );
}
