"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type HeroStat = {
  /*
   * Angka tujuan. Bernilai null untuk nilai yang bukan
   * bilangan, misalnya peringkat akreditasi "A".
   */
  value: number | null;
  display: string;
  suffix?: string;
  label: string;
};

type HeroStatsProps = {
  stats: HeroStat[];
};

const DURATION_MS = 1600;

/*
 * Kurva melambat di akhir, sehingga angka berhenti
 * dengan tenang alih-alih terhenti mendadak.
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function useCountUp(target: number | null, shouldStart: boolean) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldStart || target === null) return;

    /*
     * Pengguna yang meminta gerakan dikurangi langsung
     * melihat angka akhirnya, tanpa animasi.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rafRef.current = window.requestAnimationFrame(() => {
        setCurrent(target);
        rafRef.current = null;
      });

      return () => {
        if (rafRef.current !== null) {
          window.cancelAnimationFrame(rafRef.current);
        }
      };
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / DURATION_MS, 1);

      setCurrent(Math.round(easeOutExpo(progress) * target));

      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, shouldStart]);

  return current;
}

function StatItem({
  stat,
  shouldStart,
}: {
  stat: HeroStat;
  shouldStart: boolean;
}) {
  const count = useCountUp(stat.value, shouldStart);

  /*
   * Nilai bukan angka ditampilkan apa adanya. Sebelum
   * hitungan dimulai, angka juga ditahan di nilai akhir
   * supaya isi halaman tetap benar bagi pembaca layar
   * dan mesin pencari.
   */
  const text =
    stat.value === null
      ? stat.display
      : shouldStart
        ? `${count}${stat.suffix ?? ""}`
        : stat.display;

  return (
    <div>
      <dt className="sr-only">{stat.label}</dt>

      <dd className="font-display text-3xl font-semibold text-ink-900 tabular-nums">
        {text}
      </dd>

      <p className="mt-1 text-sm text-ink-500">{stat.label}</p>
    </div>
  );
}

export default function HeroStats({ stats }: HeroStatsProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  /*
   * Hitungan baru berjalan ketika deretan angka benar-benar
   * terlihat, dan hanya sekali.
   *
   * Observer dipasang lewat callback ref supaya tidak perlu
   * satu render tambahan hanya untuk menunggu ref terisi.
   */
  const listRef = useCallback((node: HTMLDListElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasEntered(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  /*
   * Grid tetap, bukan flex-wrap.
   *
   * Dengan flex-wrap jumlah angka per baris ikut lebar
   * layar, sehingga satu angka bisa tertinggal sendirian
   * di baris terakhir. Grid menjaga susunannya selalu
   * seimbang: dua kolom di layar kecil, sebaris penuh
   * begitu ruangnya cukup.
   */
  return (
    <dl
      ref={listRef}
      className="intro mt-12 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-brand-100 pt-8 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-6"
      style={{ animationDelay: "320ms" }}
    >
      {stats.map((stat) => (
        <StatItem key={stat.label} stat={stat} shouldStart={hasEntered} />
      ))}
    </dl>
  );
}
