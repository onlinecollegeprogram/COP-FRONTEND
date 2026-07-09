"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

const getIconForSlug = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes('pg') || s.includes('post')) {
    return (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-4-3.5l4 2 4-2" /></svg>
    );
  }
  if (s.includes('ug') || s.includes('under')) {
    return (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
    );
  }
  if (s.includes('diploma')) {
    return (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
    );
  }
  if (s.includes('certificate')) {
    return (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-.723 3.066 3.745 3.745 0 01-3.066.723 3.745 3.745 0 01-3.068 1.593 3.745 3.745 0 01-3.068-1.594 3.745 3.745 0 01-3.066-.722 3.745 3.745 0 01-.723-3.067A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 01.723-3.066 3.745 3.745 0 013.066-.723A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.066.723 3.745 3.745 0 01.723 3.066A3.745 3.745 0 0121 12z" /></svg>
    );
  }
  if (s.includes('executive')) {
    return (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
    );
  }
  if (s.includes('doctorate') || s.includes('phd')) {
    return (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
  );
};

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [promoText, setPromoText] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeTypes, setDegreeTypes] = useState<{ label: string; href: string; icon: React.ReactNode }[]>([]);
  const [trendingCourses, setTrendingCourses] = useState<{ title: string; slug: string; id: string }[]>([]);
  const [providers, setProviders] = useState<{ name: string; slug: string }[]>([]);
  const [courses, setCourses] = useState<{ name: string; slug: string; id: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const searchDataFetched = useRef(false);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    const matches = new Set<string>();

    providers.forEach((p) => {
      if (p.name.toLowerCase().includes(lowerQuery)) matches.add(p.name);
    });
    courses.forEach((c) => {
      if (c.name.toLowerCase().includes(lowerQuery)) matches.add(c.name);
    });
    trendingCourses.forEach((c) => {
      if (c.title.toLowerCase().includes(lowerQuery)) matches.add(c.title);
    });

    return Array.from(matches).slice(0, 6);
  }, [searchQuery, trendingCourses, providers, courses]);

  const handleSearch = (qOverride?: string) => {
    const q = (qOverride ?? searchQuery).trim();
    if (!q) {
      router.push("/search");
      return;
    }
    const lower = q.toLowerCase();

    // Provider — exact, then partial
    const provider =
      providers.find((p) => p.name.toLowerCase() === lower) ||
      providers.find((p) => p.name.toLowerCase().includes(lower));
    if (provider?.slug) {
      router.push(`/universities/${provider.slug}`);
      setShowSuggestions(false);
      return;
    }

    // Course — exact, then partial. Course-detail accepts id OR slug.
    const course =
      courses.find((c) => c.name.toLowerCase() === lower) ||
      courses.find((c) => c.name.toLowerCase().includes(lower));
    if (course && (course.id || course.slug)) {
      router.push(`/course-detail?id=${course.id || course.slug}`);
      setShowSuggestions(false);
      return;
    }

    // Trending provider-course (course-detail resolves these too)
    const trending =
      trendingCourses.find((t) => t.title.toLowerCase() === lower) ||
      trendingCourses.find((t) => t.title.toLowerCase().includes(lower));
    if (trending && (trending.id || trending.slug)) {
      router.push(`/course-detail?id=${trending.id || trending.slug}`);
      setShowSuggestions(false);
      return;
    }

    // Fallback: hand off to the full search page
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else {
        setShowSuggestions(true);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggestions && selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('studentToken');
    setIsLoggedIn(!!token);
    setIsMenuOpen(false);

    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/student/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setUserData(data);
        })
        .catch(() => { });
    } else {
      setUserData(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [marqueeVars, setMarqueeVars] = useState<{ distance: string; duration: string }>({ distance: '0px', duration: '14s' });
  const [repeatCount, setRepeatCount] = useState(2);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // fetch promo from CMS page content
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const url = `${apiBase}/api/public/page-content/home-page`;
    let cancelled = false;
    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          console.warn(`[Navbar promo] ${url} returned ${r.status}`);
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (cancelled || !json) return;
        const items = Array.isArray(json?.content) ? json.content : [];
        const uniquePromos = new Set<string>();
        for (const it of items) {
          const vals = it.values || {};
          const keys = Object.keys(vals).filter((k) => k.toLowerCase().includes("promo"));
          for (const k of keys) {
            if (vals[k]) uniquePromos.add(String(vals[k]));
          }
        }
        if (uniquePromos.size > 0) {
          setPromoText(Array.from(uniquePromos).join(" \u00A0\u00A0 \u2022 \u00A0\u00A0 "));
        }
      })
      .catch((err) => {
        console.warn("[Navbar promo] fetch failed", err);
      });
    return () => { cancelled = true };
  }, []);

  // Degree types needed immediately for the Programs dropdown in the nav
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${apiBase}/api/public/degree-types`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDegreeTypes(data.map(dt => ({
            label: dt.name,
            href: `/explore-programs?type=${dt.slug.toUpperCase()}`,
            icon: getIconForSlug(dt.slug)
          })));
        }
      })
      .catch(() => { });
  }, []);

  // Search autocomplete data — deferred until the user actually opens search.
  // These 3 endpoints total ~150KiB and are useless on initial page load.
  const fetchSearchData = React.useCallback(() => {
    if (searchDataFetched.current) return;
    searchDataFetched.current = true;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    fetch(`${apiBase}/api/public/providers/programs/trending`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const trending = data
            .slice(0, 8)
            .map((p: any) => ({
              title: p.title || p.name || "",
              slug: p.slug || "",
              id: p.courseId?._id || p.courseId || p._id || "",
            }))
            .filter((c) => c.title);
          if (trending.length > 0) setTrendingCourses(trending);
        }
      })
      .catch(() => { });

    fetch(`${apiBase}/api/public/providers`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          const provs = data
            .map((p: any) => ({ name: p.name || "", slug: p.slug || "" }))
            .filter((p) => p.name && p.slug);
          setProviders(provs);
        }
      })
      .catch(() => { });

    fetch(`${apiBase}/api/public/courses`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data
            .map((c: any) => ({
              name: c.name || "",
              slug: c.slug || "",
              id: c._id || c.id || "",
            }))
            .filter((c) => c.name && (c.id || c.slug));
          setCourses(mapped);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!promoText) return;
    const contentEl = contentRef.current;
    if (!contentEl) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width) || 0;
      const gapPx = 24; // matches gap:1.5rem in .promo-track (~24px)
      const distancePx = Math.round(w + gapPx);
      const speed = 110;
      const duration = Math.max(8, Math.round(distancePx / speed)) + 's';
      const viewportW = window.innerWidth || 1200;
      setRepeatCount(Math.max(Math.ceil((viewportW * 2) / distancePx) + 1, 2));
      setMarqueeVars({ distance: `${distancePx}px`, duration });
    });
    ro.observe(contentEl);
    return () => ro.disconnect();
  }, [promoText]);

  const isHomepage = pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-50">
      <style>{`
        .promo-wrapper{overflow:hidden;width:100%;}
        .promo-track{display:flex;align-items:center;gap:6rem;width:max-content}
        .promo-content{display:flex;gap:2.5rem;align-items:center;padding:0;flex-shrink:0}
        .promo-item{flex-shrink:0;display:inline-block;padding:0 1rem; font-family: var(--font-nunito), sans-serif; font-size: clamp(11px, 0.9vw, 13px); line-height:1; color: #fff; white-space:nowrap}
        @keyframes promo-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-2 * var(--marquee-distance))); } }
        .promo-animate { animation: promo-marquee var(--marquee-duration, 14s) linear infinite; will-change: transform; contain: layout style; }
        .nav-glass {
          background: linear-gradient(90deg, rgba(130, 85, 200, 0.75) 0%, rgba(145, 105, 225, 0.75) 55%, rgba(115, 65, 200, 0.75) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 32px rgba(80, 30, 160, 0.3);
          border-radius: 1.5rem;
        }
        @media (max-width: 768px) {
          .nav-glass {
            background: #A983F6;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border: none;
            box-shadow: none;
            border-radius: 0;
          }
        }
        .expert-glow {
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 30px rgba(249, 115, 22, 0.5);
          transition: all 0.3s ease;
        }
        .expert-glow:hover {
          box-shadow: 0 0 25px rgba(249, 115, 22, 0.9), 0 0 50px rgba(249, 115, 22, 0.5);
          transform: translateY(-1px);
        }
      `}</style>

      {isHomepage && (
        <div className="bg-[#7C3AED] text-white text-sm py-2">
          <div className="w-full mx-auto overflow-hidden relative">
            {promoText ? (
              <div className="overflow-hidden">
                <div className="promo-wrapper">
                  <div ref={trackRef} className={`promo-track${marqueeVars.distance !== "0px" ? " promo-animate" : ""}`} style={{ ['--marquee-distance' as any]: marqueeVars.distance, ['--marquee-duration' as any]: marqueeVars.duration } as React.CSSProperties}>
                    {Array.from({ length: repeatCount }, (_, i) => (
                      <div key={i} ref={i === 0 ? contentRef : undefined} className="promo-content" aria-hidden={i !== 0}>
                        <div className="promo-item">{promoText}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="md:fixed md:px-7 md:py-2.5 w-full bg-[#A983F6] md:bg-transparent border-b md:border-none border-purple-400/30">
        <div className="nav-glass w-full mx-auto flex items-center justify-between px-4 h-16 md:h-[72px] text-white relative">
          <Link href="/" className="flex items-center gap-1 flex-shrink-0">
            <NextImage src="/logoLight.svg" alt="CollegeProgram" width={811} height={260} unoptimized className="h-16 md:h-16 w-auto object-contain mt-1 md:mt-0 pt-1" priority />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <div
              className="relative py-2"
              ref={dropdownRef}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-1 font-semibold text-[13px] leading-[19.5px] transition cursor-pointer px-3 py-2 rounded-lg font-['Nunito',_sans-serif] ${pathname.startsWith('/explore-programs') ? 'bg-white/25 text-white shadow-sm' : 'text-white hover:bg-white/10'
                  }`}
              >
                Explore Programs
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`absolute -left-11 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-gray-100 transition-all duration-200 origin-top transform ${dropdownOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none"
                  }`}
              >
                {/* Invisible bridge to prevent hover loss */}
                <div className="absolute -top-4 left-0 w-full h-4 bg-transparent" aria-hidden="true" />
                {degreeTypes.map((item) => {
                  const isActive = pathname === item.href || (item.href.includes('?') ? pathname === item.href.split('?')[0] && typeof window !== 'undefined' && window.location.search === '?' + item.href.split('?')[1] : pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 transition text-sm font-medium ${isActive
                        ? 'bg-purple-100 text-purple-800 border-l-4 border-purple-600'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700 border-l-4 border-transparent'
                        }`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <Link
              href="/online-courses"
              className={`font-semibold text-[13px] leading-[19.5px] transition px-3 py-2 rounded-lg font-['Nunito',_sans-serif] ${pathname.startsWith('/online-courses') ? 'bg-white/25 text-white shadow-sm' : 'text-white hover:bg-white/10'
                }`}
            >
              Online Courses
            </Link>

            <Link
              href="/universities"
              className={`font-semibold text-[13px] leading-[19.5px] transition px-3 py-2 rounded-lg font-['Nunito',_sans-serif] ${pathname.startsWith('/universities') ? 'bg-white/25 text-white shadow-sm' : 'text-white hover:bg-white/10'
                }`}
            >
              Top Universities
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-0 relative" ref={suggestionRef}>
              <div className="w-px h-6 bg-white/30 mx-2" />
              <div className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 hover:bg-white/20 transition px-3 py-1.5 focus-within:bg-white/20">
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="flex-shrink-0 cursor-pointer focus:outline-none"
                  aria-label="Search"
                >
                  <SearchIcon className="w-4 h-4 text-white/80" />
                </button>
                <input
                  type="text"
                  placeholder="Search programs..."
                  aria-label="Search programs"
                  className="bg-transparent outline-none text-sm placeholder-white/70 text-white w-36"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => { fetchSearchData(); setShowSuggestions(true); }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="w-px h-6 bg-white/30 mx-2" />

              {/* Suggestion Box Desktop */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition text-sm ${index === selectedIndex ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <SearchIcon className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/compareUniversities"
              className={`hidden sm:flex items-center gap-2 rounded-lg border transition px-3 py-1.5 text-[13px] leading-[19.5px] font-semibold font-['Nunito',_sans-serif] ${pathname.startsWith('/compareUniversities')
                ? 'bg-white/30 border-white text-white shadow-sm'
                : 'bg-white/10 border-white/40 hover:bg-white/20 text-white'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare
            </Link>

            <Link
              href="/talk-to-experts"
              className={`hidden sm:flex items-center gap-2 transition px-4 py-2 rounded-lg text-[13px] leading-[19.5px] font-bold shadow expert-glow font-['Nunito',_sans-serif] ${pathname.startsWith('/talk-to-experts')
                ? 'bg-orange-600 text-white ring-2 ring-white/50'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Talk to Expert
            </Link>

            {isClient && isLoggedIn ? (
              <Link
                href="/profile"
                className={`hidden sm:flex rounded-full w-10 h-10 border-2 overflow-hidden cursor-pointer transition-all duration-300 items-center justify-center p-0.5 ${pathname.startsWith('/profile')
                  ? 'bg-white/40 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105'
                  : 'bg-white/10 border-white/30 hover:border-white/60 hover:bg-white/20 hover:scale-105'
                  }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden">
                  {userData?.profilePhoto ? (
                    <img src={userData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/10">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className={`hidden sm:block rounded-lg border px-4 py-2 text-sm font-medium transition ${pathname.startsWith('/login')
                  ? 'bg-white/30 border-white text-white shadow-sm'
                  : 'border-white/50 hover:bg-white/10 text-white'
                  }`}
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button - Now on Right */}
            <button
              className="md:hidden flex items-center justify-center p-2 text-white hover:bg-white/10 rounded-lg transition"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[110] transition-all duration-500 md:hidden ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-[#FDFCFE] shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transition-transform duration-500 ease-in-out transform ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          data-lenis-prevent
        >
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between border-b border-purple-100 bg-[#A983F6] backdrop-blur-sm sticky top-0 z-10">
            <div className="flex flex-col">
              <NextImage src="/logoLight.svg" alt="CollegeProgram" width={811} height={260} unoptimized className="h-14 w-auto" />
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="w-10 h-10 flex items-center justify-center text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-8" data-lenis-prevent>
            {/* Search */}
            <div className="mb-10 relative">
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="absolute inset-y-0 left-4 flex items-center cursor-pointer focus:outline-none z-10"
                  aria-label="Search"
                >
                  <SearchIcon className="w-5 h-5 text-purple-400 group-focus-within:text-purple-600 transition-colors" />
                </button>
                <input
                  type="text"
                  placeholder="Search programs..."
                  aria-label="Search programs"
                  className="w-full bg-white border border-purple-100 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-700 placeholder-purple-300 outline-none transition-all shadow-sm shadow-purple-50"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => { fetchSearchData(); setShowSuggestions(true); }}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Suggestion Box Mobile */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-purple-50 overflow-hidden z-[60]">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition text-sm ${index === selectedIndex ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                        } border-b border-purple-50 last:border-none`}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <SearchIcon className="w-4 h-4 text-purple-300" />
                      <span className="truncate font-medium">{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <nav className="space-y-10">
              <div>
                <h3 className="text-[11px] font-black text-purple-400 uppercase tracking-[2.5px] mb-6 px-1">Explore Programs</h3>
                <div className="space-y-3">
                  {degreeTypes.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center group p-3.5 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all active:scale-[0.98] border border-transparent hover:border-purple-50"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-purple-50 group-hover:bg-purple-600 rounded-xl transition-all duration-300">
                        <span className="[&>svg]:w-6 [&>svg]:h-6 [&>svg]:transition-colors group-hover:[&>svg]:text-white">
                          {item.icon}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-[14px] font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{item.label}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-purple-400 uppercase tracking-[2.5px] mb-6 px-1">Quick Links</h3>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Top Universities', href: '/universities', icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      )
                    },
                    {
                      label: 'Online Courses', href: '/online-courses', icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      )
                    },
                    {
                      label: 'Compare Universities', href: '/compareUniversities', icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      )
                    }
                  ].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="flex items-center group p-3.5 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all active:scale-[0.98] border border-transparent hover:border-purple-50"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 group-hover:bg-purple-600 group-hover:text-white rounded-xl transition-all duration-300">
                        {link.icon}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-[14px] font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{link.label}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* Footer CTAs */}
          <div className="px-6 py-5 border-t border-purple-100 bg-white/50 space-y-3">
            <Link
              href="/talk-to-experts"
              className="flex items-center justify-center gap-3 w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-[1px] shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] expert-glow active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Talk to Expert
            </Link>

            {isClient && isLoggedIn ? (
              <Link
                href="/profile"
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-white text-[#7C3AED] rounded-2xl font-bold text-sm hover:bg-purple-50 transition-all active:scale-95 shadow-md border border-purple-100"
              >
                {userData?.profilePhoto ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-200 shadow-sm flex-shrink-0">
                    <img src={userData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                Account Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center w-full py-3 bg-white text-[#A983F6] rounded-2xl font-extrabold text-sm hover:bg-purple-50 transition-all active:scale-95 shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
