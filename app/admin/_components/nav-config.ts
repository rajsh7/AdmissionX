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
    items: [
      { href: "/admin/dashboard", icon: "home", label: "Home" },
      {
        href: "/admin/ads/management",
        icon: "campaign",
        label: "ADS Management",
        badge: { text: "New", variant: "new" }
      },
      {
        href: "/admin/colleges/ads-list",
        icon: "list_alt",
        label: "ADS Colleges List",
        badge: { text: "New", variant: "new" }
      },
      {
        href: "/admin/analytics/transactions",
        icon: "account_balance_wallet",
        label: "Transaction Analytics",
        badge: { text: "Updated", variant: "updated" }
      },
      {
        href: "/admin/analytics/website",
        icon: "monitoring",
        label: "Website Metrics",
        badge: { text: "Current", variant: "current" }
      },
      {
        href: "/admin/members",
        icon: "groups",
        label: "Members",
        subItems: [
          { href: "/admin/members/users", label: "Users" },
          { href: "/admin/members/roles", label: "User Roles" },
          { href: "/admin/members/status", label: "User Status" },
          { href: "/admin/members/privilege", label: "User Privilege" },
          { href: "/admin/members/groups", label: "User Group" },
        ],
      },
      {
        href: "/admin/students",
        icon: "school",
        label: "Students",
        subItems: [
          { href: "/admin/students/profile", label: "Profile Information" },
          { href: "/admin/students/bookmarks", label: "Bookmarks" },
        ],
      },
      {
        href: "/admin/colleges",
        icon: "apartment",
        label: "Colleges",
        subItems: [
          { href: "/admin/colleges/contact", label: "College Contact Card" },
          { href: "/admin/colleges/profile", label: "Profile Information" },
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
        ],
      },
      { href: "/admin/applications", icon: "description", label: "Applications" },
      {
        href: "/admin/media",
        icon: "image",
        label: "Media Information",
        subItems: [
          { href: "/admin/media/documents", label: "Documents" },
          { href: "/admin/media/gallery", label: "Gallery & Photos" },
          { href: "/admin/media/youtube", label: "Youtube Link" },
        ],
      },
      {
        href: "/admin/payment",
        icon: "payments",
        label: "Application & Payment",
        subItems: [
          { href: "/admin/payment/transactions", label: "Application Transaction" },
          { href: "/admin/payment/remarks", label: "Application Remarks" },
        ],
      },
      {
        href: "/admin/address",
        icon: "location_on",
        label: "Address Information",
        subItems: [
          { href: "/admin/address/type", label: "Address Type" },
          { href: "/admin/address/list", label: "Address" },
          { href: "/admin/address/city", label: "City" },
          { href: "/admin/address/state", label: "State" },
          { href: "/admin/address/country", label: "Country" },
        ],
      },
      { href: "/admin/queries/college-student", icon: "forum", label: "Query Between College & Student" },
      { href: "/admin/queries/admissionx", icon: "support_agent", label: "Query To Admission X 844" },
      { href: "/admin/subscribe", icon: "mail", label: "Subscribe" },
      { href: "/admin/testimonials", icon: "format_quote", label: "Testimonial" },
      { href: "/admin/reports_new", icon: "analytics", label: "Reports" },
      { href: "/admin/exams/aiea", icon: "quiz", label: "AIEA Exam" },
      {
        href: "/admin/other-info",
        icon: "info",
        label: "Other Information",
        subItems: [
          { href: "/admin/other-info/app-status", label: "Application Status" },
          { href: "/admin/other-info/card-type", label: "Card Type" },
          { href: "/admin/other-info/category", label: "Category" },
          { href: "/admin/other-info/college-type", label: "College Type" },
          { href: "/admin/other-info/education-levels", label: "Education Levels" },
          { href: "/admin/other-info/streams", label: "Stream" },
          { href: "/admin/other-info/degrees", label: "Degrees" },
          { href: "/admin/other-info/course-type", label: "Course Type" },
          { href: "/admin/other-info/courses", label: "Course" },
          { href: "/admin/other-info/facilities", label: "Facilities" },
          { href: "/admin/other-info/invite", label: "Invite" },
          { href: "/admin/other-info/payment-status", label: "Payment Status" },
          { href: "/admin/other-info/universities", label: "Universities" },
          { href: "/admin/other-info/entrance-exam", label: "Entrance Exam" },
          { href: "/admin/other-info/career", label: "Career" },
          { href: "/admin/other-info/social", label: "Social Management" },
        ],
      },
      {
        href: "/admin/website-content",
        icon: "language",
        label: "Website Content",
        subItems: [
          { href: "/admin/website-content/sliders", label: "Slider Manager" },
          { href: "/admin/website-content/offers", label: "What we offer" },
          { href: "/admin/website-content/updates", label: "Latest Update" },
        ],
      },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blogs", icon: "article", label: "Blogs" },
      {
        href: "/admin/news",
        icon: "newspaper",
        label: "News",
        subItems: [
          { href: "/admin/news", label: "All News" },
          { href: "/admin/news/type", label: "News Type" },
          { href: "/admin/news/tags", label: "News Tags" },
        ],
      },
      {
        href: "/admin/pages",
        icon: "pages",
        label: "Page Content",
        subItems: [
          { href: "/admin/pages/types", label: "Page Types" },
          { href: "/admin/pages/contents", label: "Page Contents" },
        ],
      },
    ],
  },
  {
    label: "Academic",
    items: [
      {
        href: "/admin/exams/list",
        icon: "quiz",
        label: "Examinations",
        subItems: [
          { href: "/admin/exams/status", label: "Application & Exam Status" },
          { href: "/admin/exams/app-mode", label: "Application Mode" },
          { href: "/admin/exams/type", label: "Examination Type" },
          { href: "/admin/exams/mode", label: "Examination Mode" },
          { href: "/admin/exams/eligibility", label: "Eligibility Criteria" },
          { href: "/admin/exams/department", label: "Exam Department" },
          { href: "/admin/exams/list", label: "List of Examination" },
          { href: "/admin/exams/questions", label: "All Exam Questions" },
          { href: "/admin/exams/answers", label: "All Exam Answer" },
          { href: "/admin/exams/comments", label: "All Exam Comments" },
          { href: "/admin/exams/info", label: "Examination Information" },
          { href: "/admin/exams/section", label: "Examination Section" },
          { href: "/admin/exams/counselling", label: "Exam Counselling Form" },
        ],
      },
      { href: "/admin/academic/education-boards", icon: "assignment", label: "Education Boards" },
      {
        href: "/admin/academic/career",
        icon: "explore",
        label: "Career",
        subItems: [
          { href: "/admin/academic/career/streams", label: "Popular Career Stream Details" },
          { href: "/admin/academic/career/courses", label: "Career Courses Details" },
          { href: "/admin/academic/career/opportunities", label: "Career Opportunities" },
          { href: "/admin/academic/career/interests", label: "Types of career intrest" },
          { href: "/admin/academic/career/relevants", label: "Career Relevant Post" },
        ],
      },
      {
        href: "/admin/academic/ask-qa/questions",
        icon: "question_answer",
        label: "ASK Question & Answer",
        subItems: [
          { href: "/admin/academic/ask-qa/tags", label: "ASK Question Tags" },
          { href: "/admin/academic/ask-qa/questions", label: "All ASK Question" },
          { href: "/admin/academic/ask-qa/answers", label: "All ASK Answer" },
          { href: "/admin/academic/ask-qa/comments", label: "All ASK Comments" },
        ],
      },

      { href: "/admin/universities", icon: "account_balance", label: "Universities" },
      { href: "/admin/degrees", icon: "workspace_premium", label: "Degrees" },
      { href: "/admin/courses", icon: "menu_book", label: "Courses" },
      { href: "/admin/streams", icon: "category", label: "Streams" },
      { href: "/admin/cities", icon: "location_city", label: "Cities" },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        href: "/admin/seo",
        icon: "travel_explore",
        label: "SEO",
        subItems: [
          { href: "/admin/seo/all", label: "All seo content" },
          { href: "/admin/seo/custom", label: "Custome Pge" },
          { href: "/admin/seo/dynamic", label: "Dynamic SEO Pages" },
          { href: "/admin/seo/blogs", label: "Blogs SEO Pages" },
          { href: "/admin/seo/colleges", label: "College SEO Pages" },
          { href: "/admin/seo/students", label: "Student SEO Pages" },
          { href: "/admin/seo/exams", label: "Examination SEO Pages" },
          { href: "/admin/seo/boards", label: "Boards Details SEO Pages" },
          { href: "/admin/seo/career-streams", label: "Career Stream Details SEO Pages" },
          { href: "/admin/seo/popular-career", label: "Popular Career SEO Pages" },
          { href: "/admin/seo/courses-details", label: "Course Details SEO Pages" },
          { href: "/admin/seo/exam-section", label: "Exam Section SEO Pages" },
          { href: "/admin/seo/education-level", label: "Education Level SEO Pages" },
          { href: "/admin/seo/degrees", label: "Degree SEO Pages" },
          { href: "/admin/seo/functional-area", label: "Functionalarea SEO Pages" },
          { href: "/admin/seo/courses", label: "Courses SEO Pages" },
          { href: "/admin/seo/universities", label: "University SEO Pages" },
          { href: "/admin/seo/countries", label: "Country SEO Pages" },
          { href: "/admin/seo/states", label: "State SEO Pages" },
          { href: "/admin/seo/cities", label: "City SEO Pages" },
          { href: "/admin/seo/news", label: "News SEO Pages" },
          { href: "/admin/seo/news-tags", label: "News Tags SEO Pages" },
          { href: "/admin/seo/news-type", label: "News Type SEO Pages" },
          { href: "/admin/seo/ask-qa", label: "Ask Question SEO Pages" },
          { href: "/admin/seo/ask-tags", label: "Ask Tags SEO Pages" },
        ],
      },
      { href: "/admin/landing-page-query", icon: "contact_support", label: "Landing Page Query" },
      { href: "/admin/forms", icon: "app_registration", label: "Form" },
      { href: "/admin/reports", icon: "bar_chart", label: "Reports" },
      { href: "/admin/users", icon: "manage_accounts", label: "Admin Users" },
    ],
  },
];
