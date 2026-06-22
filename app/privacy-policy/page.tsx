import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | AdmissionX",
  description: "Read the Privacy Policy explaining how AdmissionX collects, uses, shares, and protects your personal information.",
};

const LAST_UPDATED = "June 1, 2026";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "collect", label: "Information We Collect" },
  { id: "methods", label: "Collection Methods" },
  { id: "usage", label: "Use of Information" },
  { id: "sharing", label: "Information Sharing" },
  { id: "optout", label: "Email Opt-Out" },
  { id: "third-party", label: "Third Party Sites" },
  { id: "updates", label: "Policy Updates" },
  { id: "jurisdiction", label: "Jurisdiction" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Header />

      {/* ── Hero ── */}
      <div className="pt-[100px] lg:pt-[104px] bg-white border-b border-neutral-100 relative overflow-hidden">
        
        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-neutral-500 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            Legal Document
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 mb-4 leading-tight">Privacy Policy</h1>
          <p className="text-neutral-500 text-base max-w-xl mx-auto leading-relaxed">
            How AdmissionX collects, uses, and protects your personal information.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 rounded-full px-4 py-1.5 text-neutral-600">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              Last updated: {LAST_UPDATED}
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 rounded-full px-4 py-1.5 text-neutral-600">
              <span className="material-symbols-outlined text-[14px]">business</span>
              Saroj Entertainment Pvt. Ltd.
            </span>
          </div>
        </div>
      </div>

      {/* ── Notice Banner ── */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-[18px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="text-sm text-amber-800">By using AdmissionX, you agree to this Privacy Policy. It applies to all current and former visitors and customers.</p>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="flex gap-10 items-start">

          {/* ── Sticky Sidebar TOC ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-[112px] self-start">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
              <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-4">Contents</p>
              <nav className="space-y-1">
                {TOC.map((item) => (
                  <a key={item.id} href={`#${item.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium text-neutral-500 hover:text-[#FF3C3C] hover:bg-red-50 transition-all group">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-[#FF3C3C] transition-colors flex-shrink-0" />
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="mt-5 pt-4 border-t border-neutral-100">
                <Link href="/terms-and-conditions" className="flex items-center gap-2 text-[12px] font-bold text-[#FF3C3C] hover:underline">
                  <span className="material-symbols-outlined text-[14px]">gavel</span>
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Content ── */}
          <main className="flex-1 min-w-0 space-y-6">

            <Card id="overview" icon="shield" title="Privacy Policy Overview" color="red">
              <P>This Privacy Policy applies to admissionx.com. AdmissionX recognizes the importance of maintaining your privacy. We value your trust and describe how we treat user information collected on our website and offline sources.</P>
              <P>By visiting and/or using our website, you agree to this Privacy Policy. It applies to current and former visitors and online customers.</P>
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-sm font-bold text-red-800 mb-1">Platform Ownership</p>
                <p className="text-sm text-red-700">AdmissionX is a product of <strong>Saroj Entertainment Pvt. Ltd.</strong>, an Indian company registered under the Companies Act, 2013, with registered office at 123 Education Street, Mumbai, Maharashtra 400001. AdmissionX is developed, owned, and operated by Saroj Entertainment Pvt. Ltd.</p>
              </div>
            </Card>

            <Card id="collect" icon="person" title="Information We Collect" color="blue">
              <InfoBlock title="Contact Information" icon="contact_mail">
                We may collect your name, email, mobile number, phone number, street, city, state, pin code, country, and IP address.
              </InfoBlock>
              <InfoBlock title="Payment & Billing Information" icon="payment">
                We may collect billing name and address when you register for admission. We never collect credit card details directly — payments are processed by our partner PayU Money.
              </InfoBlock>
              <InfoBlock title="Information You Post" icon="forum">
                We collect information you post in public spaces on our website or on third-party social media sites.
              </InfoBlock>
              <InfoBlock title="Demographic Information" icon="bar_chart">
                We may collect demographic data, educational preferences, and event participation info during your use of our platform or through surveys.
              </InfoBlock>
              <InfoBlock title="Technical Information" icon="devices">
                We may collect your IP address, browser type, pages visited, time spent, referral source, and device/OS details.
              </InfoBlock>
            </Card>

            <Card id="methods" icon="sync" title="How We Collect Information" color="violet">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: "edit", title: "Directly from You", desc: "When you register, book admission, post comments, or contact us via phone or email." },
                  { icon: "analytics", title: "Passively", desc: "Via Google Analytics, Google Webmaster, browser cookies, and web beacons tracking your site usage." },
                  { icon: "group", title: "From Third Parties", desc: "Via integrated social media features — platforms may share your name and email with us." },
                ].map((item) => (
                  <div key={item.title} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                    <span className="material-symbols-outlined text-violet-500 text-[20px] mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <p className="text-[13px] font-bold text-neutral-800 mb-1">{item.title}</p>
                    <p className="text-[12px] text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card id="usage" icon="tune" title="Use of Your Personal Information" color="green">
              <BulletList items={[
                "Contact you for purchase confirmation or promotional purposes.",
                "Respond to your requests and confirm admission registrations.",
                "Improve our products, services, and personalize your experience.",
                "Analyze site trends and customer interests.",
                "Protect our company, customers, and websites for security purposes.",
                "Send marketing communications about promotions, offers, and new features.",
                "Send transactional emails or SMS about your account or transactions.",
                "As otherwise permitted by law.",
              ]} color="green" />
            </Card>

            <Card id="sharing" icon="share" title="Sharing Information with Third Parties" color="orange">
              <BulletList items={[
                "With third-party service providers who help manage our registration, payments, or messaging processes.",
                "With educational institutions responsible for fulfilling admission obligations.",
                "With business partners as described in their respective privacy policies.",
                "To comply with legal obligations — court orders, government agencies, or fraud investigations.",
                "With successors in the event of a business sale or transfer.",
                "For other reasons — we will inform you before doing so.",
              ]} color="orange" />
            </Card>

            <Card id="optout" icon="unsubscribe" title="Email Opt-Out" color="red">
              <P>You can opt out of marketing emails by emailing <a href="mailto:welcome@admissionx.info" className="text-[#FF3C3C] font-semibold hover:underline">welcome@admissionx.info</a>. Processing may take up to 10 days.</P>
              <P>Even after opting out, we will still send transactional messages about your purchases via email and SMS.</P>
            </Card>

            <Card id="third-party" icon="open_in_new" title="Third Party Sites" color="blue">
              <P>Links to third-party websites on our platform are provided for convenience. We do not control those sites and their privacy policies do not fall under this policy. We are not responsible for third-party practices.</P>
            </Card>

            <Card id="updates" icon="update" title="Updates to This Policy" color="violet">
              <P>We may update this Privacy Policy periodically. We will notify you of material changes as required by law and post an updated copy on our website. Please check our site regularly for updates.</P>
            </Card>

            <Card id="jurisdiction" icon="gavel" title="Jurisdiction" color="green">
              <P>By visiting our website, your visit and any privacy disputes are subject to this Policy and our Terms of Use. All disputes shall be governed by the laws of India.</P>
              <P>For questions, email us at <a href="mailto:welcome@admissionx.info" className="text-[#FF3C3C] font-semibold hover:underline">welcome@admissionx.info</a>.</P>
            </Card>

            {/* Contact Card */}
            <div className="bg-gradient-to-r from-[#FF3C3C] to-[#c0392b] rounded-2xl p-6 text-white">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>contact_support</span>
                Contact for Privacy Concerns
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: "business", label: "Company", value: "Saroj Entertainment Pvt. Ltd." },
                  { icon: "location_on", label: "Address", value: "123 Education Street, Mumbai, Maharashtra 400001" },
                  { icon: "mail", label: "Email", value: "welcome@admissionx.info", href: "mailto:welcome@admissionx.info" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                    <span className="material-symbols-outlined text-white/60 text-[16px] block mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <p className="text-[11px] font-bold text-white/60 uppercase tracking-wide mb-0.5">{item.label}</p>
                    {item.href
                      ? <a href={item.href} className="text-[13px] font-semibold text-white hover:underline">{item.value}</a>
                      : <p className="text-[13px] font-semibold text-white">{item.value}</p>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Footer strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200">
              <p className="text-xs text-neutral-400">© 2026 Saroj Entertainment Pvt. Ltd. All Rights Reserved.</p>
              <div className="flex items-center gap-4 text-xs">
                <Link href="/terms-and-conditions" className="text-neutral-500 hover:text-[#FF3C3C] transition-colors font-semibold">Terms & Conditions</Link>
                <span className="text-neutral-300">·</span>
                <Link href="/contact-us" className="text-neutral-500 hover:text-[#FF3C3C] transition-colors font-semibold">Contact Us</Link>
              </div>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  red:    { bg: "bg-red-50",    icon: "text-[#FF3C3C]", border: "border-red-100" },
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500",  border: "border-blue-100" },
  violet: { bg: "bg-violet-50", icon: "text-violet-500",border: "border-violet-100" },
  green:  { bg: "bg-emerald-50",icon: "text-emerald-500",border: "border-emerald-100" },
  orange: { bg: "bg-orange-50", icon: "text-orange-500",border: "border-orange-100" },
};

function Card({ id, icon, title, color, children }: { id: string; icon: string; title: string; color: string; children: React.ReactNode }) {
  const c = colorMap[color] ?? colorMap.red;
  return (
    <div id={id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden scroll-mt-32">
      <div className={`flex items-center gap-3 px-6 py-4 ${c.bg} border-b ${c.border}`}>
        <span className={`material-symbols-outlined text-[20px] ${c.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <h2 className="text-[15px] font-black text-neutral-800">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-3">{children}</div>
    </div>
  );
}

function InfoBlock({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="material-symbols-outlined text-[16px] text-neutral-500" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <p className="text-[13px] font-bold text-neutral-800 mb-0.5">{title}</p>
        <p className="text-[13px] text-neutral-500 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function BulletList({ items, color }: { items: string[]; color: string }) {
  const c = colorMap[color] ?? colorMap.red;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[13px] text-neutral-600">
          <span className={`material-symbols-outlined text-[16px] ${c.icon} flex-shrink-0 mt-0.5`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-neutral-600 leading-relaxed">{children}</p>;
}
