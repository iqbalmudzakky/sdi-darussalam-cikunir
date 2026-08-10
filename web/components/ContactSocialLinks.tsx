"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ContactSocialLinksProps = {
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
};

type SocialLink = {
  url: string;
  label: string;
  icon: ReactNode;
};

export default function ContactSocialLinks({ facebook, instagram, tiktok, youtube }: ContactSocialLinksProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /*
   * Saat area "Ikuti Kami" berada di tengah
   * layar mobile, state hover desktop diterapkan
   * secara otomatis.
   */
  const [isCenterActive, setIsCenterActive] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const socialLinks: SocialLink[] = [];

  if (facebook) {
    socialLinks.push({
      url: facebook,
      label: "Facebook",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.25c0-1.01.28-1.7 1.75-1.7H17V2.4c-.3-.04-1.34-.13-2.55-.13-2.52 0-4.25 1.54-4.25 4.37V9.5H7.35V13h2.85v9h3.3z" />
        </svg>
      ),
    });
  }

  if (instagram) {
    socialLinks.push({
      url: instagram,
      label: "Instagram",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />

          <circle cx="12" cy="12" r="4" />

          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    });
  }

  if (tiktok) {
    socialLinks.push({
      url: tiktok,
      label: "TikTok",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.6 2c.3 1.8 1.3 3.2 2.8 4.2 1 .7 2.1 1.1 3.6 1.2v3.3c-2.4.1-4.6-.7-6.4-2.1v7.1c0 4-3.2 7.3-7.2 7.3S1 19.8 1 15.8s3.3-7.3 7.3-7.3c.4 0 .9 0 1.3.1V12a4 4 0 0 0-1.3-.2 4 4 0 1 0 4 4V2h3.3z" />
        </svg>
      ),
    });
  }

  if (youtube) {
    socialLinks.push({
      url: youtube,
      label: "YouTube",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
        </svg>
      ),
    });
  }

  /*
   * Deteksi mobile berdasarkan breakpoint md.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateViewportMode = () => {
      const mobile = mediaQuery.matches;

      setIsMobile(mobile);

      if (!mobile) {
        setIsCenterActive(false);
      }
    };

    updateViewportMode();

    mediaQuery.addEventListener("change", updateViewportMode);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportMode);
    };
  }, []);

  /*
   * Mobile scroll hover.
   *
   * Saat area social media berada di sekitar
   * titik tengah viewport, tampilkan visual
   * yang sama dengan hover desktop.
   *
   * Ketika menjauh, warna kembali normal.
   */
  useEffect(() => {
    if (!isMobile || socialLinks.length === 0) {
      return;
    }

    const updateCenterState = () => {
      const element = containerRef.current;

      if (!element) {
        animationFrameRef.current = null;
        return;
      }

      const rect = element.getBoundingClientRect();

      const viewportHeight = window.innerHeight;
      const viewportCenterY = viewportHeight / 2;

      const elementCenterY = rect.top + rect.height / 2;

      const distanceFromCenter = Math.abs(elementCenterY - viewportCenterY);

      /*
       * Sama seperti pola Facility:
       * area harus benar-benar cukup dekat
       * dengan titik tengah layar.
       */
      const centerTolerance = Math.min(80, viewportHeight * 0.1);

      const shouldBeActive = rect.bottom > 0 && rect.top < viewportHeight && distanceFromCenter <= centerTolerance;

      setIsCenterActive((current) => (current === shouldBeActive ? current : shouldBeActive));

      animationFrameRef.current = null;
    };

    const requestUpdate = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(updateCenterState);
    };

    window.addEventListener("scroll", requestUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestUpdate);

    requestUpdate();

    return () => {
      window.removeEventListener("scroll", requestUpdate);

      window.removeEventListener("resize", requestUpdate);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMobile, socialLinks.length]);

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="pt-4 sm:pt-6">
      <h3 className="mb-4 font-bold text-gray-900">Ikuti Kami</h3>

      <div className="flex flex-wrap gap-3 sm:gap-4">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={`
              flex h-11 w-11
              items-center justify-center
              rounded-full

              text-emerald-600

              transition-colors
              duration-300
              ease-out

              sm:h-12
              sm:w-12

              md:bg-emerald-100
              md:hover:bg-emerald-200

              active:bg-emerald-200

              ${isMobile && isCenterActive ? "bg-emerald-200" : "bg-emerald-100"}
            `}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
