"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { RegistrationFormDialog, RegistrationTrigger } from "@/components/sections/RegistrationDialog";

const NAV_LINKS = [
  { href: "#tentang", label: "Tentang" },
  { href: "#program", label: "Program" },
  { href: "#fasilitas", label: "Fasilitas" },
  { href: "#kegiatan", label: "Kegiatan" },
  { href: "#kontak", label: "Kontak" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /*
   * State dialog dipegang di sini, bukan di dalam panel menu.
   *
   * Panel mobile dilepas dari DOM begitu menu ditutup, jadi
   * dialog yang tinggal di dalamnya ikut hilang sebelum
   * sempat terbuka.
   */
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  /*
   * Di puncak halaman navbar menyatu dengan hero.
   * Setelah user scroll, baru garis bawah muncul.
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /*
   * Selama menu terbuka, halaman di belakangnya dikunci
   * supaya tidak ikut bergeser saat user menggulir menu.
   *
   * Ketika dialog pendaftaran ikut terbuka, penguncian
   * diserahkan sepenuhnya ke dialog. Kalau keduanya
   * mengunci body, cleanup menu bisa membuka kembali
   * kunci yang masih dibutuhkan dialog.
   */
  useEffect(() => {
    if (!isMenuOpen || isRegistrationOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen, isRegistrationOpen]);

  /*
   * Escape menutup menu, sama seperti dialog lain
   * di halaman ini.
   */
  useEffect(() => {
    /*
     * Saat dialog terbuka, Escape adalah miliknya.
     * Menu tidak ikut menanggapi supaya satu tekanan
     * tidak menutup dua lapisan sekaligus.
     */
    if (!isMenuOpen || isRegistrationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, isRegistrationOpen]);

  return (
    <nav
      className={`
        fixed inset-x-0 top-0 z-50
        transition-colors duration-300

        ${isScrolled || isMenuOpen ? "border-b border-brand-100 bg-paper/90 backdrop-blur-md" : "border-b border-transparent bg-transparent"}
      `}
    >
      <div className="page-container relative z-10">
        <div className="flex h-16 items-center justify-between sm:h-[72px]">
          {/* Logo + identitas sekolah */}
          <a href="#" className="flex min-w-0 cursor-pointer items-center gap-3" onClick={() => setIsMenuOpen(false)}>
            <img src="/logo.png" alt="Logo SD Islam Darussalam Cikunir" className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10" />

            <div className="min-w-0">
              <p className="font-display truncate text-[15px] leading-tight font-semibold text-ink-900 sm:text-base">SD Islam Darussalam Cikunir</p>

              <p className="mt-0.5 truncate text-[11px] leading-tight tracking-wide text-ink-500 uppercase">Jaka Mulya, Bekasi Selatan</p>
            </div>
          </a>

          {/* Navigasi desktop */}
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="
                  cursor-pointer text-[15px] text-ink-700
                  transition-colors
                  hover:text-brand-600
                "
              >
                {link.label}
              </a>
            ))}

            <RegistrationTrigger variant="compact" onClick={() => setIsRegistrationOpen(true)}>
              Pendaftaran
            </RegistrationTrigger>
          </div>

          {/*
            Tombol menu mobile.

            Ikonnya digambar dari tiga garis sungguhan supaya
            bisa berubah bentuk menjadi tanda silang, bukan
            bertukar ikon secara mendadak.
          */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="
              -mr-1.5 flex h-11 w-11 shrink-0 cursor-pointer
              items-center justify-center
              rounded-md text-ink-900

              transition-colors
              hover:bg-brand-50

              md:hidden
            "
          >
            <span className="relative block h-4 w-6" aria-hidden="true">
              <span
                className={`
                  absolute left-0 block h-[1.5px] w-6 rounded-full bg-current
                  transition-transform duration-300 ease-out

                  ${isMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}
                `}
              />

              <span
                className={`
                  absolute top-1/2 left-0 block h-[1.5px] w-6 -translate-y-1/2
                  rounded-full bg-current
                  transition-opacity duration-200 ease-out

                  ${isMenuOpen ? "opacity-0" : "opacity-100"}
                `}
              />

              <span
                className={`
                  absolute left-0 block h-[1.5px] rounded-full bg-current
                  transition-[transform,width] duration-300 ease-out

                  ${isMenuOpen ? "top-1/2 w-6 -translate-y-1/2 -rotate-45" : "bottom-0 w-4"}
                `}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Navigasi mobile */}
      {isMenuOpen && (
        <>
          {/*
            Latar gelap menutupi halaman di belakang menu,
            sekaligus menjadi area tap untuk menutup.
          */}
          <button type="button" aria-label="Tutup menu" onClick={() => setIsMenuOpen(false)} className="mobile-menu-backdrop fixed inset-0 top-16 z-0 cursor-default bg-ink-900/30 backdrop-blur-[2px] sm:top-[72px] md:hidden" />

          <div id="mobile-navigation" className="mobile-menu-panel relative z-10 border-t border-brand-100 bg-paper shadow-sm md:hidden">
            <div className="page-container pt-2 pb-6">
              <ul>
                {NAV_LINKS.map((link, index) => (
                  <li key={link.href} className="mobile-menu-item" style={{ animationDelay: `${60 + index * 45}ms` }}>
                    <a
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="
                        group flex cursor-pointer items-center justify-between
                        border-b border-brand-100/80 py-4

                        text-[17px] text-ink-800
                        transition-colors
                        hover:text-brand-700
                      "
                    >
                      <span className="font-display font-medium">{link.label}</span>

                      <ArrowUpRight
                        className="
                          h-4 w-4 text-brand-300
                          transition-[color,transform] duration-200 ease-out
                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                          group-hover:text-brand-600
                        "
                      />
                    </a>
                  </li>
                ))}
              </ul>

              <div
                className="mobile-menu-item mt-6"
                style={{
                  animationDelay: `${60 + NAV_LINKS.length * 45}ms`,
                }}
              >
                <RegistrationTrigger
                  variant="block"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsRegistrationOpen(true);
                  }}
                >
                  Pendaftaran
                </RegistrationTrigger>

                <p className="mt-3 text-center text-xs text-ink-500">Penerimaan siswa baru tahun ajaran 2026/2027</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/*
        Dialog berada di luar panel menu supaya tetap hidup
        ketika menu mobile ditutup.
      */}
      <RegistrationFormDialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen} />
    </nav>
  );
}
