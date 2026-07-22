import React from "react";
import type { Metadata } from "next";
import UniversityDetailPage from "@/app/components/pages/universityPage/UniversityDetailPage";
import { getProvider } from "@/app/lib/api";
import {
  JsonLd,
  collegeOrUniversitySchema,
  breadcrumbSchema,
} from "@/app/lib/jsonld";

export const revalidate = 300;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://collegeprogram.in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let provider: any = null;
  try {
    provider = await getProvider(slug);
  } catch {
    return { title: "University not found" };
  }

  if (!provider || provider.error) {
    return { title: "University not found" };
  }

  const title =
    provider.metaTitle ||
    `${provider.name} — Online Programs, Fees & Admissions`;
  const description =
    provider.metaDescription ||
    provider.shortExcerpt ||
    `Explore online courses, fees, rankings, and admissions at ${provider.name}.`;
  const canonical =
    provider.canonicalUrl || `${SITE_URL}/universities/${provider.slug}`;

  const ogTitle = provider.ogTitle || title;
  const ogDescription = provider.ogDescription || description;
  const ogImage =
    provider.ogImage || provider.coverImage || provider.logo || "/logo.webp";

  const twitterTitle = provider.twitterTitle || ogTitle;
  const twitterDescription = provider.twitterDescription || ogDescription;
  const twitterImage = provider.twitterImage || ogImage;

  return {
    title,
    description,
    keywords: provider.metaKeywords
      ? String(provider.metaKeywords)
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : undefined,
    alternates: { canonical },
    robots: provider.noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : undefined,
    openGraph: {
      type: "website",
      url: canonical,
      title: ogTitle,
      description: ogDescription,
      siteName: "CollegeProgram",
      images: [{ url: ogImage, alt: provider.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: [twitterImage],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let provider: any = null;
  try {
    provider = await getProvider(slug);
  } catch {
    provider = null;
  }

  return (
    <>
      {provider && !provider.error && (
        <>
          <JsonLd data={collegeOrUniversitySchema(provider)} />
          <JsonLd
            data={breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Universities", path: "/universities" },
              { name: provider.name, path: `/universities/${provider.slug}` },
            ])}
          />
        </>
      )}
      <UniversityDetailPage id={slug} />
    </>
  );
}
