export const DESTINATION_META: Record<
  string,
  { flag: string; highlight: string; color: string }
> = {
  "united states": {
    flag: "🇺🇸",
    highlight: "World-class research & innovation",
    color: "from-blue-600 to-blue-800",
  },
  usa: {
    flag: "🇺🇸",
    highlight: "World-class research & innovation",
    color: "from-blue-600 to-blue-800",
  },
  "united kingdom": {
    flag: "🇬🇧",
    highlight: "Prestigious heritage universities",
    color: "from-indigo-600 to-indigo-800",
  },
  uk: {
    flag: "🇬🇧",
    highlight: "Prestigious heritage universities",
    color: "from-indigo-600 to-indigo-800",
  },
  canada: {
    flag: "🇨🇦",
    highlight: "Welcoming & multicultural campuses",
    color: "from-red-600 to-red-800",
  },
  australia: {
    flag: "🇦🇺",
    highlight: "Global rankings, vibrant lifestyle",
    color: "from-yellow-500 to-orange-600",
  },
  germany: {
    flag: "🇩🇪",
    highlight: "Free / low-cost tuition options",
    color: "from-neutral-700 to-neutral-900",
  },
  singapore: {
    flag: "🇸🇬",
    highlight: "Asia's top education hub",
    color: "from-red-500 to-rose-700",
  },
  "new zealand": {
    flag: "🇳🇿",
    highlight: "Safe & high quality of life",
    color: "from-emerald-600 to-teal-700",
  },
  ireland: {
    flag: "🇮🇪",
    highlight: "Tech hub with post-study work visa",
    color: "from-green-600 to-green-800",
  },
  france: {
    flag: "🇫🇷",
    highlight: "Art, culture & top business schools",
    color: "from-blue-500 to-violet-700",
  },
  netherlands: {
    flag: "🇳🇱",
    highlight: "Innovation & English-taught programs",
    color: "from-orange-500 to-orange-700",
  },
};

export function getDestinationMeta(countryName: string) {
  const lower = countryName.toLowerCase();
  return (
    DESTINATION_META[lower] ?? {
      flag: "🌍",
      highlight: "Quality education abroad",
      color: "from-neutral-600 to-neutral-800",
    }
  );
}
