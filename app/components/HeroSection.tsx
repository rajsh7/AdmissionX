"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const heroWords = ["Dream", "College", "Future", "Career", "Journey"];

const heroImages = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2686&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=2574&auto=format&fit=crop",
];

// ── The 8 supported countries (in required display order) ─────────────────
const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Philippines",
  "Japan",
  "Singapore",
  "India",
];

// ── Country → State → Cities cascading data ───────────────────────────────
const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  "United States": {
    California: [
      "Los Angeles",
      "San Francisco",
      "San Diego",
      "Sacramento",
      "San Jose",
      "Fresno",
      "Oakland",
      "Long Beach",
    ],
    "New York": [
      "New York City",
      "Buffalo",
      "Albany",
      "Rochester",
      "Yonkers",
      "Syracuse",
      "Ithaca",
    ],
    Texas: [
      "Houston",
      "Dallas",
      "Austin",
      "San Antonio",
      "Fort Worth",
      "El Paso",
      "Plano",
      "Arlington",
    ],
    Florida: [
      "Miami",
      "Orlando",
      "Tampa",
      "Jacksonville",
      "Tallahassee",
      "St. Petersburg",
      "Gainesville",
      "Fort Lauderdale",
    ],
    Massachusetts: [
      "Boston",
      "Worcester",
      "Springfield",
      "Cambridge",
      "Lowell",
      "Amherst",
      "Newton",
    ],
    Illinois: [
      "Chicago",
      "Aurora",
      "Naperville",
      "Rockford",
      "Joliet",
      "Evanston",
      "Peoria",
    ],
    Pennsylvania: [
      "Philadelphia",
      "Pittsburgh",
      "Allentown",
      "Erie",
      "Reading",
      "Scranton",
      "State College",
    ],
    Washington: [
      "Seattle",
      "Spokane",
      "Tacoma",
      "Vancouver",
      "Bellevue",
      "Redmond",
      "Olympia",
    ],
  },

  "United Kingdom": {
    England: [
      "London",
      "Manchester",
      "Birmingham",
      "Liverpool",
      "Leeds",
      "Bristol",
      "Oxford",
      "Cambridge",
      "Sheffield",
      "Nottingham",
    ],
    Scotland: [
      "Edinburgh",
      "Glasgow",
      "Aberdeen",
      "Dundee",
      "Inverness",
      "Stirling",
    ],
    Wales: ["Cardiff", "Swansea", "Newport", "Wrexham", "Bangor"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Armagh", "Newry"],
  },

  Australia: {
    "New South Wales": [
      "Sydney",
      "Newcastle",
      "Wollongong",
      "Albury",
      "Wagga Wagga",
      "Maitland",
      "Coffs Harbour",
    ],
    Victoria: [
      "Melbourne",
      "Geelong",
      "Ballarat",
      "Bendigo",
      "Shepparton",
      "Warrnambool",
      "Wodonga",
    ],
    Queensland: [
      "Brisbane",
      "Gold Coast",
      "Townsville",
      "Cairns",
      "Toowoomba",
      "Rockhampton",
      "Mackay",
    ],
    "Western Australia": [
      "Perth",
      "Fremantle",
      "Bunbury",
      "Geraldton",
      "Kalgoorlie",
      "Albany",
    ],
    "South Australia": [
      "Adelaide",
      "Mount Gambier",
      "Whyalla",
      "Mount Barker",
      "Murray Bridge",
    ],
    "Australian Capital Territory": ["Canberra", "Belconnen", "Tuggeranong"],
    Tasmania: ["Hobart", "Launceston", "Devonport", "Burnie"],
  },

  Canada: {
    Ontario: [
      "Toronto",
      "Ottawa",
      "Hamilton",
      "Mississauga",
      "London",
      "Brampton",
      "Waterloo",
      "Kingston",
      "Windsor",
    ],
    Quebec: [
      "Montreal",
      "Quebec City",
      "Laval",
      "Longueuil",
      "Gatineau",
      "Sherbrooke",
      "Trois-Rivières",
    ],
    "British Columbia": [
      "Vancouver",
      "Victoria",
      "Kelowna",
      "Surrey",
      "Abbotsford",
      "Burnaby",
      "Richmond",
      "Kamloops",
    ],
    Alberta: [
      "Calgary",
      "Edmonton",
      "Red Deer",
      "Lethbridge",
      "Medicine Hat",
      "Grande Prairie",
      "Banff",
    ],
    Manitoba: [
      "Winnipeg",
      "Brandon",
      "Steinbach",
      "Thompson",
      "Portage la Prairie",
    ],
    Saskatchewan: [
      "Saskatoon",
      "Regina",
      "Prince Albert",
      "Moose Jaw",
      "Swift Current",
    ],
    "Nova Scotia": ["Halifax", "Sydney", "Truro", "New Glasgow"],
    "New Brunswick": ["Fredericton", "Moncton", "Saint John", "Bathurst"],
  },

  Philippines: {
    "Metro Manila": [
      "Manila",
      "Quezon City",
      "Makati",
      "Pasig",
      "Taguig",
      "Mandaluyong",
      "Marikina",
      "Caloocan",
    ],
    Cebu: ["Cebu City", "Mandaue", "Lapu-Lapu", "Talisay", "Danao", "Toledo"],
    Davao: ["Davao City", "Tagum", "Digos", "Panabo", "Samal", "Mati"],
    Laguna: [
      "Santa Rosa",
      "Biñan",
      "San Pablo",
      "Calamba",
      "Los Baños",
      "Sta. Cruz",
    ],
    Bulacan: [
      "Malolos",
      "Meycauayan",
      "San Jose del Monte",
      "Marilao",
      "Obando",
    ],
    Batangas: ["Batangas City", "Lipa", "Tanauan", "Santo Tomas"],
    Pampanga: ["San Fernando", "Angeles City", "Mabalacat", "Guagua"],
  },

  Japan: {
    Tokyo: [
      "Shinjuku",
      "Shibuya",
      "Akihabara",
      "Harajuku",
      "Asakusa",
      "Ginza",
      "Ikebukuro",
      "Roppongi",
    ],
    Osaka: ["Osaka City", "Kyoto", "Kobe", "Nara", "Sakai", "Higashiosaka"],
    Aichi: [
      "Nagoya",
      "Toyota",
      "Okazaki",
      "Ichinomiya",
      "Toyohashi",
      "Kasugai",
    ],
    Fukuoka: [
      "Fukuoka City",
      "Kitakyushu",
      "Kurume",
      "Omuta",
      "Iizuka",
      "Kasuga",
    ],
    Hokkaido: [
      "Sapporo",
      "Hakodate",
      "Asahikawa",
      "Obihiro",
      "Kushiro",
      "Otaru",
    ],
    Kanagawa: ["Yokohama", "Kawasaki", "Sagamihara", "Fujisawa", "Yokosuka"],
    Kyoto: ["Kyoto City", "Uji", "Maizuru", "Fukuchiyama"],
  },

  Singapore: {
    "Central Region": [
      "Marina Bay",
      "Orchard",
      "Bugis",
      "Chinatown",
      "Little India",
      "Clarke Quay",
    ],
    "East Region": ["Tampines", "Bedok", "Pasir Ris", "Changi", "Simei"],
    "North Region": ["Woodlands", "Yishun", "Sembawang", "Admiralty"],
    "North-East Region": [
      "Sengkang",
      "Punggol",
      "Hougang",
      "Serangoon",
      "Ang Mo Kio",
    ],
    "West Region": [
      "Jurong East",
      "Jurong West",
      "Clementi",
      "Buona Vista",
      "Boon Lay",
    ],
  },

  India: {
    Maharashtra: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Aurangabad",
      "Solapur",
      "Kolhapur",
      "Thane",
    ],
    Delhi: [
      "New Delhi",
      "Noida",
      "Gurgaon",
      "Faridabad",
      "Dwarka",
      "Rohini",
      "Janakpuri",
    ],
    Karnataka: [
      "Bangalore",
      "Mysore",
      "Mangalore",
      "Hubli",
      "Belgaum",
      "Dharwad",
      "Shimoga",
    ],
    "Tamil Nadu": [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Trichy",
      "Salem",
      "Tirunelveli",
      "Vellore",
      "Erode",
    ],
    "Uttar Pradesh": [
      "Lucknow",
      "Kanpur",
      "Agra",
      "Varanasi",
      "Allahabad",
      "Meerut",
      "Ghaziabad",
      "Noida",
    ],
    "West Bengal": [
      "Kolkata",
      "Howrah",
      "Siliguri",
      "Durgapur",
      "Asansol",
      "Bardhaman",
      "Kharagpur",
    ],
    Rajasthan: [
      "Jaipur",
      "Jodhpur",
      "Udaipur",
      "Kota",
      "Bikaner",
      "Ajmer",
      "Alwar",
    ],
    Telangana: [
      "Hyderabad",
      "Warangal",
      "Karimnagar",
      "Nizamabad",
      "Khammam",
      "Nalgonda",
    ],
    Gujarat: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Gandhinagar",
      "Bhavnagar",
      "Junagadh",
    ],
    "Madhya Pradesh": [
      "Bhopal",
      "Indore",
      "Jabalpur",
      "Gwalior",
      "Ujjain",
      "Rewa",
      "Sagar",
    ],
    Punjab: [
      "Chandigarh",
      "Ludhiana",
      "Amritsar",
      "Jalandhar",
      "Patiala",
      "Bathinda",
      "Mohali",
    ],
    Bihar: [
      "Patna",
      "Gaya",
      "Muzaffarpur",
      "Bhagalpur",
      "Darbhanga",
      "Begusarai",
      "Arrah",
    ],
    Kerala: [
      "Thiruvananthapuram",
      "Kochi",
      "Kozhikode",
      "Thrissur",
      "Kollam",
      "Kannur",
      "Palakkad",
    ],
    "Andhra Pradesh": [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Kurnool",
      "Tirupati",
      "Rajahmundry",
    ],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
    Haryana: ["Gurgaon", "Faridabad", "Ambala", "Rohtak", "Hisar", "Panipat"],
  },
};

// ── Degree / Course fallbacks ──────────────────────────────────────────────
interface FilterOption {
  id: number;
  name: string;
}

interface FilterData {
  degrees: FilterOption[];
  courses: FilterOption[];
}

const FALLBACK_DEGREES: FilterOption[] = [
  { id: 1, name: "Bachelor" },
  { id: 2, name: "Master" },
  { id: 3, name: "PhD" },
  { id: 4, name: "Diploma" },
  { id: 5, name: "Certificate" },
];

const FALLBACK_COURSES: FilterOption[] = [
  { id: 1, name: "Computer Science" },
  { id: 2, name: "Business Administration" },
  { id: 3, name: "Medicine" },
  { id: 4, name: "Engineering" },
  { id: 5, name: "Law" },
  { id: 6, name: "Arts" },
  { id: 7, name: "Commerce" },
];

const FALLBACK_FILTERS: FilterData = {
  degrees: FALLBACK_DEGREES,
  courses: FALLBACK_COURSES,
};

export default function HeroSection() {
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [degree, setDegree] = useState("");
  const [course, setCourse] = useState("");
  const [filters, setFilters] = useState<FilterData>(FALLBACK_FILTERS);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { name: string; location: string; slug: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Cascading location options ────────────────────────────────────────────
  const availableStates = useMemo<string[]>(() => {
    if (!country) return [];
    return Object.keys(LOCATION_DATA[country] ?? {}).sort();
  }, [country]);

  const availableCities = useMemo<string[]>(() => {
    if (!country || !state) return [];
    return [...(LOCATION_DATA[country]?.[state] ?? [])].sort();
  }, [country, state]);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % heroWords.length);
    }, 3000);
    return () => clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    const imageInterval = setInterval(nextImage, 4000);
    return () => clearInterval(imageInterval);
  }, [nextImage]);

  // Load only degrees + courses from API; location data is static
  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setFilters({
            degrees: json.data.degrees?.length
              ? json.data.degrees
              : FALLBACK_DEGREES,
            courses: json.data.courses?.length
              ? json.data.courses
              : FALLBACK_COURSES,
          });
        }
      })
      .catch(() => setFilters(FALLBACK_FILTERS))
      .finally(() => setFiltersLoading(false));
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then((r) => r.json())
        .then((json) => setSuggestions(json.suggestions ?? []))
        .catch(() => setSuggestions([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (country) params.set("country", country);
    if (state) params.set("state", state);
    if (city) params.set("city", city);
    if (degree) params.set("degree", degree);
    if (course) params.set("course", course);
    router.push(`/colleges?${params.toString()}`);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const baseSelectClass =
    "w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-8 text-sm font-medium text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all";

  const disabledSelectClass =
    "w-full appearance-none rounded-xl border border-white/5 bg-white/[0.03] py-3 pl-10 pr-8 text-sm font-medium text-white/30 cursor-not-allowed transition-all";

  // ── Filter field definitions ───────────────────────────────────────────────
  const filterFields: {
    key: string;
    label: string;
    icon: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    options: { id: number; name: string }[];
    disabled: boolean;
  }[] = [
    {
      key: "country",
      label: "Country",
      icon: "public",
      placeholder: "Select Country",
      value: country,
      onChange: (v) => {
        setCountry(v);
        setState("");
        setCity("");
      },
      options: COUNTRIES.map((c, i) => ({ id: i + 1, name: c })),
      disabled: false,
    },
    {
      key: "state",
      label: "State / Province",
      icon: "map",
      placeholder: country ? "Select State" : "Select Country first",
      value: state,
      onChange: (v) => {
        setState(v);
        setCity("");
      },
      options: availableStates.map((s, i) => ({ id: i + 1, name: s })),
      disabled: !country,
    },
    {
      key: "city",
      label: "City",
      icon: "location_city",
      placeholder: state ? "Select City" : "Select State first",
      value: city,
      onChange: (v) => setCity(v),
      options: availableCities.map((c, i) => ({ id: i + 1, name: c })),
      disabled: !state,
    },
    {
      key: "degree",
      label: "Degree",
      icon: "school",
      placeholder: "Select Degree",
      value: degree,
      onChange: (v) => setDegree(v),
      options: filters.degrees,
      disabled: false,
    },
    {
      key: "course",
      label: "Course",
      icon: "menu_book",
      placeholder: "All Courses",
      value: course,
      onChange: (v) => setCourse(v),
      options: filters.courses,
      disabled: false,
    },
  ];

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">
      {/* ─── Background Image Slides ─── */}
      {heroImages.map((img, idx) => (
        <Image
          key={idx}
          src={img}
          alt=""
          fill
          priority={idx === 0}
          sizes="100vw"
          quality={85}
          className={`object-cover transition-opacity duration-[1500ms] ease-in-out select-none ${
            idx === currentImage ? "opacity-100" : "opacity-0"
          }`}
          style={{
            zIndex: 0,
            animation:
              idx === currentImage ? "heroZoom 6s ease-out forwards" : "none",
          }}
          draggable={false}
        />
      ))}

      {/* ─── Dark Overlay ─── */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.40) 40%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* ─── Red accent glow ─── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "radial-gradient(ellipse at 20% 80%, rgba(220,38,38,0.12) 0%, transparent 60%)",
        }}
      />

      {/* ─── Slide Indicator Dots ─── */}
      <div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2.5"
        style={{ zIndex: 30 }}
      >
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImage(idx)}
            className={`rounded-full transition-all duration-500 ${
              idx === currentImage
                ? "w-9 h-2.5 bg-red-500"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ─── Main Content ─── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-4 sm:px-6 pt-28 pb-20 lg:pt-32 lg:pb-28 mx-auto max-w-7xl w-full"
        style={{ zIndex: 10 }}
      >
        <div className="max-w-4xl">
          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[1.05]"
          >
            Find Your
            <br />
            <span className="relative inline-block min-w-[200px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="gradient-text inline-block"
                >
                  {heroWords[currentWord]}
                </motion.span>
              </AnimatePresence>
              <motion.span
                key={`line-${currentWord}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="absolute bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-full origin-left"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-slate-200 font-light max-w-2xl leading-relaxed"
          >
            Every great journey begins with a single step. Discover top
            universities, explore courses, and chart the path to your
            extraordinary future.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button
              onClick={() => router.push("/signup/student")}
              className="group relative h-14 px-8 rounded-2xl bg-red-600 text-white font-bold text-base overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-600/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Journey
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button
              onClick={() => {
                document
                  .getElementById("explore")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-14 px-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-all duration-300"
            >
              Explore Programs
            </button>
          </motion.div>
        </div>

        {/* ─── Search Card ─── */}
        <motion.div variants={itemVariants} className="mt-16 lg:mt-20">
          <div className="bg-black/30 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-6 shadow-2xl">
            {/* ─── Live Search Input ─── */}
            <div className="relative mb-4">
              <div
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/8 px-4 py-3 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <span className="material-symbols-outlined text-red-400 text-[22px] shrink-0">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowSuggestions(false);
                      handleSearch();
                    }
                  }}
                  placeholder="Search college, university or course name..."
                  className="flex-1 bg-transparent text-white placeholder-white/40 text-sm font-medium outline-none"
                />
                {searchLoading && (
                  <span className="material-symbols-outlined text-white/40 text-[20px] animate-spin shrink-0">
                    progress_activity
                  </span>
                )}
                {searchQuery && !searchLoading && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="text-white/40 hover:text-white/80 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      close
                    </span>
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/15 bg-neutral-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                  style={{ zIndex: 50 }}
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={() => {
                        setSearchQuery(s.name);
                        setShowSuggestions(false);
                        router.push(`/university/${s.slug}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                    >
                      <span className="material-symbols-outlined text-red-400 text-[18px] shrink-0">
                        school
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {s.name}
                        </p>
                        {s.location && (
                          <p className="text-xs text-white/40 truncate">
                            {s.location}
                          </p>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-white/20 text-[16px] ml-auto shrink-0">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter grid: 5 dropdowns + search button */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 items-end">
              {filterFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span
                      className={`absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] ${
                        field.disabled ? "text-white/20" : "text-white/40"
                      }`}
                    >
                      {field.icon}
                    </span>

                    {filtersLoading &&
                    (field.key === "degree" || field.key === "course") ? (
                      <div className="w-full h-[46px] rounded-xl bg-white/10 animate-pulse" />
                    ) : (
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={field.disabled}
                        className={
                          field.disabled ? disabledSelectClass : baseSelectClass
                        }
                      >
                        <option value="" className="bg-neutral-900">
                          {field.placeholder}
                        </option>
                        {field.options.map((opt) => (
                          <option
                            key={opt.id}
                            value={opt.name}
                            className="bg-neutral-900"
                          >
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[20px] ${
                        field.disabled ? "text-white/15" : "text-white/40"
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </div>
              ))}

              {/* Search Button */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-transparent select-none">
                  &nbsp;
                </label>
                <button
                  onClick={handleSearch}
                  className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 transition-all duration-200 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    search
                  </span>
                  Search Colleges
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-4xl"
        >
          {[
            { value: 500, suffix: "+", label: "Universities" },
            { value: 10000, suffix: "+", label: "Students Placed" },
            { value: 50, suffix: "+", label: "Countries" },
            { value: 98, suffix: "%", label: "Satisfaction Rate" },
          ].map((stat) => (
            <div key={stat.label} className="text-left">
              <div className="text-3xl sm:text-4xl font-black text-white">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  duration={2.5}
                />
              </div>
              <div className="mt-1 text-sm text-white/50 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 20 }}
      >
        <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="material-symbols-outlined text-white/40 text-2xl">
            expand_more
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
