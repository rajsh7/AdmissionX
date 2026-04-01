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
      { href: "/admin/students/profile", icon: "person", label: "Student Profile" },
      { href: "/admin/colleges/profile", icon: "account_balance", label: "Colleges Profile" },
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
    ],
  },
];
