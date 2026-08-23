type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

/*
 * Kepala section dipakai bersama supaya
 * ritme tipografinya konsisten antar bagian.
 *
 * Rata kiri, bukan tengah, agar terbaca seperti
 * halaman terbitan sekolah dan bukan deretan
 * blok simetris.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase">
        {eyebrow}
      </p>

      <h2 className="font-display mt-4 text-3xl leading-tight font-semibold text-balance text-ink-900 sm:text-[2.5rem]">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-[17px] leading-relaxed text-ink-700">
          {description}
        </p>
      )}
    </div>
  );
}
