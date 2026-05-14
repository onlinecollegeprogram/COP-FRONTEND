"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SectionContent, Provider } from "@/app/lib/types";
import SectionRenderer from "@/app/components/SectionRenderer";
import SidebarFilters from "./SidebarFilters";
import UniversityCard from "./UniversityCard";
import UniversityCardSkeleton from "./UniversityCardSkeleton";

interface UniversityPageProps {
  sections: SectionContent[];
  providers: Provider[];
}

const PAGE_SIZE = 9;

export default function UniversityPage({ sections, providers }: UniversityPageProps) {
  const [selectedToCompare, setSelectedToCompare] = useState<string[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [isLoadingShortlist, setIsLoadingShortlist] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allowedProviderIds, setAllowedProviderIds] = useState<string[] | null>(null);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(providers);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Load selection and shortlist from localStorage/API on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedToCompare');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedToCompare(parsed);
        }
      } catch (e) {
        console.error("Failed to parse selectedToCompare", e);
      }
    }

    // Fetch shortlist if logged in
    const fetchShortlist = async () => {
      const token = localStorage.getItem('studentToken');
      if (!token) return;

      setIsLoadingShortlist(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/public/student/shortlist`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setShortlistedIds(data.map((item: any) => item.providerId));
        }
      } catch (error) {
        console.error("Failed to fetch shortlist", error);
      } finally {
        setIsLoadingShortlist(false);
      }
    };

    fetchShortlist();
  }, []);

  // Save selection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedToCompare', JSON.stringify(selectedToCompare));
  }, [selectedToCompare]);

  const handleToggleCompare = (id: string) => {
    if (selectedToCompare.includes(id)) {
      setSelectedToCompare(selectedToCompare.filter((c) => c !== id));
    } else {
      if (selectedToCompare.length < 4) {
        setSelectedToCompare([...selectedToCompare, id]);
      }
    }
  };

  const handleToggleShortlist = (id: string) => {
    if (shortlistedIds.includes(id)) {
      setShortlistedIds(prev => prev.filter(i => i !== id));
    } else {
      setShortlistedIds(prev => [...prev, id]);
    }
  };

  useEffect(() => {
    let filtered = [...providers];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (allowedProviderIds) {
      filtered = filtered.filter(p => allowedProviderIds.includes(p._id));
    }

    if (selectedSort === "roi") {
      filtered.sort((a, b) => {
        const feeA = a.comparison?.feesStartingFrom || Number.MAX_SAFE_INTEGER;
        const feeB = b.comparison?.feesStartingFrom || Number.MAX_SAFE_INTEGER;
        return feeA - feeB;
      });
    } else if (selectedSort === "trending") {
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    setFilteredProviders(filtered);
    setAnimKey(k => k + 1);
    setVisibleCount(PAGE_SIZE);
    setIsLoadingMore(false);
  }, [searchTerm, allowedProviderIds, providers, selectedSort]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (visibleCount >= filteredProviders.length) return;
    if (isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsLoadingMore(true);
          window.setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredProviders.length));
            setIsLoadingMore(false);
          }, 600);
        }
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [filteredProviders.length, visibleCount, isLoadingMore]);

  const visibleProviders = filteredProviders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProviders.length;
  const skeletonCount = hasMore
    ? Math.min(PAGE_SIZE, filteredProviders.length - visibleCount)
    : 0;

  const handleFilterByCourse = (providerIds: string[] | null) => {
    setAllowedProviderIds(providerIds);
  };

  // Pattern from homepage: pick out a specific section if needed
  // For now we'll just render the sections at the top/bottom and the listing in between
  // Or if there's no specific section setup, we render a default header.

  return (
    <main className="min-h-screen bg-[#FDFCFE] lg:pt-7">
      {/* Dynamic Sections (like Hero for this page if it exists in CMS) */}
      {/* <SectionRenderer sections={sections.filter(s => s.sectionIndex === 0)} /> */}

      <div className="max-w-[90vw] mx-auto px-4 py-12">
        {/* Default Header if no sections define it */}
        {sections.length === 0 && (
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Top Universities
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
              Explore and compare top-rated universities for online education
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters Sidebar */}
          <SidebarFilters
            selectedToCompare={selectedToCompare}
            onSearchChange={setSearchTerm}
            onFilterChange={handleFilterByCourse}
            selectedSort={selectedSort}
            onSelectSort={setSelectedSort}
          />

          {/* Results Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {visibleProviders.map((uni, index) => (
                <div
                  key={`${uni._id}-${animKey}`}
                  className="animate-sort-in"
                  style={{ animationDelay: `${(index % PAGE_SIZE) * 40}ms` }}
                >
                  <UniversityCard
                    university={uni}
                    isCompare={selectedToCompare.includes(uni._id)}
                    onToggleCompare={() => handleToggleCompare(uni._id)}
                    isShortlisted={shortlistedIds.includes(uni._id)}
                    onToggleShortlist={() => handleToggleShortlist(uni._id)}
                  />
                </div>
              ))}

              {isLoadingMore &&
                Array.from({ length: skeletonCount }).map((_, i) => (
                  <UniversityCardSkeleton key={`skeleton-${i}`} />
                ))}

              {/* Placeholder cards if no providers yet to match screenshot exactly */}
              {filteredProviders.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-500 text-lg">No universities found matching your criteria.</p>
                </div>
              )}
            </div>

            {hasMore && <div ref={sentinelRef} className="h-10" aria-hidden />}

            {!hasMore && filteredProviders.length > PAGE_SIZE && (
              <div className="py-10 text-center text-sm text-gray-400">
                You&apos;ve reached the end.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remaining CMS Sections */}
      {/* <SectionRenderer sections={sections.filter(s => s.sectionIndex > 0)} /> */}
    </main>
  );
}
