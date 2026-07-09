"use client";

import React, { useState, useMemo } from "react";
import { SectionContent, DegreeType, Course, Specialization } from "@/app/lib/types";
import { IconArrowLeft, IconZoom, IconSearch, IconBuildingBank, IconBookmark } from '@tabler/icons-react';
import SectionRenderer from "@/app/components/SectionRenderer";
import SidebarFilters from "./SidebarFilters";
import ProgramCard from "./ProgramCard";
import Link from "next/link";
import TalkToCounselor from "../../talkToCounselor";
import CompactUniversityCard from "./CompactUniversityCard";
import CompareDrawer from "@/app/components/shared/CompareDrawer";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getAllProviderCourses } from "@/app/lib/api";
import { ProviderCourse } from "@/app/lib/types";

interface ExploreProgramsPageProps {
  sections: SectionContent[];
  degreeTypes: DegreeType[];
  courses: Course[];
  specializations: Specialization[];
  initialType?: string;
  initialCourse?: string;
  initialSpecialization?: string;
}

export default function ExploreProgramsPage({
  sections,
  degreeTypes,
  courses,
  specializations,
  initialType,
  initialCourse,
  initialSpecialization,
}: ExploreProgramsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [providerCoursesList, setProviderCoursesList] = React.useState<ProviderCourse[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedToCompare, setSelectedToCompare] = React.useState<string[]>([]);
  const [selectedSort, setSelectedSort] = React.useState<string | null>(null);

  // Load selection from localStorage on mount
  React.useEffect(() => {
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
  }, []);

  // Save selection to localStorage whenever it changes
  React.useEffect(() => {
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

  const updateQueryParams = React.useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // Derive selection from URL parameters for instant UI updates
  const currentTypeSlug = searchParams.get("type") || initialType;
  const currentCourseSlugOrId = searchParams.get("course") || initialCourse;
  const currentSpecializationId = searchParams.get("spec") || initialSpecialization;

  const selectedDegreeTypeId = useMemo(() => {
    // 1. If course is selected, use its degree type
    if (currentCourseSlugOrId) {
      const match = courses.find(c => c.slug === currentCourseSlugOrId || c._id === currentCourseSlugOrId);
      const dId = typeof match?.degreeTypeId === "string" ? match?.degreeTypeId : match?.degreeTypeId?._id;
      if (dId) return dId;
    }

    // 2. If type slug is in URL, match it
    if (currentTypeSlug) {
      const type = currentTypeSlug.toLowerCase();
      const match = degreeTypes.find((dt) => {
        const name = dt.name.toLowerCase();
        const slug = dt.slug?.toLowerCase() || "";
        return (
          slug === type ||
          name.includes(type) ||
          type.includes(name) ||
          (type === "pg" && (name.includes("post graduate") || name.startsWith("master"))) ||
          (type === "ug" && (name.includes("under graduate") || name.startsWith("bachelor")))
        );
      });
      return match?._id || null;
    }
    return null;
  }, [currentTypeSlug, currentCourseSlugOrId, degreeTypes, courses]);

  const selectedCourseId = useMemo(() => {
    if (!currentCourseSlugOrId) return null;
    const match = courses.find(c => c.slug === currentCourseSlugOrId || c._id === currentCourseSlugOrId);
    return match?._id || null;
  }, [currentCourseSlugOrId, courses]);

  const selectedSpecializationId = currentSpecializationId || null;

  // Load provider courses when specialization changes
  React.useEffect(() => {
    if (selectedSpecializationId) {
      const loadProviderCourses = async () => {
        setIsLoadingProviders(true);
        try {
          const data = await getAllProviderCourses(selectedSpecializationId);
          setProviderCoursesList(data);
        } catch (err) {
          console.error("Failed to load provider courses:", err);
        } finally {
          setIsLoadingProviders(false);
        }
      };
      loadProviderCourses();
    } else {
      setProviderCoursesList([]);
    }
  }, [selectedSpecializationId]);

  // Sync sort state with URL
  React.useEffect(() => {
    const sortParam = searchParams.get("sort");
    setSelectedSort(sortParam || null);
  }, [searchParams]);

  const filteredCourses = useMemo(() => {
    let list = courses;
    if (selectedDegreeTypeId) {
      list = list.filter((c) => {
        const dId = typeof c.degreeTypeId === "string" ? c.degreeTypeId : c.degreeTypeId?.["_id"];
        return dId === selectedDegreeTypeId;
      });
    }
    if (searchQuery) {
      list = list.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [courses, selectedDegreeTypeId, searchQuery]);

  const filteredSpecializations = useMemo(() => {
    let list = [...specializations];
    if (selectedCourseId) {
      list = list.filter((s) => {
        const cId = typeof s.courseId === "string" ? s.courseId : s.courseId?.["_id"];
        return cId === selectedCourseId;
      });
    } else if (selectedDegreeTypeId) {
      // Filter by degree type indirectly
      list = list.filter((s) => {
        const course = typeof s.courseId === "string" ? courses.find(c => c._id === s.courseId) : s.courseId as Course;
        const dId = typeof course?.degreeTypeId === "string" ? course.degreeTypeId : course?.degreeTypeId?.["_id"];
        return dId === selectedDegreeTypeId;
      });
    }
    if (searchQuery) {
      list = list.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedSort === "trending") {
      list.sort((a, b) => (b.providerCount || 0) - (a.providerCount || 0));
    } else if (selectedSort === "roi") {
      // Sort by name as placeholder for ROI if no better metric
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [specializations, selectedCourseId, selectedDegreeTypeId, searchQuery, courses, selectedSort]);

  const filteredProviderCourses = useMemo(() => {
    let list = [...providerCoursesList];
    if (searchQuery) {
      list = list.filter((pc) => {
        const providerName = (pc.providerId as any)?.name || "";
        return providerName.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (selectedSort === "roi") {
      list.sort((a, b) => {
        const feeA = a.minFees || a.fees || Number.MAX_SAFE_INTEGER;
        const feeB = b.minFees || b.fees || Number.MAX_SAFE_INTEGER;
        return feeA - feeB;
      });
    } else if (selectedSort === "trending") {
      list.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
    }

    return list;
  }, [providerCoursesList, searchQuery, selectedSort]);

  const isSpecializationView = !!selectedCourseId && !selectedSpecializationId;
  const isUniversityView = !!selectedSpecializationId;

  // Unique providers behind the loaded provider-courses, for the compare drawer's labels.
  const compareUniversities = React.useMemo(() => {
    const byId = new Map<string, { _id: string; name: string; logo?: string }>();
    providerCoursesList.forEach((pc) => {
      const provider = pc.providerId as any;
      if (provider && typeof provider === "object" && provider._id) {
        byId.set(provider._id, provider);
      }
    });
    return Array.from(byId.values());
  }, [providerCoursesList]);

  const handleBack = () => {
    setSearchQuery("");
    if (selectedSpecializationId) {
      updateQueryParams({ spec: null });
    } else if (selectedCourseId) {
      updateQueryParams({ course: null });
    } else if (selectedDegreeTypeId) {
      updateQueryParams({ type: null });
    } else {
      router.back();
    }
  };

  const handleSpecializationClick = async (specId: string) => {
    updateQueryParams({ spec: specId });
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Hero / Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-5 md:py-8">
          {(isSpecializationView || isUniversityView) ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 cursor-pointer text-sm md:text-base font-semibold text-purple-600 mb-3 md:mb-4 hover:text-purple-700 transition-colors"
            >
              <IconArrowLeft stroke={2.5} className="w-5 h-5" />
              {isUniversityView ? "Back to Specializations" : "Back to Programs"}
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1 cursor-pointer text-sm md:text-base font-semibold text-purple-600 mb-3 md:mb-4 hover:text-purple-700 transition-colors"
            >
              <IconArrowLeft stroke={2.5} className="w-5 h-5" />
              Back to Home
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight">
            {isUniversityView
              ? `Universities for ${specializations.find(s => s._id === selectedSpecializationId)?.name || "Specialization"}`
              : isSpecializationView
                ? "Explore By Specializations"
                : "Explore Programs"}
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-medium max-w-2xl">
            {isUniversityView
              ? "Browse through top universities offering your chosen specialization"
              : isSpecializationView
                ? "Choose a specialization to see universities offering it"
                : "Choose a program type to explore specializations and universities"}
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Filters Sidebar */}
          <SidebarFilters
            degreeTypes={degreeTypes}
            selectedDegreeTypeId={selectedDegreeTypeId}
            onSelectDegreeType={(id) => {
              const match = degreeTypes.find(dt => dt._id === id);
              updateQueryParams({ type: match?.slug || id, course: null, spec: null, sort: null });
              setSearchQuery("");
            }}
            selectedSort={selectedSort}
            onSelectSort={(sort) => {
              setSelectedSort(sort);
              updateQueryParams({ sort });
            }}
            showSort={isSpecializationView}
          />

          {/* Main Content */}
          <div className="flex-1 space-y-6 md:space-y-8 min-w-0">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder={
                  isUniversityView
                    ? "Search universities..."
                    : isSpecializationView
                      ? "Search specializations..."
                      : "Search programs..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 md:h-14 pl-12 md:pl-14 pr-5 rounded-2xl border border-gray-200 bg-white shadow-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm md:text-base placeholder:text-gray-400 placeholder:font-medium"
              />
              <IconSearch className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-5 md:h-5 text-gray-400" stroke={2} />
            </div>

            {/* Grid */}
            <div className={`grid grid-cols-1 ${isUniversityView ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-3"} gap-4 md:gap-6`}>
              {isUniversityView ? (
                // Universities View
                isLoadingProviders ? (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4 animate-pulse w-full">
                        <div className="h-20 w-32 bg-gray-100 rounded-xl" />
                        <div className="h-5 w-3/4 bg-gray-100 rounded" />
                        <div className="h-4 w-24 bg-gray-100 rounded" />
                        <div className="w-full h-11 bg-gray-100 rounded-xl" />
                      </div>
                    ))}
                  </>
                ) : filteredProviderCourses.length > 0 ? (
                  filteredProviderCourses.map((pc) => (
                    <CompactUniversityCard
                      key={pc._id}
                      university={pc.providerId as any} // Cast as Provider
                      courseId={pc._id}
                      isCompare={selectedToCompare.includes((pc.providerId as any)._id)}
                      onToggleCompare={() => handleToggleCompare((pc.providerId as any)._id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 md:py-20 px-6 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center">
                      <IconBuildingBank className="w-7 h-7" stroke={1.8} />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-700 mb-1">
                      {searchQuery ? "No matching universities" : "No universities yet"}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {searchQuery
                        ? `We couldn't find any universities matching "${searchQuery}".`
                        : "We're still adding universities for this specialization."}
                    </p>
                  </div>
                )
              ) : !isSpecializationView ? (
                // Courses View
                filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <ProgramCard
                      key={course._id}
                      title={course.name}
                      subtitle={(typeof course.degreeTypeId === 'string' ? '' : course.degreeTypeId?.name) || 'Program'}
                      degreeType={typeof course.degreeTypeId === 'string' ? '' : course.degreeTypeId?.name}
                      count={specializations.filter(s => (typeof s.courseId === 'string' ? s.courseId : s.courseId?._id) === course._id).length}
                      onClick={() => updateQueryParams({ course: course.slug || course._id, spec: null })}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 md:py-20 px-6 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center">
                      <IconBookmark className="w-7 h-7" stroke={1.8} />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-700 mb-1">No matching programs</h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {searchQuery
                        ? `Try adjusting your search or filters.`
                        : "No programs available for this category yet."}
                    </p>
                  </div>
                )
              ) : (
                // Specializations View
                filteredSpecializations.length > 0 ? (
                  filteredSpecializations.map((spec) => (
                    <ProgramCard
                      key={spec._id}
                      variant="specialization"
                      title={spec.name}
                      count={spec.providerCount}
                      onClick={() => handleSpecializationClick(spec._id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 md:py-20 px-6 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center">
                      <IconBookmark className="w-7 h-7" stroke={1.8} />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-gray-700 mb-1">No matching specializations</h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {searchQuery
                        ? `Try adjusting your search.`
                        : "No specializations available yet."}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Banner */}
            <TalkToCounselor isSpecializationView={isSpecializationView} />
          </div>
        </div>
      </div>

      {/* Render CMS sections if any */}
      {/* <SectionRenderer sections={sections} /> */}

      {/* Only the university step of the flow exposes compare toggles */}
      {isUniversityView && (
        <CompareDrawer
          selectedIds={selectedToCompare}
          universities={compareUniversities}
          onRemove={handleToggleCompare}
        />
      )}
    </main>
  );
}
