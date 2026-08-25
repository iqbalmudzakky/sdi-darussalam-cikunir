import type { Metadata } from "next";

import About from "@/components/sections/About";
import Activity from "@/components/sections/Activity";
import Contact from "@/components/sections/Contact";
import Facility from "@/components/sections/Facility";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Navbar from "@/components/sections/Navbar";
import Program from "@/components/sections/Program";
import Vision from "@/components/sections/Vision";
import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import { getSiteUrl } from "@/lib/site";

const SITE_TITLE =
  "Yayasan Pembangunan Umat Islam Darussalam - Perguruan Islam Darussalam";
const SITE_NAME = "Yayasan Pembangunan Umat Islam Darussalam";
const SITE_DESCRIPTION_FALLBACK =
  "SDI Darussalam Cikunir merupakan lembaga pendidikan Islam yang berkomitmen untuk membentuk generasi Qur'ani yang cerdas, kreatif, dan berakhlakul karimah. Berlokasi strategis di Cikunir, Bekasi Selatan, dekat dengan Gerbang Tol Cikunir, sekolah kami mudah diakses dari berbagai wilayah. Dengan menggabungkan kurikulum nasional dan kurikulum madrasah diniyah, kami menghasilkan lulusan yang tidak hanya unggul secara akademis, tetapi juga memiliki pondasi keagamaan yang kuat dan karakter yang mulia.";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getSchoolProfile();
  const siteUrl = getSiteUrl();
  const description = profile.description || SITE_DESCRIPTION_FALLBACK;
  const ogImage = profile.photo_url || "/logo.png";

  return {
    title: SITE_TITLE,
    description,
    keywords: [
      "Yayasan Pembangunan Umat Islam Darussalam",
      "Perguruan Islam Darussalam",
      "SDI Darussalam Cikunir",
      "Sekolah Dasar Islam Bekasi",
      "SD Islam Bekasi Selatan",
      "SD Islam Jaka Mulya",
      "sekolah dasar islam unggulan",
      "pendaftaran SD Islam Bekasi",
    ],
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    /*
     * Canonical menunjuk ke akar situs. Halaman ini satu-satunya
     * halaman publik, jadi semua varian URL bermuara ke sini.
     */
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      title: SITE_TITLE,
      description,
      url: siteUrl,
      siteName: SITE_NAME,
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
    <div className="min-h-screen bg-paper">
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

      {/* Vision & Mission Section */}
      <Vision />

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
