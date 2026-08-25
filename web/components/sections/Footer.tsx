import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import ContactSocialLinks from "@/components/sections/ContactSocialLinks";
import Reveal from "@/components/sections/Reveal";

const NAV_LINKS = [
  { href: "#tentang", label: "Tentang" },
  { href: "#program", label: "Program" },
  { href: "#fasilitas", label: "Fasilitas" },
  { href: "#visi-misi", label: "Visi & Misi" },
  { href: "#kegiatan", label: "Kegiatan" },
  { href: "#kontak", label: "Pendaftaran" },
];

type FooterDetailProps = {
  label: string;
  value?: string | null;
  href?: string;
  preserveLineBreaks?: boolean;
};

function FooterDetail({ label, value, href, preserveLineBreaks }: FooterDetailProps) {
  if (!value) return null;

  const body = (
    <span
      className={`
        text-sm leading-relaxed text-brand-100
        [overflow-wrap:anywhere]
        ${preserveLineBreaks ? "whitespace-pre-line" : ""}
      `}
    >
      {value}
    </span>
  );

  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium tracking-[0.18em] text-brand-300 uppercase">{label}</dt>

      <dd className="mt-1.5">
        {href ? (
          <a href={href} className="cursor-pointer transition-colors hover:text-white">
            {body}
          </a>
        ) : (
          body
        )}
      </dd>
    </div>
  );
}

export default async function Footer() {
  const profile = await getSchoolProfile();

  return (
    <footer className="bg-brand-900 text-brand-100">
      <div className="page-container py-16 sm:py-20">
        <Reveal className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr] lg:gap-16">
          {/* Identitas sekolah */}
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" aria-hidden="true" className="h-10 w-10 object-contain" />

              <p className="font-display text-lg font-semibold text-white">SD Islam Darussalam Cikunir</p>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-200">Sekolah dasar Islam di Jaka Mulya, Bekasi Selatan. Terakreditasi A.</p>

            <ContactSocialLinks whatsapp={profile.whatsapp} whatsappMessage={profile.whatsapp_message} facebook={profile.facebook} instagram={profile.instagram} tiktok={profile.tiktok} youtube={profile.youtube} />
          </div>

          {/* Navigasi */}
          <nav className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.18em] text-brand-300 uppercase">Halaman</p>

            {/*
              Dua kolom selama footer masih sempit, supaya
              daftar tautan tidak memanjang ke bawah.
            */}
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1 sm:gap-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="min-w-0">
                  <a href={link.href} className="cursor-pointer text-sm text-brand-100 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontak lengkap */}
          <dl className="min-w-0 space-y-5">
            <FooterDetail label="Alamat" value={profile.alamat} preserveLineBreaks />

            <FooterDetail label="Telepon" value={profile.telepon} href={profile.telepon ? `tel:${profile.telepon.replace(/\s/g, "")}` : undefined} />

            <FooterDetail label="Email" value={profile.email} href={profile.email ? `mailto:${profile.email}` : undefined} />

            <FooterDetail label="Jam operasional" value={profile.jam_operasional} preserveLineBreaks />
          </dl>
        </Reveal>

        <div className="mt-14 border-t border-brand-800 pt-6">
          <p className="text-xs text-brand-300">&copy; {new Date().getFullYear()} SD Islam Darussalam Cikunir</p>
        </div>
      </div>
    </footer>
  );
}
