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
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo + School Identity */}
          <a
            href="#"
            className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3"
            onClick={() => setIsMenuOpen(false)}
          >
            {/* Logo */}
            <img
              src="/logo.png"
              alt="Logo SDI Darussalam Cikunir"
              className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
            />

            {/* School Name + Location */}
            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-sm font-bold leading-tight
                  text-gray-900

                  sm:text-base
                "
              >
                SDI Darussalam Cikunir
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[10px] leading-tight
                  text-emerald-600

                  sm:text-xs
                "
              >
                Kota Bekasi, Jawa Barat
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="
                  font-medium text-gray-700
                  transition-colors
                  hover:text-emerald-600
                "
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="
              ml-3 flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-lg
              text-gray-700

              transition-colors

              hover:bg-emerald-50
              hover:text-emerald-600

              active:bg-emerald-100
              active:text-emerald-600

              md:hidden
            "
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-gray-100 bg-white shadow-lg md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="
                  rounded-xl px-3 py-3
                  font-medium text-gray-700

                  transition-colors

                  hover:bg-emerald-50
                  hover:text-emerald-600

                  active:bg-emerald-100
                  active:text-emerald-600
                "
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
