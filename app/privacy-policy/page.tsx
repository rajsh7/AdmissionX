import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | AdmissionX",
  description:
    "Read the Privacy Policy explaining how AdmissionX collects, uses, shares, and protects your personal information.",
};

const LAST_UPDATED = "July 4, 2017";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="bg-neutral-900 pb-14 pt-24 lg:pt-[116px]">
        <div className="w-full px-6 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="flex-shrink-0 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
              <span
                className="material-symbols-outlined text-[28px] text-red-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
            </div>
            <div className="mt-4">
              <h1 className="mb-2 text-3xl font-black leading-tight text-white sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400">
                This Privacy Policy applies to admissionx.info. AdmissionX
                recognizes the importance of maintaining your privacy, values
                your trust, and describes how we treat user information
                collected on our website and through related offline sources.
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Last updated:{" "}
                <span className="font-semibold text-neutral-300">{LAST_UPDATED}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[58px] z-20 border-b border-neutral-100 bg-white lg:top-[116px]">
        <div className="w-full overflow-x-auto px-6 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold">
            {[
              ["#overview", "Overview"],
              ["#collect", "Information Collected"],
              ["#collection-methods", "Collection Methods"],
              ["#usage", "Use of Information"],
              ["#sharing", "Information Sharing"],
              ["#optout", "Email Opt-Out"],
              ["#updates", "Updates"],
              ["#jurisdiction", "Jurisdiction"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full py-12">
        <div className="overflow-hidden border-y border-neutral-100 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-blue-100 bg-blue-50 px-8 py-4">
            <span
              className="material-symbols-outlined mt-0.5 flex-shrink-0 text-[18px] text-blue-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <p className="text-sm text-blue-800">
              By visiting and/or using our website, you agree to this Privacy
              Policy. This page applies to current and former visitors to our
              website and to our online customers.
            </p>
          </div>

          <div className="space-y-12 px-8 py-10 sm:px-12">
            <section id="overview">
              <SectionHeading title="Privacy Policy" />
              <Prose>
                This Privacy Policy applies to admissionx.info. AdmissionX
                recognizes the importance of maintaining your privacy. We value
                your privacy and appreciate your trust in us. This Policy
                describes how we treat user information we collect on
                https://www.admissionx.com and other offline sources.
              </Prose>
              <Prose>
                By visiting and/or using our website, you agree to this Privacy
                Policy. This Privacy Policy applies to current and former
                visitors to our website and to our online customers.
              </Prose>
              <Prose>
                Admissionx.info is a property of Yuvi Aviation Pvt. Ltd., an
                Indian company registered under the Companies Act, 2013 having
                its registered office at L-5, Lajpat Nagar 2, New Delhi -
                110024.
              </Prose>
            </section>

            <Divider />

            <section id="collect">
              <SectionHeading title="Information We Collect" />
              <SubHeading>Contact information</SubHeading>
              <Prose>
                We might collect your name, email, mobile number, phone number,
                street, city, state, pin code, country, and IP address.
              </Prose>

              <SubHeading>Payment and billing information</SubHeading>
              <Prose>
                We might collect your billing name, billing address, and
                payment method when you register for admission. We never collect
                your credit card number, credit card expiry date, or other
                credit card details on our website. Credit card information is
                obtained and processed by our online payment partner, PayU
                Money.
              </Prose>

              <SubHeading>Information you post</SubHeading>
              <Prose>
                We collect information you post in a public space on our
                website or on a third-party social media site belonging to
                admissionx.info.
              </Prose>

              <SubHeading>Demographic information</SubHeading>
              <Prose>
                We may collect demographic information about you, educational
                institutions and courses you like, events you intend to
                participate in, or any other information provided by you during
                the use of our website. We might collect this as a part of a
                survey also.
              </Prose>

              <SubHeading>Other information</SubHeading>
              <Prose>
                If you use our website, we may collect information about your
                IP address and the browser you&apos;re using. We might look at
                what site you came from, duration of time spent on our website,
                pages accessed, or what site you visit when you leave us. We
                might also collect the type of mobile device you are using, or
                the version of the operating system your computer or device is
                running.
              </Prose>
            </section>

            <Divider />

            <section id="collection-methods">
              <SectionHeading title="We Collect Information In Different Ways" />
              <SubHeading>We collect information directly from you</SubHeading>
              <Prose>
                We collect information directly from you when you register on
                the website or book admission. We also collect information if
                you post comments on our websites or ask us a question through
                phone or email.
              </Prose>

              <SubHeading>We collect information from you passively</SubHeading>
              <Prose>
                We use tracking tools like Google Analytics, Google Webmaster,
                browser cookies, and web beacons for collecting information
                about your usage of our website.
              </Prose>

              <SubHeading>We get information about you from third parties</SubHeading>
              <Prose>
                For example, if you use an integrated social media feature on
                our websites, the third-party social media site will give us
                certain information about you. This could include your name and
                email address.
              </Prose>
            </section>

            <Divider />

            <section id="usage">
              <SectionHeading title="Use of Your Personal Information" />
              <BulletList
                items={[
                  "We use information to contact you for confirmation of a purchase on our website or for other promotional purposes.",
                  "We use information to respond to your requests or questions and to confirm your registration for admission or associated services and events.",
                  "We use information to improve our products and services and to customize your experience with us.",
                  "We use information to look at site trends and customer interests and may combine information we get from you with information we get from third parties.",
                  "We use information for security purposes to protect our company, our customers, or our websites.",
                  "We use information for marketing purposes, including special promotions, offers, new features, and third-party products or services we think you may find interesting.",
                  "We use information to send transactional communications such as emails or SMS about your account or transactions.",
                  "We use information as otherwise permitted by law.",
                ]}
              />
            </section>

            <Divider />

            <section id="sharing">
              <SectionHeading title="Sharing of Information with Third Parties" />
              <BulletList
                items={[
                  "We will share information with third parties who perform services on our behalf, including vendors who help manage our online registration process, payment processors, or transactional message processors. Some vendors may be located outside India.",
                  "We will share information with educational institutions and service providers responsible for fulfilling the purchase obligation. They may use the information we give them as described in their privacy policies.",
                  "We will share information with our business partners, who use the information as described in their privacy policies.",
                  "We may share information if we think we have to in order to comply with the law or to protect ourselves, including responding to a court order, subpoena, government agency, investigatory body, or when investigating potential fraud.",
                  "We may share information with any successor to all or part of our business, for example if part of our business is sold and the customer list forms part of that transaction.",
                  "We may share your information for reasons not described in this policy, but we will tell you before we do this.",
                ]}
              />
            </section>

            <Divider />

            <section id="optout">
              <SectionHeading title="Email Opt-Out" />
              <Prose>
                You can opt out of receiving our marketing emails. To stop
                receiving our promotional emails, please email
                unsubscribe@admissionx.com. It may take about ten days to
                process your request.
              </Prose>
              <Prose>
                Even if you opt out of marketing messages, we will still send
                transactional messages through email and SMS about your
                purchases.
              </Prose>
            </section>

            <Divider />

            <section>
              <SectionHeading title="Third Party Sites" />
              <Prose>
                If you click on one of the links to third-party websites, you
                may be taken to websites we do not control. This policy does not
                apply to the privacy practices of those websites. Read the
                privacy policy of other websites carefully. We are not
                responsible for these third-party sites.
              </Prose>
            </section>

            <Divider />

            <section id="updates">
              <SectionHeading title="Updates to This Policy" />
              <Prose>
                This Privacy Policy was last updated on 04/07/2017. From time
                to time we may change our privacy practices. We will notify you
                of any material changes to this policy as required by law. We
                will also post an updated copy on our website. Please check our
                site periodically for updates.
              </Prose>
            </section>

            <Divider />

            <section id="jurisdiction">
              <SectionHeading title="Jurisdiction" />
              <Prose>
                If you choose to visit the website, your visit and any dispute
                over privacy are subject to this Policy and the website&apos;s
                terms of use. In addition to the foregoing, any disputes arising
                under this Policy shall be governed by the laws of India.
              </Prose>
              <Prose>
                If you have any questions about this Policy or other privacy
                concerns, you can email us at support@admissionx.com.
              </Prose>
            </section>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <h3 className="mb-3 text-sm font-bold text-neutral-800">
                Contact for Privacy Concerns
              </h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-neutral-400">
                    business
                  </span>
                  <span>Yuvi Aviation Pvt. Ltd.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-neutral-400">
                    location_on
                  </span>
                  <span>L-5, Lajpat Nagar 2, New Delhi - 110024</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-neutral-400">
                    mail
                  </span>
                  <a
                    href="mailto:support@admissionx.com"
                    className="text-red-600 hover:underline"
                  >
                    support@admissionx.com
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-4 border-t border-neutral-100 pt-8 sm:flex-row sm:items-center">
              <p className="text-xs text-neutral-400">
                © 2025 AdmissionX. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs">
                <Link
                  href="/terms-and-conditions"
                  className="text-neutral-500 transition-colors hover:text-red-600"
                >
                  Terms &amp; Conditions
                </Link>
                <Link
                  href="/contact-us"
                  className="text-neutral-500 transition-colors hover:text-red-600"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="mb-4 text-lg font-black text-neutral-900">{title}</h2>;
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-5 text-sm font-bold text-neutral-700">{children}</h3>;
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm leading-relaxed text-neutral-600">{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mb-4 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-600">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <hr className="border-neutral-100" />;
}
