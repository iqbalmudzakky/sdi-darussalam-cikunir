"use client";

import type { ReactNode } from "react";
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
  const socialLinks: SocialLink[] = [];

  if (whatsapp) {
    socialLinks.push({
      url: buildWhatsAppLink(whatsapp, whatsappMessage ?? undefined),
      label: "WhatsApp",
      icon: <WhatsappIcon className="h-5 w-5" />,
    });
  }

  if (facebook) {
    socialLinks.push({
      url: facebook,
      label: "Facebook",
      icon: <FacebookIcon className="h-5 w-5" />,
    });
  }

  if (instagram) {
    socialLinks.push({
      url: instagram,
      label: "Instagram",
      icon: <InstagramIcon className="h-5 w-5" />,
    });
  }

  if (tiktok) {
    socialLinks.push({
      url: tiktok,
      label: "TikTok",
      icon: <TiktokIcon className="h-5 w-5" />,
    });
  }

  if (youtube) {
    socialLinks.push({
      url: youtube,
      label: "YouTube",
      icon: <YoutubeIcon className="h-5 w-5" />,
    });
  }

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <p className="text-[11px] font-medium tracking-[0.18em] text-brand-300 uppercase">
        Media sosial
      </p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className="
              group inline-flex h-11 w-11 cursor-pointer
              items-center justify-center
              border border-brand-800 bg-brand-800/40 text-brand-200

              transition-[background-color,border-color,color,transform]
              duration-200 ease-out

              hover:-translate-y-0.5
              hover:border-white hover:bg-white hover:text-brand-900

              focus-visible:-translate-y-0.5
              focus-visible:border-white focus-visible:bg-white
              focus-visible:text-brand-900
              focus-visible:outline-none
            "
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
