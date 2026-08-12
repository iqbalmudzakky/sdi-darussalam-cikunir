import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider, Toaster } from "@/components/ui/toast";
import { getSchoolProfile } from "@/lib/data/schoolProfile";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE =
  "SDI Darussalam Cikunir — Sekolah Dasar Islam Unggulan di Bekasi";
const SITE_DESCRIPTION_FALLBACK =
  "SDI Darussalam Cikunir adalah Sekolah Dasar Islam unggulan di Kota Bekasi yang membentuk generasi cerdas dan berakhlakulkarimah. Info pendaftaran, program, fasilitas, dan kegiatan sekolah.";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getSchoolProfile();
  const siteUrl = getSiteUrl();
  const description = profile.description || SITE_DESCRIPTION_FALLBACK;
  const ogImage = profile.photo_url || "/logo.png";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: SITE_TITLE,
      template: "%s | SDI Darussalam Cikunir",
    },
    description,
    keywords: [
      "SDI Darussalam Cikunir",
      "Sekolah Dasar Islam Bekasi",
      "SD Islam Bekasi Selatan",
      "SD Islam Jaka Setia",
      "sekolah dasar islam unggulan",
      "pendaftaran SD Islam Bekasi",
    ],
    icons: {
      icon: "/logo.png",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: SITE_TITLE,
      description,
      url: siteUrl,
      siteName: "SDI Darussalam Cikunir",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "SDI Darussalam Cikunir",
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description,
      images: [ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
