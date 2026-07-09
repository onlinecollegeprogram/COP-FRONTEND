"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { IconMapPin, IconMail, IconPhone } from '@tabler/icons-react';
import ObfuscatedEmail from "@/app/components/ObfuscatedEmail";

// ---------- Types ----------
interface FooterItem {
  label: string;
  href: string;
}

interface DegreeSection {
  title: string;
  items: FooterItem[];
}

interface ProviderCourseSummary {
  degreeType: { name: string; slug: string; order: number };
  courses: {
    _id: string;
    courseId?: string;
    name: string;
    slug: string;
    providerName?: string;
  }[];
}

interface ProviderListItem {
  _id: string;
  name: string;
  slug: string;
}

// ---------- Fallback mock data ----------
const FALLBACK_DEGREE_SECTIONS: DegreeSection[] = [
  {
    title: "Popular PG Programs",
    items: [
      { label: "Online MBA", href: "/course-detail?id=online-mba" },
      { label: "Online MCA", href: "/course-detail?id=online-mca" },
      { label: "Dual MBA", href: "/course-detail?id=dual-mba" },
      { label: "Online BBA + MBA", href: "/course-detail?id=online-bba-mba" },
    ],
  },
  {
    title: "Trending UG Programs",
    items: [
      { label: "Online BBA", href: "/course-detail?id=online-bba" },
      { label: "Online BCA", href: "/course-detail?id=online-bca" },
      { label: "Online BA", href: "/course-detail?id=online-ba" },
      { label: "Distance BJourn", href: "/course-detail?id=distance-bjourn" },
    ],
  },
  {
    title: "Doctorate Programs",
    items: [
      { label: "Online DBA", href: "/course-detail?id=online-dba" },
      { label: "Global DBA", href: "/course-detail?id=global-dba" },
      { label: "DNP", href: "/course-detail?id=dnp" },
      { label: "EdD", href: "/course-detail?id=edd" },
    ],
  },
  {
    title: "Executive Programs",
    items: [
      { label: "Executive MBA", href: "/course-detail?id=executive-mba" },
      { label: "Executive DBA", href: "/course-detail?id=executive-dba" },
      { label: "Executive PGDM", href: "/course-detail?id=executive-pgdm" },
      { label: "Executive PGCM", href: "/course-detail?id=executive-pgcm" },
    ],
  },
  {
    title: "In Demand MBA Specializations",
    items: [
      { label: "HR Management", href: "/course-detail?id=hr-management" },
      { label: "Marketing Management", href: "/course-detail?id=marketing-management" },
      { label: "Finance Management", href: "/course-detail?id=finance-management" },
      { label: "Fintech Management", href: "/course-detail?id=fintech-management" },
    ],
  },
  {
    title: "In Demand MCA Specializations",
    items: [
      { label: "Artificial Intelligence", href: "/course-detail?id=artificial-intelligence" },
      { label: "Cyber Security", href: "/course-detail?id=cyber-security" },
      { label: "Cloud Computing", href: "/course-detail?id=cloud-computing" },
      { label: "Data Science and Analytics", href: "/course-detail?id=data-science-analytics" },
    ],
  },
  {
    title: "Top Certification Programs",
    items: [
      { label: "PGCM", href: "/course-detail?id=pgcm" },
      { label: "Certificate In UX & UX", href: "/course-detail?id=certificate-ux" },
      { label: "Certificate In Data Science", href: "/course-detail?id=certificate-data-science" },
      { label: "Certificate in Project Management", href: "/course-detail?id=certificate-project-management" },
    ],
  },
];

const FALLBACK_UNIVERSITIES: FooterItem[] = [
  { label: "Amity Online University", href: "/universities/amity-online-university" },
  { label: "Manipal Online", href: "/universities/manipal-online" },
  { label: "Jain University Online", href: "/universities/jain-university-online" },
  { label: "Sharda Online University", href: "/universities/sharda-online-university" },
];

const ITEMS_LIMIT = 4;

// ---------- Section title mapping for degree type slugs ----------
const DEGREE_TITLE_MAP: Record<string, string> = {
  "post-graduate": "Popular PG Programs",
  "under-graduate": "Trending UG Programs",
  "doctorate": "Doctorate Programs",
  "executive": "Executive Programs",
  "mba-specializations": "In Demand MBA Specializations",
  "mca-specializations": "In Demand MCA Specializations",
  "certification": "Top Certification Programs",
};

function getDegreeTitle(degreeType: { name: string; slug: string }): string {
  return DEGREE_TITLE_MAP[degreeType.slug] || `${degreeType.name} Programs`;
}

export default function Footer() {
  const [degreeSections, setDegreeSections] = useState<DegreeSection[]>(FALLBACK_DEGREE_SECTIONS);
  const [universities, setUniversities] = useState<FooterItem[]>(FALLBACK_UNIVERSITIES);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const fetchCourses = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/public/provider-courses/home-summary`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: ProviderCourseSummary[] = await res.json();
        if (data && data.length > 0) {
          const sections: DegreeSection[] = data.map((group) => ({
            title: getDegreeTitle(group.degreeType),
            items: group.courses.slice(0, ITEMS_LIMIT).map((course) => ({
              label: course.name,
              href: `/course-detail?id=${course.slug || course.courseId || course._id}`,
            })),
          }));
          const merged = sections.slice(0, 7);
          if (merged.length < 7) {
            const existingTitles = new Set(merged.map((s) => s.title));
            for (const fallback of FALLBACK_DEGREE_SECTIONS) {
              if (merged.length >= 7) break;
              if (!existingTitles.has(fallback.title)) merged.push(fallback);
            }
          }
          setDegreeSections(merged);
        }
      } catch (err) {
        console.warn("Footer: Using fallback course data", err);
      }
    };

    const fetchProviders = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/public/providers`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data: ProviderListItem[] = await res.json();
        if (data && data.length > 0) {
          setUniversities(data.slice(0, ITEMS_LIMIT).map((p) => ({
            label: p.name,
            href: `/universities/${p.slug}`,
          })));
        }
      } catch (err) {
        console.warn("Footer: Using fallback university data", err);
      }
    };

    // Defer footer API calls until the footer enters the viewport
    const el = footerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchCourses();
          fetchProviders();
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const usefulLinks = [
    { label: "Explore Programs", href: "/explore-programs" },
    { label: "Online Courses", href: "/online-courses" },
    { label: "Top Universities", href: "/universities" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/our-policy" },
  ];

  const toolLinks = [
    { label: "Compare Universities", href: "/compareUniversities" },
    { label: "Blogs", href: "/articles" },
    { label: "FAQs", href: "/search" },
    { label: "Talk to Experts", href: "/talk-to-experts" },
  ];

  const ChevronIcon = () => (
    <svg className="w-2.5 h-2.5 text-[#6366F1] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );

  // Split the 7 degree sections into two rows of 4 (row1) and 3 (row2)
  // Row 2 also includes "Trending Online Universities" as the first column
  const row1Sections = degreeSections.slice(0, 4);
  const row2Sections = degreeSections.slice(4, 7);

  return (
    <footer ref={footerRef} className="relative w-full text-white bg-[#0D1B2E] overflow-hidden">


      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pt-8 md:pt-16 pb-10">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
          <div className="flex flex-col">
            <div className="mb-6">
              <NextImage src="/logoLight.svg" alt="CollegeProgram logo" width={811} height={260} unoptimized loading="lazy" className="h-16 w-auto block -ml-3" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Discover a world of knowledge and opportunities
              with our online education platform pursue a new
              career.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <IconMapPin stroke={2} color="#7C3AED" size={34} />
                <span className="text-gray-400 text-sm">Hanuman Path, 94, New Sanganer Rd, opp. Metro pillar no,<br />Shyam Nagar, Jaipur, Rajasthan 302019</span>
              </div>
              <div className="flex items-center gap-3">
                <IconPhone stroke={2} color="#7C3AED" />
                <span className="text-gray-400 text-sm">+91 9024357040</span>
              </div>
              <div className="flex items-center gap-3">
                <IconMail stroke={2} color="#7C3AED" />
                <ObfuscatedEmail
                  user="onlinecollegeprogram"
                  domain="gmail.com"
                  className="text-gray-400 text-sm"
                  asLink
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-8">Useful Links</h3>
            <ul className="space-y-4">
              {usefulLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="flex items-center gap-3 text-gray-400 hover:text-white transition text-sm">
                    <ChevronIcon />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-8 leading-tight">Resources</h3>
            <ul className="space-y-4">
              {toolLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="flex items-center gap-3 text-gray-400 hover:text-white transition text-sm">
                    <ChevronIcon />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-8">Social Media Links</h3>
            <div className="flex items-center gap-4">
              {[
                { src: "/linkedin.webp", alt: "LinkedIn", href: "https://www.linkedin.com/" },
                { src: "/facebook.webp", alt: "Facebook", href: "https://www.facebook.com/" },
                { src: "/instagram.webp", alt: "Instagram", href: "https://www.instagram.com/" },
                { src: "/gmail.webp", alt: "Email", href: "/talk-to-experts" }
              ].map((icon, i) => (
                <a
                  key={i}
                  href={icon.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${icon.alt}`}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <NextImage src={icon.src} alt={`${icon.alt} icon`} width={32} height={32} loading="lazy" className="w-8 h-8" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 opacity-5 pointer-events-none bg-cover bg-center bg-[url('/footerBg.webp')]"
        />
        <div className="border-t border-gray-800 mb-8" />

        {/* Middle Program Sections — Row 1: first 4 degree type sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {row1Sections.map((section, i) => (
            <FooterList key={`row1-${i}`} title={section.title} items={section.items} />
          ))}
        </div>

        {/* Lower Sections — Row 2: Trending Universities + remaining degree type sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-4">
          <FooterList title="Trending Online Universities" items={universities} />
          {row2Sections.map((section, i) => (
            <FooterList key={`row2-${i}`} title={section.title} items={section.items} />
          ))}
        </div>

      </div>

      {/* Bottom Disclaimer & Copyright Section */}
      <div className="relative z-10 w-full border-t border-gray-800/50 pt-4 pb-32 md:pb-10">
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto px-6">
          <p className="text-gray-300 text-xs font-bold mb-6">
            <Link href="/disclaimer" className="underline underline-offset-2 hover:text-white transition-colors">
              Disclaimer
            </Link>
            {" / "}
            <Link href="/terms-and-conditions" className="underline underline-offset-2 hover:text-white transition-colors">
              Terms and Conditions
            </Link>
            {" / "}
            <Link href="/our-policy" className="underline underline-offset-2 hover:text-white transition-colors">
              Our Policy
            </Link>
          </p>
          <p className="text-gray-300 text-[11px] leading-relaxed mb-10 px-4 md:px-10 text-justify md:text-center">
            CollegeProgram aims to provide unbiased and precise information to aspirants, along with comparative guidance on universities and their programs. The content on the website, including rankings, is for general informational and educational purposes only and should not be considered a substitute for official information provided by academic partners. While we make every effort to keep the information accurate and up to date, CollegeProgram does not guarantee the completeness or reliability of the content and is not responsible for any errors, omissions, or results stemming from its use.
          </p>

          <div className="flex flex-col items-center gap-1 text-[11px] text-gray-300">
            <p>© 2026 CollegeProgram.2026. All Rights Reserved</p>
            <p className="flex items-center gap-2">
              Design & Developed by
              <Link href="https://www.supercx.co/" target="_blank" rel="noopener noreferrer">
                <NextImage src="/supercxLogo.webp" alt="SuperCX" width={80} height={24} loading="lazy" className="h-6 w-auto hover:opacity-80 transition-opacity" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <Link href={item.href} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-[13px]">
              <svg className="w-2.5 h-2.5 text-[#6366F1] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
