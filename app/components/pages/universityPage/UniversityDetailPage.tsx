"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IconPlus, IconChartHistogram, IconInfoCircle, IconAward } from '@tabler/icons-react';
import {
  Star, MapPin, Share2, Award, CheckCircle2,
  ChevronRight, Calendar, BookOpen, GraduationCap,
  Users, TrendingUp, Download, Phone, MessageCircle,
  FileText, ShieldCheck, Info, ArrowRight,
  ChevronDown, Briefcase, Trophy, CreditCard,
  Globe, CircleDollarSign, Clock, Monitor, Lock, ExternalLink,
  Heart,
  X,
  AlertTriangle,
  Building2
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Provider, ProviderCourse, Review } from "@/app/lib/types";



interface UniversityDetailPageProps {
  id: string;
}

export default function UniversityDetailPage({ id }: UniversityDetailPageProps) {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [courses, setCourses] = useState<ProviderCourse[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);

  // Check if shortlisted on mount
  useEffect(() => {
    const checkShortlist = async () => {
      const token = localStorage.getItem('studentToken');
      if (!token || !provider) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/public/student/shortlist`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const isItemShortlisted = data.some((item: any) => item.providerId === provider._id);
          setIsShortlisted(isItemShortlisted);
        }
      } catch (error) {
        console.error("Failed to fetch shortlist", error);
      }
    };

    if (provider) checkShortlist();
  }, [provider]);

  const handleToggleShortlist = async () => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      toast.error("Please login to shortlist universities");
      return;
    }

    if (!provider) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      if (isShortlisted) {
        const response = await fetch(`${apiUrl}/api/public/student/shortlist/${provider._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success("Removed from shortlist");
          setIsShortlisted(false);
        }
      } else {
        const response = await fetch(`${apiUrl}/api/public/student/shortlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            providerId: provider._id,
            name: provider.name,
            logo: provider.logo,
            rating: provider.averageRating || 4.2,
            approvals: provider.approvals || [],
            startingFee: provider.comparison?.feesStartingFrom || 0,
            minimumDuration: provider.comparison?.duration || "",
            courses: [],
            states: []
          })
        });

        if (response.ok) {
          toast.success("Added to shortlist");
          setIsShortlisted(true);
        }
      }
    } catch (error) {
      console.error("Shortlist error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleAddToCompare = () => {
    if (!provider) return;

    const saved = localStorage.getItem('selectedToCompare');
    let selectedIds: string[] = [];
    if (saved) {
      try {
        selectedIds = JSON.parse(saved);
      } catch (e) {
        selectedIds = [];
      }
    }

    if (!selectedIds.includes(provider._id)) {
      if (selectedIds.length >= 4) {
        toast.error("You can only compare up to 4 universities");
        router.push('/compareUniversities');
        return;
      }
      selectedIds.push(provider._id);
      localStorage.setItem('selectedToCompare', JSON.stringify(selectedIds));
      toast.success("Added to comparison");
    }

    router.push(`/compareUniversities?ids=${selectedIds.join(',')}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // Fetch provider data, courses, and reviews using the slug (passed as prop 'id')
        const [providerRes, coursesRes, reviewsRes] = await Promise.all([
          fetch(`${baseUrl}/api/public/providers/${id}`),
          fetch(`${baseUrl}/api/public/providers/${id}/courses`),
          fetch(`${baseUrl}/api/public/providers/${id}/reviews`),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);

        if (!providerRes.ok) {
          if (providerRes.status === 404) throw new Error("University not found");
          throw new Error("Failed to fetch university details");
        }

        const providerData = await providerRes.json();
        setProvider(providerData);

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);

          // Check for courseId in URL
          const searchParams = new URLSearchParams(window.location.search);
          const courseIdParam = searchParams.get('courseId');

          if (courseIdParam && coursesData.some((c: any) => c._id === courseIdParam)) {
            setSelectedCourseId(courseIdParam);
            // Scroll to fees breakdown if requested
            if (window.location.hash === '#fees-breakdown') {
              setTimeout(() => {
                const element = document.getElementById('fees-breakdown');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 800);
            }
          } else if (coursesData.length > 0) {
            setSelectedCourseId(coursesData[0]._id);
          }
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const [activeTab, setActiveTab] = useState("about");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const categories = React.useMemo(() => {
    const uniqueDegrees = courses.reduce((acc: any[], current) => {
      const degree = current.degreeTypeId as any;
      if (degree && degree.isActive !== false && degree.name && !acc.find(d => d._id === degree._id)) {
        acc.push(degree);
      }
      return acc;
    }, []);

    // Sort by order field from the database
    uniqueDegrees.sort((a, b) => (a.order || 0) - (b.order || 0));

    return ["All", ...uniqueDegrees.map(d => d.name)];
  }, [courses]);

  const filteredCourses = activeCategory === "All"
    ? courses
    : courses.filter(c => (c.degreeTypeId as any)?.name === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] px-4 md:px-10 flex flex-col gap-4 md:gap-5 pt-4 md:pt-5 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="hidden md:flex justify-between items-center mb-2">
          <div className="w-64 h-5 bg-gray-200 rounded"></div>
          <div className="w-32 h-10 bg-gray-200 rounded-xl"></div>
        </div>

        {/* Hero Section Skeleton */}
        <div className="relative overflow-hidden mx-auto rounded-3xl w-full h-[300px] md:h-[400px] bg-gray-200">
          <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-gray-300"></div>
          <div className="absolute bottom-10 left-6 md:left-20 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-300 rounded-2xl mb-4"></div>
            <div className="w-64 md:w-96 h-8 md:h-10 bg-gray-300 rounded-lg mb-3"></div>
            <div className="w-48 md:w-80 h-5 bg-gray-300 rounded mb-6"></div>
          </div>
        </div>

        {/* Compare Banner Skeleton */}
        <div className="bg-gray-100 flex flex-col md:flex-row gap-4 p-5 md:px-6 md:py-4 rounded-3xl justify-between items-center border border-gray-200">
          <div className="flex gap-4 items-center md:items-start w-full">
            <div className="hidden sm:flex w-12 h-12 bg-gray-200 rounded-2xl"></div>
            <div className="flex-1">
              <div className="w-64 h-6 bg-gray-200 rounded mb-2"></div>
              <div className="w-full max-w-md h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-full md:w-auto h-12 w-32 bg-gray-200 rounded-2xl"></div>
        </div>

        {/* Main Content Area */}
        <div className="pb-8">
          {/* Navigation Tabs Skeleton */}
          <div className="mb-8 flex gap-4 overflow-hidden border-b border-gray-200 pb-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="w-24 h-6 bg-gray-200 rounded shrink-0"></div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column Skeleton */}
            <div className="flex-1 lg:max-w-[calc(100%-360px)] space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-40 h-6 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 h-24 bg-gray-50"></div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-40 h-6 bg-gray-200 rounded-lg mb-6"></div>
                <div className="flex flex-wrap gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-1 min-w-[140px] h-24 bg-gray-50 rounded-2xl border border-gray-100"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar) Skeleton */}
            <aside className="w-full lg:w-[340px] shrink-0 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex justify-between items-center" >
                    <div className="w-24 h-5 bg-gray-200 rounded"></div>
                    <div className="w-16 h-5 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 h-32"></div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <div className="text-center p-12 bg-white rounded-[32px] shadow-2xl shadow-indigo-100/50 border border-gray-100 max-w-lg mx-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-500 mb-8 font-medium">{error || "We couldn't find the university you're looking for."}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              Go Back Home
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-600 font-black rounded-2xl hover:border-indigo-100 hover:text-[#6366F1] transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }


  const tabs = [
    { id: "about", label: "About University", show: true },
    { id: "rankings", label: "Rankings", show: provider.rankings && provider.rankings.length > 0 },
    { id: "programs", label: "Programs Offered", show: true },
    { id: "eligibility", label: "Eligibility", show: true },
    { id: "admission", label: "Admission Process", show: true },
    { id: "placements", label: "Placement & recruiters", show: provider.placementPartners && provider.placementPartners.length > 0 },
    { id: "campuses", label: "Campuses", show: provider.campuses && provider.campuses.length > 0 },
    { id: "reviews", label: "Review & Ratings", show: true },
    { id: "faq", label: "FAQs", show: provider.faq && provider.faq.length > 0 },
  ].filter(tab => tab.show);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 md:px-10 flex flex-col gap-4 md:gap-5 pt-4 md:pt-4">
      {/* Breadcrumb - Hidden on mobile for cleaner look */}
      <div className="hidden md:flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/universities" className="hover:text-purple-600 transition-colors">Universities</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-semibold">{provider.name}</span>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center">
          <button
            onClick={handleToggleShortlist}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer ${isShortlisted
              ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
              : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
              }`}
          >
            {isShortlisted ? (
              <>
                <Heart className="w-4 h-4 fill-current" />
                Shortlisted
              </>
            ) : (
              <>
                <IconPlus stroke={2} />
                Add to Shortlist
              </>
            )}
          </button>
        </div>
      </div>
      {/* Hero Section - Purple gradient banner */}
      <div className="relative  overflow-hidden mx-auto rounded-3xl w-full" >
        {/* Background campus image with overlay */}
        <div className="absolute inset-0">
          <Image
            src={provider.coverImage || provider.galleryImages?.[0] || "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop"}
            alt={provider.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-60" />
        </div>

        {/* Shortlist Heart Button in Hero Banner */}
        <button
          onClick={handleToggleShortlist}
          className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group/heart z-10"
        >
          <Heart
            className={`w-6 h-6 transition-all duration-300 ${isShortlisted ? 'fill-rose-500 text-rose-500' : 'text-white group-hover/heart:text-rose-400'}`}
          />
        </button>

        {/* Hero Content */}
        <div className="relative px-6 py-10 md:py-16 flex flex-col items-center md:items-start text-center md:text-left text-white md:pl-20">
          {/* Logo */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center p-3 mb-6 md:mb-4">
            <Image
              src={provider.logo || "/placeholder-logo.png"}
              alt={`${provider.name} Logo`}
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          {/* University Name */}
          <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
            {provider.name}
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-6 max-w-xl line-clamp-2 md:line-clamp-none font-medium">
            {provider.coverDescription || provider.shortExcerpt || "A premier institution offering high-quality education with a focus on innovation and excellence."}
          </p>
        </div>
      </div>
      {/* add to compare div */}
      <div className="bg-gradient-to-br from-[#E9DDFF] via-[#D9C3FF] to-[#E9DDFF] flex flex-col md:flex-row gap-4 p-5 md:px-6 md:py-4 rounded-3xl justify-between items-center border border-purple-200/50 shadow-sm">
        <div className="flex gap-4 items-center md:items-start text-center md:text-left">
          <div className="hidden sm:flex w-12 h-12 bg-white/50 rounded-2xl items-center justify-center shrink-0 shadow-inner">
            <IconChartHistogram stroke={2} color="#6366F1" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[#6366F1] font-bold text-base md:text-lg">Want to compare with other universities?</h1>
            <h2 className="text-[#64748B] text-xs md:text-sm font-medium mt-1">Side-by-side fee, exam, employer, and ROI data — all visible without entering your number.</h2>
          </div>
        </div>
        <div className="w-full md:w-auto">

          {/* Action Buttons */}
          <button
            onClick={handleAddToCompare}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#7C3AED] text-white text-sm font-bold rounded-2xl hover:bg-[#6D28D9] transition-all shadow-lg shadow-purple-200 active:scale-95 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            Add to compare
          </button>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="pb-8">
        {/* Navigation Tabs - Adjusted for mobile sticky header */}
        <div className="sticky top-[70px] md:top-0 z-40 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 lg:max-w-[calc(100%-360px)] mx-[-4px] md:mx-0 overflow-hidden ring-1 ring-black/[0.02]">
          {/* Desktop Version - Custom Scrollbar */}
          <div className="hidden md:flex overflow-x-auto items-center p-1.5 pb-2 scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-purple-50/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7C3AED] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#6D28D9] [&::-webkit-scrollbar-button]:w-0 [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-button]:hidden [scrollbar-width:thin] [scrollbar-color:#7C3AED_transparent]">
            <div className="flex gap-1.5 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`relative px-6 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-300 rounded-2xl cursor-pointer group ${activeTab === tab.id
                    ? "text-purple-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                    }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabPillDesktop"
                      className="absolute inset-0 bg-purple-50 border border-purple-100/50 rounded-xl z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Version - No Scrollbar */}
          <div className="md:hidden overflow-x-auto no-scrollbar flex items-center p-1.5 scroll-smooth">
            <div className="flex gap-1.5 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`relative px-6 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-300 rounded-2xl cursor-pointer group ${activeTab === tab.id
                    ? "text-purple-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                    }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabPillMobile"
                      className="absolute inset-0 bg-purple-50 border border-purple-100/50 rounded-xl z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Scroll Indicators */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none z-20 md:hidden" />
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent pointer-events-none z-20 md:hidden opacity-0" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 lg:max-w-[calc(100%-360px)]">

            {/* About Section */}
            <section id="about" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 scroll-mt-[160px] md:scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                  <IconChartHistogram stroke={2} color="#6366F1" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">About University</h2>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-6">
                {provider.aboutContent ? (
                  <div dangerouslySetInnerHTML={{ __html: provider.aboutContent }} />
                ) : (
                  <p className="text-sm">
                    {provider.shortExcerpt || `${provider.name} is a premier institution offering high-quality education with a focus on innovation and excellence. With state-of-the-art infrastructure and experienced faculty, we provide a transformative learning experience for students globally.`}
                  </p>
                )}
              </div>

              {/* Info Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Type of Education</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{provider.isActive === "active" ? "Online" : "Regular"}</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">On Paper Reviews</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-sm font-bold text-gray-900">{provider.averageRating || 0}/5</span>
                    <span className="text-xs text-gray-400 ml-1">({provider.reviewCount || reviews.length} reviews)</span>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Location</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{provider.comparison?.location || provider.location || "Online"}</p>
                </div>
              </div>
            </section>

            {/* Rankings Section */}
            {(provider.rankings && provider.rankings.length > 0) && (
              <section id="rankings" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 scroll-mt-[160px] md:scroll-mt-24">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                    <Trophy className="w-5 h-5" color="#6366F1" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Rankings & Recognition</h2>
                </div>
                {provider.rankingsDescription && (
                  <div className="text-gray-600 text-sm leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: provider.rankingsDescription }} />
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {provider.rankings.map((ranking, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all group/ranking shadow-sm">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600 shrink-0 group-hover/ranking:bg-purple-600 group-hover/ranking:text-white transition-all duration-300">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">{ranking.title}</h4>
                        <p className="text-sm text-gray-500 font-medium leading-snug">{ranking.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Overview Section */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <IconChartHistogram stroke={2} color="#6366F1" className="w-5 h-5" />
                <h2 className="text-lg font-bold text-gray-900">Quick Overview</h2>
              </div>

              {/* Overview Cards */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[140px] bg-[#F8F9FF] rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-[#E0E7FF]">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#E0E7FF]">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-gray-900">{courses.length}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Programs</div>
                  </div>
                </div>

                {provider.comparison?.ugcDebStatus && (
                  <div className="flex-1 min-w-[140px] bg-[#F0FDF4] rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-[#DCFCE7]">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#DCFCE7]">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-emerald-600">UGC</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approved</div>
                    </div>
                  </div>
                )}

                <div className="flex-1 min-w-[140px] bg-[#FFF7ED] rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-[#FFEDD5]">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#FFEDD5]">
                    <CircleDollarSign className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-orange-600">₹{(provider.comparison?.feesStartingFrom || 0).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Starting Fees</div>
                  </div>
                </div>

                <div className="flex-1 min-w-[140px] bg-[#FEFCE8] rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-[#FEF9C3]">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#FEF9C3]">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-gray-900">{provider.comparison?.duration || "2 Years"}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</div>
                  </div>
                </div>
              </div>

              {/* Who Should Choose Box */}
              {provider.whoShouldChoosePoints && provider.whoShouldChoosePoints.length > 0 && (
                <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-tight">Who Should Choose {provider.name} Online?</h3>
                  </div>
                  <div className="space-y-3">
                    {provider.whoShouldChoosePoints.map((point: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-sm text-emerald-700 font-medium leading-tight">{point.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Approvals & Accreditations */}
            {(provider.approvals && provider.approvals.length > 0) && (
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                    <ShieldCheck className="w-5 h-5" color="#6366F1" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Approvals & Accreditations</h2>
                </div>
                {provider.approvalsDescription && (
                  <div className="text-gray-600 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: provider.approvalsDescription }} />
                )}
                <div className="flex flex-wrap gap-4">
                  {provider.approvals.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      {a.logo && <Image src={a.logo} alt={a.name} width={28} height={28} className="object-contain" />}
                      <span className="text-sm font-semibold text-gray-700">{a.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Highlights */}
            {(provider.facts && provider.facts.length > 0) && (
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                    <Award className="w-5 h-5" color="#6366F1" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Key Highlights</h2>
                </div>
                {provider.factsDescription && (
                  <div className="text-gray-600 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: provider.factsDescription }} />
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {provider.facts.slice(0, 8).map((item: any, i) => (
                    <div key={i} className="flex items-start md:items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all h-full group/fact">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0 transition-colors group-hover/fact:bg-purple-100">
                        <IconAward className="w-5 h-5" stroke={2} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 leading-tight">
                          {typeof item.text === 'string' ? item.text : 'Highlight'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Programs / Online Courses Table */}
            <section id="programs" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 scroll-mt-[160px] md:scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-6 h-6 text-[#6366F1]" />
                <h2 className="text-xl font-bold text-gray-900">Courses & Fees</h2>
              </div>

              {/* Alert Banner */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 mb-8">
                <div className="p-2 bg-white rounded-lg flex items-center justify-center shadow-sm border border-emerald-100">
                  <Lock className="text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-emerald-800">
                  All fee details below are visible without entering your phone number — always.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap cursor-pointer ${activeCategory === cat
                      ? "bg-indigo-50 border-indigo-200 text-[#6366F1] shadow-sm"
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                  >
                    {cat === "Post Graduate" ? "PG Courses" : cat === "Under Graduate" ? "UG Courses" : cat}
                  </button>
                ))}
              </div>

              {/* Course Cards Grid */}
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() => setSelectedCourseId(course._id)}
                    className={`group bg-white rounded-2xl border p-5 transition-all cursor-pointer relative ${selectedCourseId === course._id
                      ? "border-indigo-600 shadow-lg shadow-indigo-100 ring-1 ring-indigo-600"
                      : "border-gray-100 hover:border-indigo-100 hover:shadow-md"
                      }`}
                  >
                    {/* Selected Badge */}
                    {selectedCourseId === course._id && (
                      <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${course.title.includes('MBA') ? 'bg-blue-50 border-blue-100 text-blue-600' :
                          course.title.includes('MCA') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                            course.title.includes('BBA') ? 'bg-orange-50 border-orange-100 text-orange-600' :
                              'bg-purple-50 border-purple-100 text-purple-600'
                          }`}>
                          {course.title.includes('MBA') ? <Briefcase className="w-6 h-6" /> :
                            course.title.includes('MCA') ? <Monitor className="w-6 h-6" /> :
                              course.title.includes('BBA') ? <Globe className="w-6 h-6" /> :
                                <GraduationCap className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-gray-900 mb-1 group-hover:text-[#6366F1] transition-colors">
                            {course.title.includes('Online') ? course.title : `Online ${course.title}`}
                          </h3>
                          <p className="text-sm text-gray-400 font-medium">
                            {(course.specializationId as any)?.name || "General Management, Data Analytics, Finance"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-bold">{course.duration || "2 Years"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-bold">Jan/Jul</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-xs font-bold">10-12 hrs/week</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                        <div className="text-right">
                          <div className="text-xl font-black text-[#6366F1]">₹{course.fees?.toLocaleString() || "1,50,000"}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EMI ₹{(course.fees ? Math.round(course.fees / 18) : 8500).toLocaleString()}/sem</div>
                        </div>
                        <Link
                          href={`/course-detail?id=${(course.courseId as any)?.slug || (course.courseId as any)?._id || course.courseId}`}
                          className="flex items-center gap-2 px-5 py-2.5 border-2 border-indigo-600 text-[#6366F1] rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                        >
                          View Details
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCourses.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-medium">No courses found in this category.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Detailed Fees Breakdown Section */}
            {(() => {
              const selectedCourse = courses.find(c => c._id === selectedCourseId) || filteredCourses[0];
              if (!selectedCourse) return null;

              return (
                <section id="fees-breakdown" className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100 mb-6 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <CircleDollarSign className="w-6 h-6 text-[#6366F1]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Detailed Fees Breakdown ({selectedCourse.title.includes('MBA') ? 'MBA' : selectedCourse.title.split(' ').pop()})
                    </h2>
                  </div>

                  <div className="space-y-0 mb-6">
                    {(selectedCourse.feesBreakdown && selectedCourse.feesBreakdown.length > 0 ? selectedCourse.feesBreakdown : [
                      { label: "Semester Fees (×4)", amount: 137000 },
                      { label: "Registration Fee (one-time)", amount: 10000 },
                      { label: "Exam Fees (×4 semesters)", amount: 16000 },
                      { label: "Alumni Association Fee", amount: 2000 },
                      { label: "Library & Resource Access", amount: 10000 }
                    ]).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
                        <span className="text-sm font-medium text-gray-500">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900">₹{item.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total Program Cost Banner */}
                  <div className="bg-[#F5F3FF] rounded-xl py-5 px-8 flex justify-between items-center mb-6">
                    <span className="text-base font-black text-[#6366F1]">Total Program Cost</span>
                    <span className="text-xl font-black text-[#6366F1]">
                      ₹{(selectedCourse.fees || 175000).toLocaleString()}
                    </span>
                  </div>

                  {/* EMI Available Banner */}
                  <div className="bg-[#ECFDF5] border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-emerald-900 leading-relaxed">
                      <span className="font-bold">EMI available:</span> As low as ₹{(selectedCourse as any).emiStartingAmount || "8,750/semester"} {(selectedCourse as any).emiTerms || "through approved banking partners. No cost EMI on select cards."}
                    </p>
                  </div>
                </section>
              );
            })()}

            {/* Sample Certificate */}
            {(provider.sampleCertificateImage || provider.sampleCertificateDescription) && (
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                    <FileText className="w-5 h-5" color="#6366F1" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Sample Certificate</h2>
                </div>
                {provider.sampleCertificateDescription && (
                  <div className="text-gray-600 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: provider.sampleCertificateDescription }} />
                )}
                {provider.sampleCertificateImage && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
                    <Image src={provider.sampleCertificateImage} alt="Sample Certificate" width={460} height={320} className="object-contain rounded-lg" />
                  </div>
                )}
              </section>
            )}

            {/* Admission Process */}
            <section id="admission" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6 scroll-mt-[160px] md:scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                  <Users className="w-5 h-5" color="#6366F1" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Admission Process</h2>
              </div>
              {provider.admissionProcess && (
                <div className="text-gray-600 text-sm leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: provider.admissionProcess }} />
              )}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { title: "Fill Application", desc: "Register online with your details." },
                  { title: "Document Upload", desc: "Upload scanned documents." },
                  { title: "Fee Payment", desc: "Pay via secure gateway." },
                  { title: "Review & Selection", desc: "Committee reviews application." },
                  { title: "Confirmation", desc: "Receive admission letter." },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition-all">
                    <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold mb-2">{i + 1}</div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1">{step.title}</h4>
                    <p className="text-gray-500 text-[11px] leading-snug">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Eligibility Section */}
            <section id="eligibility" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 scroll-mt-[160px] md:scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                  <CheckCircle2 className="w-5 h-5" color="#6366F1" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Eligibility Criteria</h2>
              </div>
              {provider.comparison?.eligibility ? (
                <div className="text-gray-600 text-sm leading-relaxed">
                  <p>{provider.comparison.eligibility}</p>
                  {provider.comparison.minimumRequirements && (
                    <p className="mt-3"><span className="font-semibold text-gray-900">Minimum Requirements:</span> {provider.comparison.minimumRequirements}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.reduce((acc: { degree: string; eligibility: string }[], c) => {
                    const degreeName = (c.degreeTypeId as any)?.name || "General";
                    if (c.eligibility && !acc.find(a => a.degree === degreeName)) {
                      acc.push({ degree: degreeName, eligibility: c.eligibility });
                    }
                    return acc;
                  }, []).map((item, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-purple-100 transition-all">
                      <h4 className="flex items-center gap-2 text-purple-600 font-bold mb-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {item.degree}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.eligibility}</p>
                    </div>
                  ))}
                  {courses.every(c => !c.eligibility) && (
                    <p className="text-gray-500 text-sm col-span-2">Eligibility information will be updated soon. Please contact the university for details.</p>
                  )}
                </div>
              )}
            </section>

            {/* Quick Facts */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                  <Info className="w-5 h-5" color="#6366F1" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Quick Facts</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: MapPin, label: "Location", value: provider.comparison?.location || provider.location || "Online" },
                  ...(provider.comparison?.duration ? [{ icon: Calendar, label: "Duration", value: provider.comparison.duration }] : []),
                  ...(provider.comparison?.intakePeriod ? [{ icon: Calendar, label: "Intake", value: provider.comparison.intakePeriod }] : []),
                  ...(provider.comparison?.accreditation ? [{ icon: ShieldCheck, label: "Accreditation", value: provider.comparison.accreditation }] : []),
                  ...(provider.comparison?.placementRate ? [{ icon: TrendingUp, label: "Placement Rate", value: `${provider.comparison.placementRate}%` }] : []),
                  ...(provider.comparison?.totalSeatsAvailable ? [{ icon: Users, label: "Total Seats", value: provider.comparison.totalSeatsAvailable.toLocaleString() }] : []),
                  { icon: Globe, label: "Mode", value: provider.isActive === "active" ? "Online" : "Regular" },
                  { icon: Star, label: "Rating", value: `${provider.averageRating || 0}/5` },
                ].filter(Boolean).slice(0, 6).map((item: any, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center text-purple-600 shrink-0">
                      <item.icon className="w-4 h-4" color="#6366F1" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase block">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Placements & Partners */}
            {(provider.placementPartners && provider.placementPartners.length > 0) && (
              <section id="placements" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 scroll-mt-[160px] md:scroll-mt-24">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                    <Briefcase className="w-5 h-5" color="#6366F1" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Placement Partners</h2>
                </div>
                {provider.placementPartnersDescription && (
                  <div className="text-gray-600 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: provider.placementPartnersDescription }} />
                )}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 items-center justify-items-center">
                  {provider.placementPartners.map((p, i) => (
                    <div key={i} className="h-12 w-24 relative">
                      <Image src={p.logo} alt={p.name} fill className="object-contain" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Campuses Section */}
            {(provider.campuses && provider.campuses.length > 0) && (
              <section id="campuses" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 scroll-mt-[160px] md:scroll-mt-24">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                    <MapPin className="w-5 h-5" color="#6366F1" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Our Campuses</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {provider.campuses.map((campus: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all group/campus">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0 group-hover/campus:bg-purple-100 transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{campus.city}</h4>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{campus.state}, {campus.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Stats Section */}
            {(provider.comparison?.placementRate || provider.comparison?.averageSalary || (provider.placementPartners && provider.placementPartners.length > 0)) && (
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-[#6366F1]" strokeWidth={2} />
                  <h2 className="text-lg font-bold text-gray-900">How your life will change?</h2>
                </div>
                <div className="flex flex-wrap gap-4">
                  {[
                    ...(provider.comparison?.placementRate ? [{ value: `${provider.comparison.placementRate}%`, label: "Placement Rate", colorTheme: "indigo", icon: TrendingUp }] : []),
                    ...(provider.comparison?.averageSalary ? [{ value: `₹${(provider.comparison.averageSalary / 100000).toFixed(1)}L`, label: "Avg. Salary", colorTheme: "orange", icon: CircleDollarSign }] : []),
                    ...(provider.placementPartners ? [{ value: `${provider.placementPartners.length}+`, label: "Hiring Partners", colorTheme: "blue", icon: Users }] : []),
                    ...(provider.comparison?.totalSeatsAvailable ? [{ value: `${(provider.comparison.totalSeatsAvailable / 1000).toFixed(0)}k+`, label: "Active Learners", colorTheme: "emerald", icon: GraduationCap }] : []),
                  ].map((stat, i) => {
                    const themes: Record<string, { bg: string, border: string, text: string, icon: string }> = {
                      indigo: { bg: "bg-[#F8F9FF]", border: "border-[#E0E7FF]", text: "text-indigo-600", icon: "text-indigo-500" },
                      orange: { bg: "bg-[#FFF7ED]", border: "border-[#FFEDD5]", text: "text-orange-600", icon: "text-orange-500" },
                      blue: { bg: "bg-[#EFF6FF]", border: "border-[#DBEAFE]", text: "text-blue-600", icon: "text-blue-500" },
                      emerald: { bg: "bg-[#F0FDF4]", border: "border-[#DCFCE7]", text: "text-emerald-600", icon: "text-emerald-500" }
                    };
                    const theme = themes[stat.colorTheme];
                    const IconComponent = stat.icon;
                    
                    return (
                      <div key={i} className={`flex-1 min-w-[140px] ${theme.bg} rounded-2xl p-4 flex flex-col items-center text-center gap-2 border ${theme.border}`}>
                        <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border ${theme.border}`}>
                          <IconComponent className={`w-5 h-5 ${theme.icon}`} />
                        </div>
                        <div>
                          <div className={`text-xl font-black ${theme.text}`}>{stat.value}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section id="reviews" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6 scroll-mt-[160px] md:scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                  <Star className="w-5 h-5" color="#6366F1" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Student Reviews</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className="text-5xl font-extrabold text-gray-900 mb-1">{provider.averageRating || "4.1"}</span>
                  <div className="flex gap-0.5 text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(Number(provider.averageRating) || 4) ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <span className="text-gray-400 text-xs font-medium">Based on {provider.reviewCount || reviews.length} reviews</span>
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: "Academics", score: 85 },
                    { label: "Faculty", score: 90 },
                    { label: "Campus Life", score: 70 },
                    { label: "Placement", score: 80 },
                  ].map((bar, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-500">
                        <span>{bar.label}</span>
                        <span>{(bar.score / 20).toFixed(1)}/5</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${bar.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map(rev => (
                  <div key={rev._id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                          {rev.studentId?.name?.[0] || "S"}
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 text-sm">{rev.studentId?.name || "Student"}</h5>
                          <p className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-current" : ""}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{rev.content}</p>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-medium">No reviews yet</p>
                  </div>
                )}
              </div>
            </section>

            {/* FAQs */}
            {provider.faq && provider.faq.length > 0 && (
              <section id="faq" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 scroll-mt-[160px] md:scroll-mt-24">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg text-purple-600">
                    <MessageCircle className="w-5 h-5" color="#6366F1" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-2">
                  {provider.faq.map((item, i) => (
                    <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                      <summary className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <span className="font-semibold text-gray-900 text-sm">{item.question}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0" />
                      </summary>
                      <div className="px-5 pb-4 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-3">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}



            {/* Disclaimer */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Disclaimer</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                The information provided on this page is for general informational purposes only. While we strive to keep the information up to date and accurate, we make no representations or warranties of any kind. All fees, courses, and programs are subject to change without notice. Please verify details directly with the university.
              </p>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <aside className="w-full lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-24  flex flex-col gap-4">

              {/* Apply Now Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {/* Row 1: UGC-DEB Status */}
                  {provider.comparison?.ugcDebStatus && (
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#6366F1]" />
                        <span className="text-sm font-medium text-gray-500">UGC-DEB Status</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approved</span>
                      </div>
                    </div>
                  )}

                  {/* Row 2: NAAC Grade */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-[#6366F1]" />
                      <span className="text-sm font-medium text-gray-500">NAAC Grade</span>
                    </div>
                    <span className="text-sm font-bold text-[#6366F1]">{provider.comparison?.naacGrade || "N/A"}</span>
                  </div>

                  {/* Row 3: Fees */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <CircleDollarSign className="w-5 h-5 text-[#6366F1]" />
                      <span className="text-sm font-medium text-gray-500">Courses Starting from</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">₹{(provider.comparison?.feesStartingFrom || 0).toLocaleString()}</span>
                  </div>

                  {/* Row 4: Duration */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[#6366F1]" />
                      <span className="text-sm font-medium text-gray-500">Duration</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{provider.comparison?.duration || "2 Years"}</span>
                  </div>

                  {/* Row 5: Exam Type */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-[#6366F1]" />
                      <span className="text-sm font-medium text-gray-500">Exam Type</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600">{provider.comparison?.examType || "N/A"}</span>
                  </div>

                  {/* Row 6: Weekly Effort */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#6366F1]" />
                      <span className="text-sm font-medium text-gray-500">Weekly Effort</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{provider.comparison?.timeCommitment || "10-12 hrs"}</span>
                  </div>

                  {/* Row 7: ROI Score */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-[#6366F1]" />
                      <span className="text-sm font-medium text-gray-500">ROI Score</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">{provider.comparison?.roiScore || "N/A"}</span>
                  </div>

                  {/* Row 8: Student Rating */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-[#6366F1]" />
                      <span className="text-sm font-medium text-gray-500">Student Rating</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{provider.averageRating || 0} / 5</span>
                  </div>
                </div>
              </div>

              {/* EMI Options */}
              {/* <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-2">EMI Options Available</h4>
                <p className="text-xs text-gray-500 mb-3">Starting from ₹{Math.round((provider.comparison?.feesStartingFrom || courses[0]?.fees || 0) / 12).toLocaleString()}/month</p>
                <button className="text-purple-600 text-xs font-bold hover:underline flex items-center gap-1">
                  Check EMI Plans <ChevronRight className="w-3 h-3" />
                </button>
              </div> */}

              {/* Need Help */}
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-2">
                <div className="flex gap-1 items-center">
                  <IconInfoCircle stroke={2} color="#7C3AED" />
                  <h4 className="font-bold">Need Admission Guidance?</h4>
                </div>
                <p className="text-[#64748B] text-sm">Have questions? Our counselors can help you choose the right program.</p>
                <Link href="/talk-to-experts" className="bg-[#7C3AED] text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-purple-700  transition-colors w-full cursor-pointer">
                  Talk to Expert
                </Link>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

