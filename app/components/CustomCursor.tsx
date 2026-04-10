"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
  const cursorDot = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on desktop
    if (window.innerWidth < 1024 || !window.matchMedia("(pointer: fine)").matches) return;

    const dot = cursorDot.current!;
    const ring = cursorRing.current!;

    dot.style.opacity = "1";
    ring.style.opacity = "1";

    let mouseX = 0, mouseY = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      gsap.to(dot, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: "power3.out",
      });

      gsap.to(ring, {
        x: mouseX,
        y: mouseY,
        duration: 0.45,
        ease: "power3.out",
      });
    };

    // Hover effects on interactive elements
    const onEnter = () => {
      gsap.to(ring, { scale: 1.8, opacity: 0.5, duration: 0.3, ease: "power2.out" });
      gsap.to(dot, { scale: 0.5, duration: 0.3 });
    };

    const onLeave = () => {
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    };

    // Click effect
    const onClick = () => {
      gsap.to(ring, { scale: 2.5, opacity: 0, duration: 0.4, ease: "power2.out",
        onComplete: () => { gsap.set(ring, { scale: 1, opacity: 1 }); }
      });
    };

    const interactiveEls = document.querySelectorAll("a, button, [role='button'], input, select, textarea, label");
    interactiveEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      interactiveEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={cursorDot}
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 opacity-0 mix-blend-difference"
        style={{ willChange: "transform" }}
      />
      {/* Ring */}
      <div
        ref={cursorRing}
        className="fixed top-0 left-0 w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 opacity-0"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
