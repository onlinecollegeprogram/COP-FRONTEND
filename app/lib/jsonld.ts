import React from "react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://collegeprogram.in";

const absoluteUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

export function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  return React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    },
  });
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "CollegeProgram",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.webp`,
    },
    sameAs: [] as string[],
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "123 Education Hub, Sector 5",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        postalCode: "560001",
        addressCountry: "IN",
      },
      {
        "@type": "PostalAddress",
        streetAddress: "456 Tech Campus Drive",
        addressLocality: "San Francisco",
        addressRegion: "CA",
        postalCode: "94105",
        addressCountry: "US",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-80-1234-5678",
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+1-415-123-4567",
        contactType: "customer support",
        areaServed: "US",
        availableLanguage: ["en"],
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "CollegeProgram",
    description:
      "Online degree programs from top universities. Compare courses, fees, and rankings.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

type ProviderForSchema = {
  _id?: string;
  slug: string;
  name: string;
  shortExcerpt?: string | null;
  metaDescription?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  galleryImages?: { url?: string }[];
  averageRating?: number | null;
  reviewCount?: number | null;
  campuses?: { city?: string; state?: string; country?: string; address?: string }[];
};

export function collegeOrUniversitySchema(provider: ProviderForSchema) {
  const url = `${SITE_URL}/universities/${provider.slug}`;
  const images = [
    absoluteUrl(provider.logo),
    absoluteUrl(provider.coverImage),
    ...(provider.galleryImages || [])
      .map((g) => absoluteUrl(g?.url))
      .filter(Boolean),
  ].filter(Boolean);

  const schema: Record<string, JsonLdValue | undefined> = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": `${url}#org`,
    name: provider.name,
    url,
    description: provider.metaDescription || provider.shortExcerpt || undefined,
    logo: absoluteUrl(provider.logo),
    image: images.length ? (images as string[]) : undefined,
  };

  if (
    typeof provider.averageRating === "number" &&
    provider.averageRating > 0 &&
    typeof provider.reviewCount === "number" &&
    provider.reviewCount > 0
  ) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: provider.averageRating,
      reviewCount: provider.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const campuses = (provider.campuses || []).filter((c) => c?.city || c?.address);
  if (campuses.length) {
    schema.address = campuses.map((c) => ({
      "@type": "PostalAddress",
      streetAddress: c.address || undefined,
      addressLocality: c.city || undefined,
      addressRegion: c.state || undefined,
      addressCountry: c.country || undefined,
    }));
  }

  return schema;
}

export function courseSchema({
  name,
  description,
  url,
  providerName,
  providerUrl,
}: {
  name: string;
  description: string;
  url: string;
  providerName?: string;
  providerUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: providerName || "CollegeProgram",
      sameAs: providerUrl || SITE_URL,
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: i.answer,
      },
    })),
  };
}
