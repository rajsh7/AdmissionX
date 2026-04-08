import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ChatbotWrapper from "./components/ChatbotWrapper";
import PublicProviders from "./components/PublicProviders";

export const metadata: Metadata = {
  title: "Admissionx - Find Your Dream College",
  description:
    "Discover top universities and courses that match your career goals. Explore over 500+ institutes worldwide.",
  keywords:
    "college admissions, university rankings, entrance exams, study abroad, courses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://admin.admissionx.in" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="font-display antialiased overflow-x-hidden">
        <PublicProviders>
          {children}
        </PublicProviders>

        <ChatbotWrapper />

        <Script id="fonts-loaded" strategy="afterInteractive">{`
          (function() {
            function markLoaded() {
              document.documentElement.classList.add('fonts-loaded');
            }
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(markLoaded);
            } else {
              setTimeout(markLoaded, 500);
            }
          })();
        `}</Script>
      </body>
    </html>
  );
}
