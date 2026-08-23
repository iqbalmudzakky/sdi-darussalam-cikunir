import { ArrowRight } from "lucide-react";
import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import { buildWhatsAppLink } from "@/lib/social/whatsapp";
import RegistrationDialog from "@/components/sections/RegistrationDialog";
import { WhatsappIcon } from "@/components/icons/SocialIcons";

export default async function Contact() {
  const profile = await getSchoolProfile();

  const whatsappLink = profile.whatsapp
    ? buildWhatsAppLink(profile.whatsapp, profile.whatsapp_message ?? undefined)
    : null;

  return (
    <section id="kontak" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="border border-brand-100 bg-brand-50/60 px-6 py-14 text-center sm:px-12 sm:py-16">
          <p className="text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase">
            Penerimaan siswa baru
          </p>

          <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl leading-tight font-semibold text-balance text-ink-900 sm:text-[2.5rem]">
            Ingin mendaftarkan putra-putri Anda?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-ink-700">
            Isi formulir pendaftaran atau hubungi kami langsung lewat WhatsApp.
            Tim kami akan menghubungi Anda kembali.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <RegistrationDialog
              variant="primary"
              className="w-full px-7 sm:w-auto"
            >
              Isi formulir pendaftaran
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </RegistrationDialog>

            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex w-full cursor-pointer items-center
                  justify-center gap-2
                  border border-brand-300 px-7 py-3.5
                  font-medium text-brand-700
                  transition-colors
                  hover:border-brand-500 hover:bg-white
                  sm:w-auto
                "
              >
                <WhatsappIcon className="h-4 w-4" />
                Tanya lewat WhatsApp
              </a>
            )}
          </div>

          {profile.jam_operasional && (
            <p className="mt-8 text-sm whitespace-pre-line text-ink-500">
              {profile.jam_operasional}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
