export interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: {
    text: string;
    variant: "new" | "updated" | "current";
  };
  subItems?: { href: string; label: string; icon?: string }[];
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
      { href: "/admin/members/registrations", icon: "how_to_reg", label: "Registrations" },
      { href: "/admin/members/roles", icon: "manage_accounts", label: "Roles" },
      { href: "/admin/members/status", icon: "toggle_on", label: "Status" },
      {
        href: "/admin/students",
        icon: "person",
        label: "Student Profile",
        subItems: [
          { href: "/admin/students/profile", label: "Profile Information", icon: "badge" },
          { href: "/admin/students/bookmarks", label: "Bookmarks", icon: "bookmark" },
        ]
      },
      {
        href: "/admin/colleges",
        icon: "account_balance",
        label: "Colleges Profile",
        subItems: [
          { href: "/admin/colleges/contact", label: "College Contact Card", icon: "contact_mail" },
          { href: "/admin/colleges/profile", label: "Profile Information", icon: "info" },
          { href: "/admin/colleges/courses", label: "Courses", icon: "book" },
          { href: "/admin/colleges/placements", label: "Placements", icon: "work" },
          { href: "/admin/colleges/facilities", label: "Facilities", icon: "apartment" },
          { href: "/admin/colleges/faculty", label: "Faculty", icon: "person_pin" },
          { href: "/admin/colleges/achievements", label: "Achievements", icon: "emoji_events" },
          { href: "/admin/colleges/admission", label: "Admission", icon: "how_to_reg" },
          { href: "/admin/colleges/cut-offs", label: "Cut-offs", icon: "tune" },
          { href: "/admin/colleges/events", label: "Events", icon: "event" },
          { href: "/admin/colleges/faqs", label: "FAQs", icon: "help_outline" },
          { href: "/admin/colleges/gallery", label: "Gallery", icon: "photo_library" },
          { href: "/admin/colleges/management", label: "Management", icon: "groups" },
          { href: "/admin/colleges/reviews", label: "Reviews", icon: "star_rate" },
          { href: "/admin/colleges/scholarships", label: "Scholarships", icon: "school" },
          { href: "/admin/colleges/sports", label: "Sports", icon: "sports" },
          { href: "/admin/colleges/bulk-images", label: "Bulk Images", icon: "burst_mode" },
        ]
      },
      {
        href: "/admin/exams",
        icon: "quiz",
        label: "Examination Section",
        subItems: [
          { href: "/admin/exams/department", label: "Exam Department", icon: "category" },
          { href: "/admin/exams/list", label: "List of Examination", icon: "format_list_bulleted" },
          { href: "/admin/exams/questions", label: "All Exams Questions", icon: "help_outline" },
          { href: "/admin/exams/answers", label: "All Exams Answer", icon: "check_circle" },
          { href: "/admin/exams/comments", label: "All Exam Comments", icon: "comment" },
        ]
      },
      { href: "/admin/applications", icon: "description", label: "Applications" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      {
        href: "/admin/payment",
        icon: "payment",
        label: "Payment",
        subItems: [
          { href: "/admin/payment/student", label: "Student Payments", icon: "person" },
          { href: "/admin/payment/college", label: "College Payments", icon: "account_balance" },
        ]
      },
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
      { href: "/admin/exams/type", icon: "grading", label: "Exam Types" },
      { href: "/admin/exams/counselling", icon: "description", label: "Exam Counselling Form" },
    ],
  },
  {
    label: "Queries & User Interaction",
    items: [
      { href: "/admin/queries", icon: "help_outline", label: "Query" },
      { href: "/admin/queries/contact", icon: "contact_mail", label: "Contact Us Query" },
      { href: "/admin/queries/college-student", icon: "forum", label: "Query Between College & Student" },
      { href: "/admin/queries/admissionx", icon: "contact_support", label: "Query to Admission X" },
      { href: "/admin/academic/ask-qa", icon: "question_answer", label: "Ask Question & Answers" },
      { href: "/admin/landing-page-query", icon: "feed", label: "Landing Page Query Form" },
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
  {
    label: "Account",
    items: [
      { href: "/admin/profile", icon: "manage_accounts", label: "My Profile" },
    ],
  },
];
