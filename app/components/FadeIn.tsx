"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 0.6,
  className,
  once = true,
}: FadeInProps) {
  const axis = (direction === "left" || direction === "right" ? "x" : "y") as "x" | "y";
  const sign = direction === "down" || direction === "right" ? 1 : -1;

  const variants: Variants = {
    hidden: {
      opacity: 0,
      [axis]: direction === "none" ? 0 : sign * distance,
    } as any,
    visible: {
      opacity: 1,
      [axis]: 0,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    } as any,
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

// Stagger container — wraps a list and staggers children
export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  delayStart = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayStart?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delayStart },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Child item for use inside StaggerContainer
export function StaggerItem({
  children,
  className,
  direction = "up",
  distance = 20,
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}) {
  const axis = (direction === "left" || direction === "right" ? "x" : "y") as "x" | "y";
  const sign = direction === "down" || direction === "right" ? 1 : -1;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, [axis]: direction === "none" ? 0 : sign * distance } as any,
        visible: { opacity: 1, [axis]: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } as any,
      }}
    >
      {children}
    </motion.div>
  );
}
