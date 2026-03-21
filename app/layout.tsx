import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-lexend",
});

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Load both Outlined (used in public pages) and Rounded (used in admin) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        {/* Detect when icon fonts are ready and reveal icons — prevents FOUT */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function markLoaded() {
                  document.documentElement.classList.add('fonts-loaded');
                }
                if (document.fonts && document.fonts.ready) {
                  document.fonts.ready.then(markLoaded);
                } else {
                  // Fallback for older browsers — reveal after 500ms max
                  setTimeout(markLoaded, 500);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${lexend.variable} font-display antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
