import type { MetadataRoute } from "next";
import { getProviders, getDegreeTypes } from "@/app/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://collegeprogram.in";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/online-courses", priority: 0.9, changeFrequency: "weekly" },
  { path: "/universities", priority: 0.9, changeFrequency: "weekly" },
  { path: "/explore-programs", priority: 0.8, changeFrequency: "weekly" },
  { path: "/compareUniversities", priority: 0.7, changeFrequency: "weekly" },
  { path: "/articles", priority: 0.7, changeFrequency: "weekly" },
  { path: "/talk-to-experts", priority: 0.6, changeFrequency: "monthly" },
  { path: "/search", priority: 0.4, changeFrequency: "monthly" },
  { path: "/disclaimer", priority: 0.2, changeFrequency: "yearly" },
  { path: "/our-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms-and-conditions", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let providerEntries: MetadataRoute.Sitemap = [];
  let degreeEntries: MetadataRoute.Sitemap = [];

  try {
    const providers = await getProviders();
    providerEntries = (Array.isArray(providers) ? providers : [])
      .filter((p: { slug?: string }) => p?.slug)
      .map((p: { slug: string; updatedAt?: string }) => ({
        url: `${SITE_URL}/universities/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.error("[sitemap] failed to load providers:", err);
  }

  try {
    const degreeTypes = await getDegreeTypes();
    degreeEntries = (Array.isArray(degreeTypes) ? degreeTypes : [])
      .filter((t: { slug?: string }) => t?.slug)
      .map((t: { slug: string; updatedAt?: string }) => ({
        url: `${SITE_URL}/online-courses/${t.slug}`,
        lastModified: t.updatedAt ? new Date(t.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.error("[sitemap] failed to load degree types:", err);
  }

  return [...staticEntries, ...providerEntries, ...degreeEntries];
}
