"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { buildWhatsAppLink } from "@/lib/social/whatsapp";
import {
  WhatsappIcon,
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";

type ContactSocialLinksProps = {
  whatsapp?: string | null;
  whatsappMessage?: string | null;
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

export default function ContactSocialLinks({
  whatsapp,
  whatsappMessage,
  facebook,
  instagram,
  tiktok,
  youtube,
}: ContactSocialLinksProps) {
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

  if (whatsapp) {
    socialLinks.push({
      url: buildWhatsAppLink(whatsapp, whatsappMessage ?? undefined),
      label: "WhatsApp",
      icon: <WhatsappIcon className="h-6 w-6" />,
    });
  }

  if (facebook) {
    socialLinks.push({
      url: facebook,
      label: "Facebook",
      icon: <FacebookIcon className="h-6 w-6" />,
    });
  }

  if (instagram) {
    socialLinks.push({
      url: instagram,
      label: "Instagram",
      icon: <InstagramIcon className="h-6 w-6" />,
    });
  }

  if (tiktok) {
    socialLinks.push({
      url: tiktok,
      label: "TikTok",
      icon: <TiktokIcon className="h-6 w-6" />,
    });
  }

  if (youtube) {
    socialLinks.push({
      url: youtube,
      label: "YouTube",
      icon: <YoutubeIcon className="h-6 w-6" />,
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

      const shouldBeActive =
        rect.bottom > 0 &&
        rect.top < viewportHeight &&
        distanceFromCenter <= centerTolerance;

      setIsCenterActive((current) =>
        current === shouldBeActive ? current : shouldBeActive,
      );

      animationFrameRef.current = null;
    };

    const requestUpdate = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current =
        window.requestAnimationFrame(updateCenterState);
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
