"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * Reveal sederhana berbasis IntersectionObserver.
 *
 * Sekali elemen terlihat, statusnya tidak dicabut lagi.
 * Jadi konten tidak berkedip ketika user scroll bolak-balik.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /*
   * Callback ref, bukan useEffect.
   *
   * Observer dipasang tepat saat node tersedia,
   * sehingga tidak ada render tambahan hanya untuk
   * menunggu ref terisi.
   */
  const ref = useCallback((node: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!node) return;

    /*
     * Lingkungan tanpa IntersectionObserver
     * (mis. sebagian bot atau browser lama)
     * langsung menampilkan konten apa adanya.
     */
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        }
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.15,
      },
    );

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { ref, isVisible };
}
