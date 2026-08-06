"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#tentang", label: "Tentang" },
  { href: "#program", label: "Program" },
  { href: "#fasilitas", label: "Fasilitas" },
  { href: "#kegiatan", label: "Kegiatan" },
  { href: "#kontak", label: "Kontak" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">SD</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                SDI Darussalam Cikunir
              </h1>
              <p className="text-xs text-emerald-600">
                Kota Bekasi, Jawa Barat
              </p>
            </div>
          </div>
          <div className="hidden md:flex gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMenuOpen}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden flex flex-col gap-1 pb-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="px-2 py-2.5 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
