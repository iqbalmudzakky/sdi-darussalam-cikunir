import type { Metadata } from "next";

import About from "@/components/sections/About";
import Activity from "@/components/sections/Activity";
import Contact from "@/components/sections/Contact";
import Facility from "@/components/sections/Facility";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Navbar from "@/components/sections/Navbar";
import Program from "@/components/sections/Program";
import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import { getSiteUrl } from "@/lib/site";

const SITE_TITLE =
  "SDI Darussalam Cikunir — Sekolah Dasar Islam Unggulan di Bekasi Selatan";
const SITE_DESCRIPTION_FALLBACK =
  "SDI Darussalam Cikunir adalah Sekolah Dasar Islam unggulan di Jaka Setia, Bekasi Selatan, yang membentuk generasi cerdas dan berakhlakulkarimah. Info pendaftaran, program, fasilitas, dan kegiatan sekolah.";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getSchoolProfile();
  const siteUrl = getSiteUrl();
  const description = profile.description || SITE_DESCRIPTION_FALLBACK;
  const ogImage = profile.photo_url || "/logo.png";

  return {
    title: SITE_TITLE,
    description,
    keywords: [
      "SDI Darussalam Cikunir",
      "Sekolah Dasar Islam Bekasi",
      "SD Islam Bekasi Selatan",
      "SD Islam Jaka Setia",
      "sekolah dasar islam unggulan",
      "pendaftaran SD Islam Bekasi",
    ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      title: SITE_TITLE,
      description,
      url: siteUrl,
      siteName: "SDI Darussalam Cikunir",
      locale: "id_ID",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "SDI Darussalam Cikunir",
        },
      ],
    },
  };
}

export default async function Home() {
  const profile = await getSchoolProfile();
  const siteUrl = getSiteUrl();

  const sameAs = [
    profile.facebook,
    profile.instagram,
    profile.tiktok,
    profile.youtube,
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElementarySchool",
    name: "SDI Darussalam Cikunir",
    description: profile.description || SITE_DESCRIPTION_FALLBACK,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: profile.photo_url || `${siteUrl}/logo.png`,
    telephone: profile.telepon || undefined,
    email: profile.email || undefined,
    address: profile.alamat
      ? {
          "@type": "PostalAddress",
          streetAddress: profile.alamat,
        }
      : undefined,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <About />

      {/* Program Section */}
      <Program />

      {/* Facility Section */}
      <Facility />

      {/* Activity Section */}
      <Activity />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />
    </div>
  );
}
