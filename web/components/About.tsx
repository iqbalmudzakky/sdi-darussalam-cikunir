import { getSchoolProfile } from "@/lib/data/schoolProfile";

export default async function About() {
  const profile = await getSchoolProfile();

  const paragraphs = profile.description.split("\n\n").filter((paragraph) => paragraph.trim().length > 0);

  return (
    <section id="tentang" className="scroll-mt-20 bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 text-center sm:mb-14 lg:mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Tentang Kami</h2>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          {/* School Description */}
          <div className="min-w-0 space-y-5 sm:space-y-6">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="break-words text-justify text-base leading-relaxed text-gray-700 sm:text-lg">
                {paragraph}
              </p>
            ))}

            {/* Highlights */}
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 sm:gap-6 sm:pt-6">
              <div className="rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 p-5 sm:p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 sm:h-12 sm:w-12">
                  <span className="text-xl sm:text-2xl">🎯</span>
                </div>

                <h3 className="mb-2 font-bold text-gray-900">Akreditasi A</h3>

                <p className="text-sm leading-relaxed text-gray-600">Terakreditasi dengan nilai sangat baik</p>
              </div>

              <div className="rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 p-5 sm:p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 sm:h-12 sm:w-12">
                  <span className="text-xl sm:text-2xl">🏆</span>
                </div>

                <h3 className="mb-2 font-bold text-gray-900">Berprestasi</h3>

                <p className="text-sm leading-relaxed text-gray-600">Berbagai penghargaan tingkat regional</p>
              </div>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="min-w-0 space-y-6 sm:space-y-8">
            {/* Vision */}
            <div className="rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white sm:p-8">
              <h3 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">Visi Kami</h3>

              <p className="break-words leading-relaxed text-emerald-50">{profile.visi}</p>
            </div>

            {/* Mission */}
            <div className="rounded-3xl border-2 border-emerald-200 bg-white p-6 sm:p-8">
              <h3 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">Misi Kami</h3>

              <ul className="space-y-3">
                {profile.misi.map((item, index) => (
                  <li key={index} className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 sm:mt-1">
                      <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>

                    <span className="min-w-0 break-words text-sm leading-relaxed text-gray-700 sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
