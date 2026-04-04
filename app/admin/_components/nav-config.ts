export interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: {
    text: string;
    variant: "new" | "updated" | "current";
  };
  subItems?: { href: string; label: string }[];
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "MAIN MENU",
    items: [
      { href: "/admin/dashboard", icon: "home", label: "Home" },
      {
        href: "/admin/students",
        icon: "person",
        label: "Student Profile",
        subItems: [
          { href: "/admin/students/profile", label: "Profile Information" },
          { href: "/admin/students/bookmarks", label: "Bookmarks" },
        ]
      },
      {
        href: "/admin/colleges",
        icon: "account_balance",
        label: "Colleges Profile",
        subItems: [
          { href: "/admin/colleges/contact", label: "College Contact Card" },
          { href: "/admin/colleges/profile", label: "Profile information" },
          { href: "/admin/colleges/management", label: "College Management Information" },
          { href: "/admin/colleges/courses", label: "College Course" },
          { href: "/admin/colleges/events", label: "College Events" },
          { href: "/admin/colleges/facilities", label: "College Facilities" },
          { href: "/admin/colleges/faculty", label: "College Faculty" },
          { href: "/admin/colleges/placements", label: "College Placement" },
          { href: "/admin/colleges/scholarships", label: "College Scholarship" },
          { href: "/admin/colleges/cut-offs", label: "College Cut Offs" },
          { href: "/admin/colleges/sports", label: "College Sports & Activity" },
          { href: "/admin/colleges/admission", label: "College Admission Procedure" },
          { href: "/admin/colleges/reviews", label: "College Reviews" },
          { href: "/admin/colleges/faqs", label: "College Faqs" },
        ]
      },
      { href: "/admin/exams", icon: "quiz", label: "Examination Section" },
      { href: "/admin/applications", icon: "description", label: "Applications" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { href: "/admin/payment", icon: "payment", label: "Payment" },
      { href: "/admin/payment/transactions", icon: "receipt_long", label: "Transaction" },
    ],
  },
  {
    label: "Advertising & Analytics",
    items: [
      { href: "/admin/ads/management", icon: "campaign", label: "ADS Management" },
      { href: "/admin/ads/colleges-list", icon: "list_alt", label: "ADS Colleges List" },
      { href: "/admin/analytics/transactions", icon: "account_balance_wallet", label: "Transaction Analytics" },
      { href: "/admin/analytics/website", icon: "monitoring", label: "Website Metrics" },
    ],
  },
  {
    label: "Website Content Management",
    items: [
      { href: "/admin/blogs", icon: "article", label: "Blogs" },
      { href: "/admin/news", icon: "newspaper", label: "News" },
      { href: "/admin/media", icon: "imagesmode", label: "Media Information" },
      { href: "/admin/pages", icon: "layers", label: "Page Content" },
      { href: "/admin/seo", icon: "search", label: "SEO Content" },
      { href: "/admin/website-content", icon: "web", label: "Website Content" },
      { href: "/admin/website-content/homepage", icon: "home", label: "Homepage Manager" },
    ],
  },
  {
    label: "Education & Career Information",
    items: [
      { href: "/admin/academic/education-boards", icon: "school", label: "Education Boards" },
      { href: "/admin/streams", icon: "psychology", label: "Popular Career Stream Details" },
      { href: "/admin/courses", icon: "book", label: "Career Courses Details" },
      { href: "/admin/academic/career", icon: "work", label: "Career Opportunities" },
    ],
  },
  {
    label: "Examination Management",
    items: [
      { href: "/admin/exams/aiea", icon: "quiz", label: "AIEA Exam" },
      { href: "/admin/exams/info", icon: "info", label: "Examination Information" },
      { href: "/admin/exams", icon: "grading", label: "Examination Section" },
      { href: "/admin/exams/counselling", icon: "description", label: "Exam Counselling Form" },
    ],
  },
  {
    label: "Queries & User Interaction",
    items: [
      { href: "/admin/queries", icon: "help_outline", label: "Query" },
      { href: "/admin/queries/college-student", icon: "forum", label: "Query Between College & Student" },
      { href: "/admin/queries/admissionx", icon: "contact_support", label: "Query to Admission X" },
      { href: "/admin/academic/ask-qa", icon: "question_answer", label: "Ask Question & Answers" },
      { href: "/admin/landing-page-query", icon: "feed", label: "Landing Page Query Form" },
    ],
  },
  {
    label: "Members",
    items: [
      { href: "/admin/members/registrations", icon: "how_to_reg", label: "Registrations" },
      { href: "/admin/members/users", icon: "group", label: "Platform Users" },
      { href: "/admin/members/roles", icon: "manage_accounts", label: "Roles" },
      { href: "/admin/members/status", icon: "toggle_on", label: "Status" },
    ],
  },
  {
    label: "Communication & Feedback",
    items: [
      { href: "/admin/subscribe", icon: "mail", label: "Subscribe" },
      { href: "/admin/testimonials", icon: "reviews", label: "Testimonial" },
      { href: "/admin/reports", icon: "assessment", label: "Reports" },
      { href: "/admin/other-info", icon: "info_i", label: "Other Information" },
    ],
  },
];
