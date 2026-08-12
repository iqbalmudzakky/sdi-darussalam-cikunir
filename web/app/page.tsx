import type { Metadata } from "next";

import About from "@/components/About";
import Activity from "@/components/Activity";
import Contact from "@/components/Contact";
import Facility from "@/components/Facility";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Program from "@/components/Program";
import { getMetaSetting } from "@/modules/meta-setting/service";

const FALLBACK_METADATA: Metadata = {
  title: "SDI Darussalam Cikunir",
  description: "Situs resmi SDI Darussalam Cikunir",
  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/default-favicon.png",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const setting = await getMetaSetting();

    const ogTitle = setting.og_title || setting.meta_title;
    const ogDescription = setting.og_description || setting.meta_description;

    const twitterTitle = setting.twitter_title || setting.og_title || setting.meta_title;

    const twitterDescription = setting.twitter_description || setting.og_description || setting.meta_description;

    const twitterImage = setting.twitter_image_url || setting.og_image_url;

    return {
      title: setting.meta_title,
      description: setting.meta_description,

      keywords: setting.meta_keywords.length > 0 ? setting.meta_keywords : undefined,

      alternates: setting.canonical_url
        ? {
            canonical: setting.canonical_url,
          }
        : undefined,

      robots: {
        index: setting.robots_index,
        follow: setting.robots_follow,
      },

      icons: {
        icon: setting.favicon_url || "/default-favicon.png",
      },

      openGraph: {
        type: "website",
        title: ogTitle,
        description: ogDescription,
        url: setting.canonical_url || undefined,
        images: setting.og_image_url
          ? [
              {
                url: setting.og_image_url,
              },
            ]
          : undefined,
      },

      twitter: {
        card: twitterImage ? "summary_large_image" : "summary",
        title: twitterTitle,
        description: twitterDescription,
        images: twitterImage ? [twitterImage] : undefined,
      },
    };
  } catch (error) {
    console.error("Failed to generate landing page metadata:", error);

    return FALLBACK_METADATA;
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
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
