"use client";

import { useEffect, useRef, useState } from "react";
import type { ProgramItem } from "@/types/Program";

type ProgramCardsProps = {
  programs: ProgramItem[];
};

type ScrollDirection = "up" | "down";

type CardPhase = "hidden" | "entering" | "settled";

type CardState = {
  phase: CardPhase;
  direction: ScrollDirection;
};

export default function ProgramCards({ programs }: ProgramCardsProps) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const lastScrollYRef = useRef(0);
  const scrollDirectionRef = useRef<ScrollDirection>("down");
  const animationFrameRef = useRef<number | null>(null);

  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const updateCards = () => {
      const viewportHeight = window.innerHeight;

      /*
       * Sedikit toleransi di bawah viewport.
       *
       * Jadi card dianggap "penuh" ketika bottom card
       * sudah benar-benar masuk ke layar, bukan ketika
       * hanya icon atau judulnya yang terlihat.
       */
      const bottomSafeArea = 12;

      const nextStates: Record<string, CardState> = {};

      programs.forEach((program) => {
        const element = cardRefs.current[program.id];

        if (!element) return;

        const rect = element.getBoundingClientRect();

        /*
         * Apakah ada bagian card yang masuk viewport?
         */
        const isPartiallyVisible = rect.bottom > 0 && rect.top < viewportHeight;

        /*
         * Kondisi yang benar-benar kita butuhkan:
         *
         * bagian paling atas card sudah berada di layar
         * DAN
         * bagian paling bawah card juga sudah berada di layar.
         */
        const isFullyVisible = rect.top >= 0 && rect.bottom <= viewportHeight - bottomSafeArea;

        const previousState = cardStates[program.id];

        /*
         * Belum terlihat sama sekali.
         */
        if (!isPartiallyVisible) {
          nextStates[program.id] = {
            phase: "hidden",
            direction: scrollDirectionRef.current,
          };

          return;
        }

        /*
         * Sudah terlihat SELURUH card.
         *
         * Baru di titik ini jiggle/settle dimainkan.
         */
        if (isFullyVisible) {
          nextStates[program.id] = {
            phase: "settled",
            direction: previousState?.direction ?? scrollDirectionRef.current,
          };

          return;
        }

        /*
         * Card baru terlihat sebagian.
         *
         * Simpan arah masuknya dan pertahankan
         * state entering sampai keseluruhan card
         * benar-benar masuk viewport.
         */
        nextStates[program.id] = {
          phase: "entering",
          direction: previousState?.phase !== "hidden" && previousState?.direction ? previousState.direction : scrollDirectionRef.current,
        };
      });

      setCardStates((previous) => {
        let hasChanged = false;

        for (const program of programs) {
          const previousState = previous[program.id];
          const nextState = nextStates[program.id];

          if (previousState?.phase !== nextState?.phase || previousState?.direction !== nextState?.direction) {
            hasChanged = true;
            break;
          }
        }

        return hasChanged ? nextStates : previous;
      });

      animationFrameRef.current = null;
    };

    const requestUpdate = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(updateCards);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollYRef.current;

      /*
       * Tentukan arah hanya kalau perpindahannya cukup
       * besar supaya tidak gampang berubah hanya karena
       * sedikit getaran scroll.
       */
      if (Math.abs(difference) > 3) {
        scrollDirectionRef.current = difference > 0 ? "down" : "up";

        lastScrollYRef.current = currentScrollY;
      }

      requestUpdate();
    };

    const handleResize = () => {
      requestUpdate();
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleResize);

    /*
     * Hitung kondisi pertama kali saat component dimuat.
     */
    requestUpdate();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [programs, cardStates]);

  const getAnimationClass = (state: CardState | undefined) => {
    const phase = state?.phase ?? "hidden";
    const direction = state?.direction ?? "down";

    if (phase === "settled") {
      return direction === "down" ? "program-card-settle-from-bottom" : "program-card-settle-from-top";
    }

    if (phase === "entering") {
      return direction === "down" ? "program-card-entering-from-bottom" : "program-card-entering-from-top";
    }

    return direction === "down" ? "program-card-hidden-from-bottom" : "program-card-hidden-from-top";
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {programs.map((program) => {
        const state = cardStates[program.id];

        return (
          /*
           * LAYER 1
           *
           * Hanya digunakan untuk scroll reveal
           * dan efek settle/jiggle.
           */
          <div
            key={program.id}
            ref={(element) => {
              cardRefs.current[program.id] = element;
            }}
            className={`h-full ${getAnimationClass(state)}`}
          >
            {/*
             * LAYER 2
             *
             * Hover desktop dan active mobile tetap
             * dipisahkan supaya tidak bentrok dengan
             * scroll animation.
             */}
            <div
              className="
                group h-full min-w-0 rounded-3xl
                bg-white p-6 shadow-md

                transition-[transform,box-shadow]
                duration-300 ease-out

                hover:-translate-y-2
                hover:shadow-2xl

                active:-translate-y-1
                active:scale-[0.985]
                active:shadow-xl

                sm:p-7
                lg:p-8
              "
            >
              {/* Program Icon */}
              <div
                className="
                  mx-auto mb-5 flex h-14 w-14
                  items-center justify-center
                  rounded-2xl

                  bg-linear-to-br
                  from-emerald-500
                  to-teal-600

                  transition-transform
                  duration-300
                  ease-out

                  group-hover:scale-110
                  group-active:scale-110

                  sm:mb-6
                  sm:h-16
                  sm:w-16
                "
              >
                <span className="text-2xl sm:text-3xl">{program.emoji}</span>
              </div>

              {/* Program Title */}
              <h3 className="mb-3 break-words text-center text-lg font-bold text-gray-900 sm:text-xl">{program.title}</h3>

              {/* Program Description */}
              <p className="break-words text-justify text-sm leading-relaxed text-gray-600 sm:text-base">{program.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
