import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import Layout from "./components/pages/sections/Layout";
import { Toaster } from "react-hot-toast";
import SmoothScroll from "./components/providers/SmoothScroll";
import { JsonLd, organizationSchema, websiteSchema } from "./lib/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://collegeprogram.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CollegeProgram — Online Degrees from Top Universities",
    template: "%s | CollegeProgram",
  },
  description:
    "Discover online degree programs from top universities. Compare courses, fees, and rankings, and talk to expert counselors to find your perfect program.",
  keywords: [
    "online courses",
    "online degree",
    "online universities",
    "college programs",
    "distance learning",
    "MBA online",
    "online education",
    "compare universities",
  ],
  applicationName: "CollegeProgram",
  authors: [{ name: "CollegeProgram" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "CollegeProgram",
    title: "CollegeProgram — Online Degrees from Top Universities",
    description:
      "Discover online degree programs from top universities. Compare courses, fees, and rankings, and talk to expert counselors to find your perfect program.",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "CollegeProgram",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeProgram — Online Degrees from Top Universities",
    description:
      "Discover online degree programs from top universities. Compare courses, fees, and rankings, and talk to expert counselors.",
    images: ["/logo.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/favicon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },

};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
  preload: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${nunito.variable}`}
    >
      <head>
        {/* Hero <Image priority> in Hero.tsx auto-generates its own correctly-sized
            preload via /_next/image. Adding a manual preload here would download the
            full-resolution Margin.webp in addition to the optimized version,
            wasting bandwidth on the critical path. */}
        <link rel="dns-prefetch" href="https://encrypted-tbn0.gstatic.com" />
        <link rel="preconnect" href="https://upload.wikimedia.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.pinimg.com" />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <SmoothScroll>
            <Layout>
              {children}
            </Layout>
          </SmoothScroll>
        </Suspense>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

