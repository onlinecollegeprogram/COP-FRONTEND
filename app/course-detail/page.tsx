import React from "react";
import type { Metadata } from "next";
import { getCourseDetail } from "@/app/lib/api";
import Link from "next/link";
import { ProviderCourse, Course } from "@/app/lib/types";
import { JsonLd, courseSchema, breadcrumbSchema } from "@/app/lib/jsonld";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://collegeprogram.in";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { id } = await searchParams;
  if (!id) return { title: "Course not found" };

  try {
    const data = await getCourseDetail(id);
    const course = data?.course;
    if (!course) return { title: "Course not found" };

    const provider =
      data?.programs?.[0]?.providerId &&
      typeof data.programs[0].providerId !== "string"
        ? data.programs[0].providerId
        : null;

    const title = `${course.name}${provider?.name ? ` at ${provider.name}` : ""} — Fees, Duration & Admissions`;
    const description =
      course.shortDescription ||
      course.description ||
      `Explore the ${course.name} program${provider?.name ? ` at ${provider.name}` : ""}: fees, duration, eligibility, and admissions.`;
    const canonical = `${SITE_URL}/course-detail?id=${id}`;
    const ogImage =
      course.thumbnail || provider?.coverImage || provider?.logo || "/logo.webp";

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        title,
        description,
        siteName: "CollegeProgram",
        images: [{ url: ogImage, alt: course.name }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Course not found" };
  }
}

import { Breadcrumbs, Breadcrumb } from "@/app/components/Breadcrumbs";
import TalkToExperts from "../components/pages/experts/TalkToExperts";
import * as TablerIcons from "@tabler/icons-react";
import {
  IconAward,
  IconBriefcase,
  IconClockCheck,
  IconCurrencyRupee,
  IconCircleCheckFilled,
  IconArrowRight,
  IconBook,
  IconChevronRight,
  IconExternalLink,
  IconStarFilled,
  IconPlus,
  IconSparkles,
  IconTrendingUp,
  IconUsersGroup,
  IconBuildingBank,
  IconChartLine,
  IconQuestionMark,
} from "@tabler/icons-react";

interface CourseDetailResponse {
  course: Course;
  programs: ProviderCourse[];
  selectedProgramId?: string | null;
}

function CourseIcon({
  name,
  className = "w-6 h-6",
  stroke = 2,
}: {
  name?: string;
  className?: string;
  stroke?: number;
}) {
  if (!name) return <IconBook className={className} stroke={stroke} />;
  if (/^(https?:)?\/\//.test(name) || name.startsWith("/")) {
    return <img src={name} alt="Course feature icon" className={className} />;
  }
  const normalized = name.startsWith("Icon")
    ? name
    : "Icon" +
    name
      .split(/[-_\s]+/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("");
  const Cmp = (TablerIcons as Record<string, any>)[normalized];
  if (Cmp) return <Cmp className={className} stroke={stroke} />;
  return <IconBook className={className} stroke={stroke} />;
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 md:mb-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
          {icon}
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-3xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default async function CourseDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-8 md:p-12 bg-white rounded-3xl shadow-xl max-w-md border border-gray-100">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <IconBook className="w-8 h-8" stroke={2} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Course Not Found
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Please select a valid course from our listings.
          </p>
          <Link
            href="/online-courses"
            className="inline-block bg-[#7C3AED] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#6D28D9] transition-all text-sm"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  let data: CourseDetailResponse | null = null;
  try {
    data = await getCourseDetail(id);
  } catch (error) {
    console.error("Error fetching course detail:", error);
  }

  if (!data || !data.course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-8 md:p-12 bg-white rounded-3xl shadow-xl max-w-md border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Error Loading Course
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            We couldn't load this course. Please try again.
          </p>
          <Link
            href="/online-courses"
            className="inline-block bg-[#7C3AED] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#6D28D9] transition-all text-sm"
          >
            Return to Course List
          </Link>
        </div>
      </div>
    );
  }

  const { course, programs: programsRaw, selectedProgramId } = data;
  const programs = selectedProgramId
    ? [
      ...programsRaw.filter((p) => p._id === selectedProgramId),
      ...programsRaw.filter((p) => p._id !== selectedProgramId),
    ]
    : programsRaw;
  const firstProgram = programs[0] || ({} as ProviderCourse);

  const specializations = Array.from(
    new Set(
      programs
        .map((p) =>
          typeof p.specializationId !== "string" ? p.specializationId?.name : null
        )
        .filter(Boolean)
    )
  );

  const degreeType =
    typeof course.degreeTypeId !== "string" ? course.degreeTypeId : null;
  const provider =
    typeof firstProgram.providerId !== "string" ? firstProgram.providerId : null;

  const heroDescription =
    course.shortDescription ||
    course.description ||
    firstProgram.shortDescription ||
    `Master the essentials of ${course.name} with our comprehensive online programs. Gain industry-relevant skills and advance your career with top-tier university credentials.`;

  const programFeeValue = course.feeStarting
    ? `₹${course.feeStarting.toLocaleString()}`
    : firstProgram.discountedFees
      ? `₹${firstProgram.discountedFees.toLocaleString()}`
      : firstProgram.fees
        ? `₹${firstProgram.fees.toLocaleString()}`
        : "₹1,20,000";

  const durationValue = course.duration || firstProgram.duration || "24 Months";

  const recognitionValue =
    course.approvals?.[0] || provider?.approvals?.[0]?.name || "UGC Approved";

  const avgSalaryValue =
    course.careerStats?.avgCTC ||
    (provider?.comparison?.averageSalary
      ? `₹${provider.comparison.averageSalary} LPA`
      : "₹8.5 LPA");

  const highlights =
    course.highlights && course.highlights.length > 0
      ? course.highlights.map((h) => ({
        title: h.title || "",
        desc: h.description || "",
        iconName: h.icon,
      }))
      : [
        {
          title: "Live Interactive Classes",
          desc: "Attend live sessions with industry experts and faculty",
          iconName: "Video",
        },
        {
          title: "Industry-Relevant Curriculum",
          desc: "Updated syllabus aligned with current market needs",
          iconName: "FileText",
        },
        {
          title: "Global Peer Network",
          desc: "Connect with professionals from diverse backgrounds",
          iconName: "Users",
        },
        {
          title: "Recognized Certification",
          desc: "Degree equivalent to on-campus programs",
          iconName: "Award",
        },
        {
          title: "Career Support",
          desc: "Placement assistance and career counseling",
          iconName: "Briefcase",
        },
        {
          title: "Lifetime Access",
          desc: "Access to learning materials even after completion",
          iconName: "Download",
        },
      ];

  const eligibilityItems =
    course.eligibilityCriteria && course.eligibilityCriteria.length > 0
      ? course.eligibilityCriteria.map((item) => ({
        title: item.title || "",
        points: item.points || [],
      }))
      : [
        {
          title: "Educational Qualification",
          points: [
            firstProgram.eligibility ||
            "Bachelor's degree from a recognized university",
            `This is a ${degreeType?.name || "Academic"} level program`,
            `Designed for ${degreeType?.name === "Post Graduate"
              ? "graduates"
              : "professionals"
            }`,
          ],
        },
        {
          title: "Work Experience",
          points: [
            "No prior work experience is mandatory",
            "Preference given to professionals with 2+ years of exposure",
            "Relevant industry experience is an advantage",
          ],
        },
        {
          title: "Entrance Exam",
          points: [
            firstProgram.examPattern ||
            "CAT / MAT / XAT / CMAT scores accepted",
            "University entrance exam may be required",
            "Valid scores are mandatory for admission",
          ],
        },
      ];

  const curriculum =
    course.curriculum && course.curriculum.length > 0
      ? course.curriculum.map((c, i) => ({
        semester: c.semester || `Semester ${i + 1}`,
        subjects:
          c.subjects && c.subjects.length > 0 ? c.subjects : ["Coming soon"],
      }))
      : [1, 2, 3, 4].map((sem) => ({
        semester: `Semester ${sem}`,
        subjects: [
          "Core Foundations",
          "Advanced Strategies",
          "Elective Specialization",
          "Project & Case Study",
        ],
      }));

  const careerRoles =
    course.careerRoles && course.careerRoles.length > 0
      ? course.careerRoles
      : [
        "Project Manager",
        "Team Lead",
        "Consultant",
        "Product Owner",
        "Operations Head",
        "Strategy Planner",
        "Business Analyst",
        "Resource Manager",
      ];

  const salaryGrowth =
    course.careerStats?.salaryGrowth && course.careerStats.salaryGrowth.length > 0
      ? course.careerStats.salaryGrowth
      : [
        { year: "Year 1", value: 5 },
        { year: "Year 2", value: 7 },
        { year: "Year 3", value: 10 },
        { year: "Year 5", value: 18 },
      ];

  const placementPercentage = course.careerStats?.placementPercentage ?? 95;
  const placementStats = [
    { label: "Highest CTC", value: course.careerStats?.highCTC || "₹24 LPA" },
    { label: "Average CTC", value: course.careerStats?.avgCTC || "₹8.5 LPA" },
    {
      label: "Hiring Partners",
      value: course.careerStats?.hiringPartners || "150+",
    },
  ];

  const faqs =
    course.faqs && course.faqs.length > 0
      ? course.faqs.map((f) => ({
        question: f.question || "",
        answer: f.answer || "",
      }))
      : [
        {
          question: "Is this degree recognized globally?",
          answer:
            "Yes, the degree is recognized by major global accreditation bodies and employers worldwide.",
        },
        {
          question: "What is the total fee for the program?",
          answer: `The total program fee starts from ${programFeeValue}, with flexible EMI options available.`,
        },
        {
          question: "Are there any scholarship options?",
          answer:
            "Yes, merit-based and need-based scholarships are available for eligible candidates.",
        },
        {
          question: "What is the mode of examination?",
          answer:
            "Examinations are conducted online via a proctored system, allowing you to take them from home.",
        },
        {
          question: "Can I work while pursuing this course?",
          answer:
            "Absolutely. The flexible learning structure is designed for working professionals.",
        },
      ];

  // Chart geometry — improved with padding for axis labels
  const CHART_W = 480;
  const CHART_H = 220;
  const PAD_L = 48;
  const PAD_R = 24;
  const PAD_T = 24;
  const PAD_B = 36;
  const innerW = CHART_W - PAD_L - PAD_R;
  const innerH = CHART_H - PAD_T - PAD_B;

  const maxSalary = Math.max(...salaryGrowth.map((s) => s.value || 0), 1);
  const yTicks = 4;
  const yStep = Math.ceil(maxSalary / yTicks);
  const yMax = yStep * yTicks;

  const chartPoints = salaryGrowth.map((s, i) => {
    const x =
      salaryGrowth.length === 1
        ? PAD_L + innerW / 2
        : PAD_L + (i / (salaryGrowth.length - 1)) * innerW;
    const y = PAD_T + innerH - ((s.value || 0) / yMax) * innerH;
    return { x, y, year: s.year, value: s.value };
  });
  const chartPath = chartPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const areaPath =
    chartPoints.length > 0
      ? `${chartPath} L${chartPoints[chartPoints.length - 1].x},${PAD_T + innerH
      } L${chartPoints[0].x},${PAD_T + innerH} Z`
      : "";

  const breadcrumbItems: Breadcrumb[] = [
    { label: "Home", href: "/" },
    { label: "Online Courses", href: "/online-courses" },
    ...(degreeType
      ? [
        {
          label: degreeType.name,
          href: `/online-courses/${degreeType.slug}`,
        },
      ]
      : []),
    { label: course.name },
  ];

  const heroStats = [
    {
      label: "Program Fee",
      value: programFeeValue,
      footer: "EMI options available",
      icon: <IconCurrencyRupee className="w-5 h-5" stroke={2} />,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      border: "border-indigo-100",
    },
    {
      label: "Duration",
      value: durationValue,
      footer: "Flexible learning",
      icon: <IconClockCheck className="w-5 h-5" stroke={2} />,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "Recognition",
      value: recognitionValue,
      footer: "NAAC accredited",
      icon: <IconAward className="w-5 h-5" stroke={2} />,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Avg. Salary",
      value: avgSalaryValue,
      footer: "Post completion",
      icon: <IconBriefcase className="w-5 h-5" stroke={2} />,
      bg: "bg-rose-50",
      iconColor: "text-rose-600",
      border: "border-rose-100",
    },
  ];

  const courseUrl = `${SITE_URL}/course-detail?id=${id}`;
  const courseDesc = (
    course.shortDescription ||
    course.description ||
    `Online ${course.name} program${provider?.name ? ` at ${provider.name}` : ""}.`
  ).slice(0, 300);

  return (
    <main className="min-h-screen bg-gray-50/50 font-sans text-gray-900 overflow-x-hidden">
      <JsonLd
        data={courseSchema({
          name: course.name,
          description: courseDesc,
          url: courseUrl,
          providerName: provider?.name,
          providerUrl: provider?.slug ? `${SITE_URL}/universities/${provider.slug}` : undefined,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Online Courses", path: "/online-courses" },
          ...(degreeType?.slug
            ? [{ name: degreeType.name, path: `/online-courses/${degreeType.slug}` }]
            : []),
          { name: course.name, path: `/course-detail?id=${id}` },
        ])}
      />
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-6 md:pt-12 pb-10 md:pb-14">
          <Breadcrumbs items={breadcrumbItems} className="text-xs md:text-sm mb-6 md:mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              {degreeType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
                  <IconSparkles className="w-3.5 h-3.5" stroke={2.5} />
                  {degreeType.name}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                {course.name}
              </h1>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl">
                {heroDescription}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="#programs"
                  className="inline-flex items-center justify-center gap-2 bg-[#7C3AED] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#6D28D9] transition-all shadow-lg shadow-purple-200/60 active:scale-[0.98]"
                >
                  Explore Programs
                  <IconChevronRight className="w-4 h-4" stroke={2.5} />
                </Link>
                <Link
                  href="#talk-to-experts"
                  className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all"
                >
                  Talk to Counselor
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl blur-xl opacity-70" />
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3]">
                  <img
                    src={
                      course.icon ||
                      provider?.coverImage ||
                      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60"
                    }
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <img
                          key={i}
                          src={`https://i.pravatar.cc/40?u=${i}`}
                          alt="Student avatar"
                          aria-hidden="true"
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-white">
                      <p className="text-xs font-semibold opacity-90">
                        {programs.length}+ universities offering this course
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Highlights Row */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 -mt-6 md:-mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {heroStats.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl ${item.bg} ${item.iconColor} ${item.border} border flex items-center justify-center shrink-0`}
              >
                {item.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-900 leading-tight truncate">
                  {item.value}
                </p>
                <p className="text-[11px] md:text-xs text-gray-500 font-medium">
                  {item.footer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Program Highlights */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHeader
          icon={<IconSparkles className="w-5 h-5" stroke={2} />}
          title="Program Highlights"
          subtitle={`Our ${course.name} programs are designed to provide you with comprehensive education and practical skills needed to excel in your career.`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {highlights.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex items-start gap-4"
            >
              <div className="w-11 h-11 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <CourseIcon name={item.iconName} className="w-5 h-5" stroke={2} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Specializations */}
      {specializations.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <SectionHeader
            icon={<IconBook className="w-5 h-5" stroke={2} />}
            title="Available Specializations"
            subtitle="Choose from a wide range of specializations to align with your career goals and build expertise in the area that matters most to you."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {specializations.map((spec, i) => (
              <div
                key={i}
                className="bg-white p-4 md:p-5 rounded-2xl flex flex-col items-center gap-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all cursor-pointer text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <IconBook className="w-5 h-5" stroke={2} />
                </div>
                <span className="font-semibold text-gray-800 text-sm leading-snug">
                  {spec}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Eligibility Criteria */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHeader
          icon={<IconCircleCheckFilled className="w-5 h-5" />}
          title="Eligibility Criteria"
          subtitle="Check the requirements below to see if you qualify for this program. If you have questions, our counselors are here to help."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {eligibilityItems.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                <IconCircleCheckFilled className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-4">
                {item.title}
              </h4>
              <ul className="space-y-3">
                {item.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <IconArrowRight
                      className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0"
                      stroke={2.5}
                    />
                    <span className="text-gray-600 text-sm leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Course Curriculum */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHeader
          icon={<IconBook className="w-5 h-5" stroke={2} />}
          title="Curriculum Structure"
          subtitle="Comprehensive curriculum designed to provide in-depth knowledge and hands-on experience across all key domains."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {curriculum.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#7C3AED] text-white rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md shadow-purple-200">
                  S{idx + 1}
                </div>
                <h4 className="font-bold text-gray-900 text-sm md:text-base">
                  {item.semester}
                </h4>
              </div>
              <ul className="space-y-2.5">
                {item.subjects.map((sub, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2.5 text-sm text-gray-600"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <span className="leading-snug">{sub}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Talk to Expert Section */}
      <section id="talk-to-experts" className="bg-white border-y border-gray-100">
        <TalkToExperts />
      </section>

      {/* Career Roles */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHeader
          icon={<IconBriefcase className="w-5 h-5" stroke={2} />}
          title="Potential Career Roles"
          subtitle={`Top roles graduates of ${course.name} programs commonly pursue after completing the course.`}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {careerRoles.map((role, i) => (
            <div
              key={i}
              className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-gray-400 rounded-xl flex items-center justify-center transition-all shrink-0">
                <IconBriefcase className="w-5 h-5" stroke={2} />
              </div>
              <h4 className="font-semibold text-gray-800 text-sm leading-snug">
                {role}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* Salary Growth & Placement */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          {/* Salary Growth */}
          <div className="bg-white rounded-2xl p-5 md:p-7 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <IconChartLine className="w-5 h-5" stroke={2} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Average Salary Growth
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                  After completing {course.name}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl p-3 md:p-4 border border-gray-100">
              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                className="w-full h-auto"
                role="img"
                aria-label="Salary growth chart"
              >
                <defs>
                  <linearGradient id="salaryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Y-axis grid lines & labels */}
                {Array.from({ length: yTicks + 1 }).map((_, i) => {
                  const y = PAD_T + (i / yTicks) * innerH;
                  const value = yMax - i * yStep;
                  return (
                    <g key={i}>
                      <line
                        x1={PAD_L}
                        y1={y}
                        x2={CHART_W - PAD_R}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                        strokeDasharray={i === yTicks ? "0" : "3 3"}
                      />
                      <text
                        x={PAD_L - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-gray-400"
                        fontSize="10"
                        fontWeight="600"
                      >
                        ₹{value}L
                      </text>
                    </g>
                  );
                })}
                {/* Area + line */}
                {areaPath && <path d={areaPath} fill="url(#salaryFill)" />}
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartPoints.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" />
                    <text
                      x={p.x}
                      y={p.y - 12}
                      textAnchor="middle"
                      className="fill-gray-700"
                      fontSize="10"
                      fontWeight="700"
                    >
                      ₹{p.value}L
                    </text>
                    <text
                      x={p.x}
                      y={CHART_H - 10}
                      textAnchor="middle"
                      className="fill-gray-500"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {p.year}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Placement Stats */}
          <div className="bg-white rounded-2xl p-5 md:p-7 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                <IconTrendingUp className="w-5 h-5" stroke={2} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Placement Highlights
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                  Outcomes from recent batches
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
              <div className="w-36 h-36 md:w-40 md:h-40 relative shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="3"
                  />
                  <path
                    strokeDasharray={`${placementPercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-none">
                    {placementPercentage}%
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
                    Placement
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-3">
                {placementStats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <span className="text-xs md:text-sm font-semibold text-gray-500">
                      {stat.label}
                    </span>
                    <span className="text-sm md:text-base font-extrabold text-gray-900">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Programs (Comparison) */}
      <section id="programs" className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16 scroll-mt-16">
        <SectionHeader
          icon={<IconBuildingBank className="w-5 h-5" stroke={2} />}
          title={`Top Programs Offering ${course.name}`}
          subtitle="Compare universities offering this course and choose the program that fits your goals and budget."
        />

        {/* Mobile cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
          {programs.map((program) => {
            const p_provider =
              typeof program.providerId !== "string" ? program.providerId : null;
            const fee = program.discountedFees || program.fees;
            const isSelected = selectedProgramId === program._id;
            return (
              <div
                key={program._id}
                className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col gap-4 ${isSelected
                    ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/20"
                    : "border-gray-100"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 p-1.5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {p_provider?.logo ? (
                      <img
                        src={p_provider.logo}
                        alt={p_provider.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <IconBuildingBank className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                    {p_provider?.name || "Provider"}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Fees
                    </p>
                    <p className="text-base font-extrabold text-gray-900">
                      ₹{fee.toLocaleString()}
                    </p>
                    {program.discountedFees &&
                      program.discountedFees < program.fees && (
                        <p className="text-[10px] text-gray-400 line-through font-medium mt-0.5">
                          ₹{program.fees.toLocaleString()}
                        </p>
                      )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Eligibility
                    </p>
                    <p className="text-xs font-semibold text-gray-700 leading-snug line-clamp-2">
                      {program.eligibility || "Graduation"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/universities/${p_provider?.slug || ""}`}
                  className="bg-[#7C3AED] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#6D28D9] transition-all flex items-center justify-center gap-1.5"
                >
                  View Program
                  <IconExternalLink className="w-4 h-4" stroke={2.5} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">
                  University
                </th>
                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Fees
                </th>
                <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Eligibility
                </th>
                <th className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program, idx) => {
                const p_provider =
                  typeof program.providerId !== "string"
                    ? program.providerId
                    : null;
                const isSelected = selectedProgramId === program._id;
                return (
                  <tr
                    key={program._id}
                    className={`border-b border-gray-50 last:border-0 transition-colors ${isSelected ? "bg-indigo-50/60" : "hover:bg-indigo-50/30"
                      }`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white rounded-xl border border-gray-100 p-1.5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {p_provider?.logo ? (
                            <img
                              src={p_provider.logo}
                              alt={p_provider.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <IconBuildingBank className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className="font-bold text-sm text-gray-900">
                          {p_provider?.name || "Provider"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-extrabold text-gray-900 text-sm">
                        ₹
                        {(
                          program.discountedFees || program.fees
                        ).toLocaleString()}
                      </div>
                      {program.discountedFees &&
                        program.discountedFees < program.fees && (
                          <div className="text-xs text-gray-400 line-through font-medium">
                            ₹{program.fees.toLocaleString()}
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 max-w-[260px] leading-snug">
                      {program.eligibility || "Graduation"}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Link
                        href={`/universities/${p_provider?.slug || ""}`}
                        className="inline-flex items-center gap-1.5 bg-[#7C3AED] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:bg-[#6D28D9] active:scale-[0.97]"
                      >
                        View Program
                        <IconExternalLink className="w-3.5 h-3.5" stroke={2.5} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHeader
          icon={<IconUsersGroup className="w-5 h-5" stroke={2} />}
          title="What Our Students Say"
          subtitle="Hear from learners who have transformed their careers with our programs."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white p-6 md:p-7 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <IconStarFilled
                    key={s}
                    className="w-4 h-4 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 italic">
                "The online {course.name} program exceeded my expectations. The
                curriculum was practical, and the faculty was incredibly
                supportive throughout the journey."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                  <img
                    src={`https://i.pravatar.cc/150?u=${item}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-gray-900 text-sm">
                    Alumni {item}
                  </h5>
                  <p className="text-xs text-gray-500 font-medium">
                    {course.name} Graduate
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionHeader
          icon={<IconQuestionMark className="w-5 h-5" stroke={2.5} />}
          title="Frequently Asked Questions"
          subtitle="Got questions? We've got answers. Reach out if you need more details."
        />

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all open:shadow-md group"
            >
              <summary className="flex items-center justify-between gap-4 list-none cursor-pointer p-5 md:p-6">
                <span className="font-semibold text-sm md:text-base text-gray-900 leading-snug">
                  {faq.question}
                </span>
                <span className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-indigo-50 group-open:bg-[#7C3AED] flex items-center justify-center text-gray-500 group-open:text-white transition-all shrink-0">
                  <IconPlus
                    className="w-4 h-4 group-open:rotate-45 transition-transform"
                    stroke={2.5}
                  />
                </span>
              </summary>
              {faq.answer && (
                <div className="px-5 md:px-6 pb-5 md:pb-6 -mt-1">
                  <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pb-16 md:pb-20">
        <div className="relative bg-gradient-to-br from-[#9810FA] to-[#4F39F6] rounded-3xl p-8 md:p-14 lg:p-16 text-center overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur text-white rounded-full text-xs font-bold border border-white/20 mb-5">
              <IconSparkles className="w-3.5 h-3.5" stroke={2.5} />
              Limited Seats Available
            </span>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Ready to Transform Your Career?
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-8 max-w-xl mx-auto font-medium">
              Join thousands of students who have already started their journey
              with {course.name}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link
                href="#talk-to-experts"
                className="bg-white/10 backdrop-blur border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-white/20"
              >
                Talk to Counselor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
