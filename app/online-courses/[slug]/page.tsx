import React from "react";
import type { Metadata } from "next";
import { getDegreeTypes, getCourses } from "@/app/lib/api";
import SpecificDegreePage from "@/app/components/pages/onlineCoursesPage/SpecificDegreePage";
import { notFound } from "next/navigation";
import { JsonLd, courseSchema, breadcrumbSchema } from "@/app/lib/jsonld";

export const revalidate = 300;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://collegeprogram.in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const degreeTypes = await getDegreeTypes();
  const degreeType = degreeTypes.find((t: any) => t.slug === slug);

  if (!degreeType) return { title: "Degree Not Found" };

  const title = `Online ${degreeType.name} Courses — Top Programs & Universities`;
  const description = `Explore all online ${degreeType.name} programs from top universities. Compare fees, duration, and rankings to find the best course for your career.`;
  const canonical = `${SITE_URL}/online-courses/${degreeType.slug}`;

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function OnlineCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let degreeTypes = [];
  let courses = [];

  try {
    [degreeTypes, courses] = await Promise.all([getDegreeTypes(), getCourses()]);
  } catch (err) {
    console.error("Failed to load course data:", err);
  }

  const degreeType = degreeTypes.find((t: any) => t.slug === slug);

  if (!degreeType) {
    notFound();
  }

  const url = `${SITE_URL}/online-courses/${degreeType.slug}`;

  return (
    <>
      <JsonLd
        data={courseSchema({
          name: `Online ${degreeType.name}`,
          description: `Online ${degreeType.name} programs from top universities, with details on fees, duration, and admissions.`,
          url,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Online Courses", path: "/online-courses" },
          { name: degreeType.name, path: `/online-courses/${degreeType.slug}` },
        ])}
      />
      <SpecificDegreePage
        degreeType={degreeType}
        allDegreeTypes={degreeTypes}
        courses={courses}
      />
    </>
  );
}
