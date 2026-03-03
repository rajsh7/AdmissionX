"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/Background-images/1.jpg",
  "/Background-images/17.jpg",
  "/Background-images/18.jpg",
  "/Background-images/19.jpg",
  "/Background-images/171.jpg",
  "/Background-images/bg-signup1.jpg",
];

export function AuthBackgroundSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % IMAGES.length),
      4000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            i === index ? "opacity-70" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url('${src}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-background-light/80 via-background-light/70 to-background-light/80 dark:from-background-dark/85 dark:via-background-dark/85 dark:to-background-dark/90" />
    </div>
  );
}

