import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * data-admin menyalakan tema dashboard di globals.css.
   * display: contents supaya pembungkus ini tidak mengubah tata letak.
   */
  return (
    <div data-admin className="contents">
      {children}
    </div>
  );
}
