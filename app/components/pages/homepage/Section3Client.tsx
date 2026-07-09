"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AutoSlider from "./AutoSlider";
import { BookOpen, Award, FileText, Briefcase, FlaskConical, GraduationCap, Monitor, Globe } from "lucide-react";
import CourseCard from "./CourseCard";

interface CourseItem {
  _id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  icon?: string; // From Course model
  shortDescription: string;
  description?: string; // From Course model
  duration: string;
  minFees: number;
  feeStarting?: number; // From Course model
  providerCount: number;
  universities?: any[]; // From Course model
  isTrending: boolean;
}

interface CourseGroup {
  degreeType: { name: string; slug: string; order: number };
  courses: CourseItem[];
}

interface Props {
  courseGroups: CourseGroup[];
}

// Map degree type slugs to an icon component
function DegreeIcon({ slug, cls = 'w-5 h-5 text-purple-600' }: { slug: string; cls?: string }) {
  if (slug.includes("pg") || slug.includes("post")) return <GraduationCap className={cls} />;
  if (slug.includes("ug") || slug.includes("under")) return <BookOpen className={cls} />;
  if (slug.includes("diploma")) return <Award className={cls} />;
  if (slug.includes("cert")) return <FileText className={cls} />;
  if (slug.includes("exec")) return <Briefcase className={cls} />;
  if (slug.includes("doc") || slug.includes("phd")) return <FlaskConical className={cls} />;
  return <GraduationCap className={cls} />;
}

function getCourseIcon(name: string, cls = "w-6 h-6") {
  if (name.includes("MBA")) return <Briefcase className={cls} />;
  if (name.includes("MCA")) return <Monitor className={cls} />;
  if (name.includes("BBA")) return <Globe className={cls} />;
  return <GraduationCap className={cls} />;
}

function formatFees(amount: number) {
  if (!amount) return "Contact for Fees";
  if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(0)} Lakh`;
  if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(0)}K`;
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

export default function Section3Client({ courseGroups }: Props) {
  const [activeTab, setActiveTab] = useState(courseGroups[0]?.degreeType?.slug ?? "");

  // Mobile infinite-loop slider state
  // offset: 0 = clone of last, 1..count = real items, count+1 = clone of first
  const [offset, setOffset] = useState(1);
  const [animated, setAnimated] = useState(true);

  const activeGroup = courseGroups.find((g) => g.degreeType.slug === activeTab);
  const visibleCourses = activeGroup?.courses?.slice(0, 3) ?? [];
  const effectiveCourses = visibleCourses.length > 0
    ? visibleCourses
    : [{} as CourseItem, {} as CourseItem, {} as CourseItem];
  const sliderCount = effectiveCourses.length;

  // real dot index (0-based)
  const realIndex = sliderCount > 0 ? ((offset - 1) % sliderCount + sliderCount) % sliderCount : 0;

  // extended array: [clone_last, ...real, clone_first]
  const extendedCourses = sliderCount > 0
    ? [effectiveCourses[sliderCount - 1], ...effectiveCourses, effectiveCourses[0]]
    : effectiveCourses;

  // container ref must be declared before useEffects that reference it
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset slider when tab changes
  useEffect(() => { setOffset(1); setAnimated(false); }, [activeTab]);

  // Measure container width — translatePx is derived synchronously (no async state chain)
  const [containerWidth, setContainerWidth] = useState(0);
  const step = 280 + 12;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof window !== "undefined") setContainerWidth(window.innerWidth);

    const obs = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setContainerWidth(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // translatePx derived synchronously — always in sync with offset in the same render
  const translatePx = containerWidth > 0
    ? Math.round(containerWidth / 2 - 140 - offset * step)
    : 0;

  // touch swipe support
  const touchStartXRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    isPausedRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const delta = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 30) {
      setAnimated(true);
      setOffset((prev) => prev + (delta > 0 ? 1 : -1));
    }
    touchStartXRef.current = null;
    isPausedRef.current = false;
  };

  // Re-enable animation one frame after a silent snap
  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animated]);

  // Auto-advance
  useEffect(() => {
    if (sliderCount === 0) return;
    const id = setInterval(() => {
      if (isPausedRef.current) return;
      setAnimated(true);
      setOffset((prev) => prev + 1);
    }, 3200);
    return () => clearInterval(id);
  }, [sliderCount]);

  // Seamless snap after landing on a clone
  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.target !== e.currentTarget) return;
    setOffset((prev) => {
      if (prev === 0) { setAnimated(false); return sliderCount; }
      if (prev === sliderCount + 1) { setAnimated(false); return 1; }
      return prev;
    });
  }

  return (
    <>
      <div className="mt-4 md:mt-10">
        <div className="relative lg:max-w-7xl mx-auto lg:px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full flex justify-center pb-0 md:pb-7  md:px-0">
            {/* Desktop Tabs: Limit 4 */}
            <div className="hidden md:flex items-center gap-2 bg-[#FFFFFF] border border-[#F3F4F6] rounded-full px-4 py-2 overflow-x-auto scrollbar-hide lg:max-w-[72%] shadow-sm">
              {courseGroups.slice(0, 4).map((group) => (
                <button
                  key={group.degreeType.slug}
                  onClick={() => setActiveTab(group.degreeType.slug)}
                  className={`px-6 py-3 text-sm font-medium rounded-full cursor-pointer whitespace-nowrap transition-all ${activeTab === group.degreeType.slug
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {group.degreeType.name}
                </button>
              ))}
              {courseGroups.length > 4 && (
                <Link
                  href="/online-courses"
                  className="px-4 py-2 text-sm font-bold text-purple-600 bg-purple-50 rounded-full border border-purple-100 whitespace-nowrap cursor-pointer hover:bg-purple-100 transition-colors"
                >
                  {courseGroups.length - 4}+
                </Link>
              )}
            </div>

            {/* Mobile Tabs: Scrollable */}
            <div className="flex md:hidden items-center gap-2 overflow-x-auto scrollbar-hide px-2 py-1">
              {courseGroups.map((group) => (
                <button
                  key={group.degreeType.slug}
                  onClick={() => setActiveTab(group.degreeType.slug)}
                  className={`px-5 py-2.5 text-xs font-bold rounded-full cursor-pointer whitespace-nowrap transition-all shadow-sm border ${activeTab === group.degreeType.slug
                    ? "bg-purple-600 text-white border-purple-600 shadow-purple-100"
                    : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                    }`}
                >
                  {group.degreeType.name}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute right-2 bottom-0 hidden md:block flex-shrink-0 mb-7">
            <Link href="/online-courses" className="text-purple-600 underline whitespace-nowrap font-medium text-xs md:text-[16px] opacity-100 hover:opacity-70">
              View all Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Course Cards — Mobile Icon Grid */}
      <div className="md:hidden mt-6 px-4">
        <div className="grid grid-cols-2 gap-3">
          {activeGroup?.courses?.slice(0, 6).map((course) => (
            <Link
              key={course._id}
              href={`/online-courses/${course.slug}`}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center gap-3 active:scale-95"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${course.name.includes('MBA') ? 'bg-blue-50 border-blue-100 text-blue-600' :
                course.name.includes('MCA') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                  course.name.includes('BBA') ? 'bg-orange-50 border-orange-100 text-orange-600' :
                    'bg-purple-50 border-purple-100 text-purple-600'
                }`}>
                {getCourseIcon(course.name)}
              </div>
              <h3 className="text-[13px] font-bold text-gray-900 leading-tight">
                {course.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Course Cards — Desktop grid */}
      <div className="mt-10 hidden md:grid md:grid-cols-3 gap-8">
        {visibleCourses.length > 0 ? (
          visibleCourses.map((course) => (
            <CourseCard key={course._id} course={course as any} />
          ))
        ) : (
          // Skeleton placeholders while loading or if no data
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="flex justify-between pt-2">
                  <div className="h-4 bg-gray-100 rounded w-28" />
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All CTA */}
      <div className="mt-8 md:mt-12 flex justify-center">
        <Link
          href="/online-courses"
          className="text-white font-semibold transition-all duration-200 inline-flex items-center justify-center hover:opacity-90 hover:scale-[1.02] min-w-[220px] max-w-[90vw] min-h-[52px] py-3 px-6 rounded-[14px] bg-gradient-to-br from-[#4F39F6] to-[#9810FA] shadow-[0_4px_4px_rgba(0, 0, 0, 0.25)] no-underline font-['Inter'] text-[clamp(14px,3.2vw,16px)] cursor-pointer whitespace-nowrap"
        >
          View All {activeGroup?.degreeType?.name ?? "Courses"}
        </Link>
      </div>
    </>
  );
}
