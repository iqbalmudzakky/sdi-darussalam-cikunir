import { getSchoolProfile } from "@/lib/data/schoolProfile";
import { RegistrationForm } from "@/components/RegistrationForm";
import ContactSocialLinks from "@/components/ContactSocialLinks";

export default async function Contact() {
  const profile = await getSchoolProfile();

  return (
    <section id="kontak" className="scroll-mt-20 bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-4xl text-center sm:mb-14 lg:mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Hubungi Kami</h2>

          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-emerald-500" />

          <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">Tertarik mendaftarkan putra-putri Anda? Hubungi kami untuk informasi lebih lanjut</p>
        </div>

        {/* Contact Content */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Contact Information */}
          <div className="min-w-0 space-y-7 sm:space-y-8">
            {/* Address */}
            <div className="flex min-w-0 gap-3 sm:gap-4">
              <div
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  rounded-2xl
                  bg-linear-to-br
                  from-emerald-500 to-teal-600

                  sm:h-14 sm:w-14
                "
              >
                <svg className="h-6 w-6 text-white sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-2 font-bold text-gray-900">Alamat</h3>

                <p
                  className="
                    whitespace-pre-line
                    break-words
                    text-sm leading-relaxed
                    text-gray-600
                    [overflow-wrap:anywhere]

                    sm:text-base
                  "
                >
                  {profile.alamat}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex min-w-0 gap-3 sm:gap-4">
              <div
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  rounded-2xl
                  bg-linear-to-br
                  from-emerald-500 to-teal-600

                  sm:h-14 sm:w-14
                "
              >
                <svg className="h-6 w-6 text-white sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-2 font-bold text-gray-900">Telepon</h3>

                <p
                  className="
                    break-words
                    text-sm text-gray-600
                    [overflow-wrap:anywhere]

                    sm:text-base
                  "
                >
                  {profile.telepon}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex min-w-0 gap-3 sm:gap-4">
              <div
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  rounded-2xl
                  bg-linear-to-br
                  from-emerald-500 to-teal-600

                  sm:h-14 sm:w-14
                "
              >
                <svg className="h-6 w-6 text-white sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-2 font-bold text-gray-900">Email</h3>

                <p
                  className="
                    break-words
                    text-sm text-gray-600
                    [overflow-wrap:anywhere]

                    sm:text-base
                  "
                >
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Operational Hours */}
            <div className="flex min-w-0 gap-3 sm:gap-4">
              <div
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  rounded-2xl
                  bg-linear-to-br
                  from-emerald-500 to-teal-600

                  sm:h-14 sm:w-14
                "
              >
                <svg className="h-6 w-6 text-white sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-2 font-bold text-gray-900">Jam Operasional</h3>

                <p
                  className="
                    whitespace-pre-line
                    break-words
                    text-sm leading-relaxed
                    text-gray-600
                    [overflow-wrap:anywhere]

                    sm:text-base
                  "
                >
                  {profile.jam_operasional}
                </p>
              </div>
            </div>

            {/* Social Media */}
            <ContactSocialLinks facebook={profile.facebook} instagram={profile.instagram} tiktok={profile.tiktok} youtube={profile.youtube} />
          </div>

          {/* Registration Form */}
          <div
            className="
              min-w-0
              rounded-3xl
              bg-linear-to-br
              from-emerald-50 to-teal-50
              p-5

              sm:p-6
              lg:p-8
            "
          >
            <h3 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">Formulir Pendaftaran Online</h3>

            <RegistrationForm />
          </div>
        </div>
      </div>
    </section>
  );
}
