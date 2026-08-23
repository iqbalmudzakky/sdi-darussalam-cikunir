"use client";

import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;

  /*
   * Jeda sebelum elemen ini muncul.
   *
   * Dipakai untuk membuat beberapa blok berurutan
   * menyusul satu per satu, bukan serentak.
   */
  delay?: number;

  /*
   * Elemen pembungkus. Default div, tetapi bisa diganti
   * agar reveal tidak menambah lapisan yang merusak
   * grid atau daftar di sekitarnya.
   */
  as?: ElementType;

  className?: string;
};

/*
 * Pembungkus animasi muncul saat elemen masuk layar.
 *
 * Dipisahkan sebagai komponen client supaya section
 * yang berjalan di server tetap bisa memakainya.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Component = "div",
  className,
}: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLElement>();

  return (
    <Component
      ref={ref}
      className={cn("reveal", isVisible && "reveal-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
