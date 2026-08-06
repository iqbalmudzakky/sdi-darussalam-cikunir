import { getSchoolProfile } from "@/lib/data/schoolProfile";

export default async function About() {
  const profile = await getSchoolProfile();
  const paragraphs = profile.description
    .split("\n\n")
    .filter((paragraph) => paragraph.trim().length > 0);

  return (
    <section id="tentang" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tentang Kami
          </h2>
          <div className="w-24 h-1 bg-linear-to-r from-emerald-600 to-teal-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-lg text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Akreditasi A</h3>
                <p className="text-gray-600 text-sm">
                  Terakreditasi dengan nilai sangat baik
                </p>
              </div>
              <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Berprestasi</h3>
                <p className="text-gray-600 text-sm">
                  Berbagai penghargaan tingkat regional
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Visi Kami</h3>
              <p className="text-emerald-50 leading-relaxed">{profile.visi}</p>
            </div>

            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Misi Kami
              </h3>
              <ul className="space-y-3">
                {profile.misi.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-emerald-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">{item}</span>
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
