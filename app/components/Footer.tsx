import Link from "next/link";

const footerLinks = {
  "Quick Links": [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact Us", href: "/contact" },
    { label: "Help Center", href: "/help" },
    { label: "Become a Partner", href: "/partner" },
  ],
  "Top Courses": [
    { label: "Engineering", href: "/courses/engineering" },
    { label: "Management", href: "/courses/management" },
    { label: "Science", href: "/courses/science" },
    { label: "Medical", href: "/courses/medical" },
    { label: "Art & Humanities", href: "/courses/arts" },
  ],
  "Top Exams": [
    { label: "Engineering Exam", href: "/exams/engineering" },
    { label: "Medical Exam", href: "/exams/medical" },
    { label: "Management Exam", href: "/exams/management" },
    { label: "Law Exam", href: "/exams/law" },
    { label: "Design Exam", href: "/exams/design" },
  ],
  "Study Abroad": [
    { label: "Study in USA", href: "/study-abroad/usa" },
    { label: "Study in UK", href: "/study-abroad/uk" },
    { label: "Study in Australia", href: "/study-abroad/australia" },
    { label: "Study in Canada", href: "/study-abroad/canada" },
    { label: "Study in Germany", href: "/study-abroad/germany" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="w-full px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-3 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-lg">school</span>
            </div>
            <span className="text-lg font-bold text-white">Admissionx</span>
          </Link>
          <div className="text-sm text-slate-500">
            © 2024 Admissionx. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Terms
            </Link>
            <Link
              href="/help"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
