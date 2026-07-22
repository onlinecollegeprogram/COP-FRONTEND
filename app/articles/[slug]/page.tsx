import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleDetailPage from "@/app/components/pages/articles/ArticleDetail";
import { getBlogBySlug } from "@/app/lib/blogs";

export const revalidate = 300;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://collegeprogram.in";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogBySlug(slug);

  if (!result?.article) return {};

  const { title, tags, heroImage } = result.article;
  const description =
    tags.length > 0
      ? `${title} — ${tags.join(", ")}`
      : `${title} — expert insights on online education, programs, and career growth from CollegeProgram.`;
  const canonical = `${SITE_URL}/articles/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: "CollegeProgram",
      ...(heroImage ? { images: [{ url: heroImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(heroImage ? { images: [heroImage] } : {}),
    },
  };
}

export default async function ArticleDetailRoute({ params }: Props) {
  const { slug } = await params;
  const result = await getBlogBySlug(slug);

  if (!result?.article) notFound();

  return (
    <ArticleDetailPage
      article={result.article}
      relatedArticles={result.relatedArticles}
    />
  );
}
