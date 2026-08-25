import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ToastProvider, Toaster } from "@/components/ui/toast";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Yayasan Pembangunan Umat Islam Darussalam",
  description: "Situs resmi SD Islam Darussalam Cikunir"
  /*
   * Nilai bawaan untuk seluruh rute. Halaman publik menimpanya
   * lewat generateMetadata, sedangkan halaman admin cukup
   * mewarisi robots noindex di bawah ini.
   */
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${fraunces.variable} antialiased`}>
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
