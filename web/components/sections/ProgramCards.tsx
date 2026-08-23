"use client";

import type { ProgramItem } from "@/types/Program";
import { useReveal } from "@/hooks/useReveal";

type ProgramCardsProps = {
  programs: ProgramItem[];
};

function ProgramCard({
  program,
  index,
}: {
  program: ProgramItem;
  index: number;
}) {
  const { ref, isVisible } = useReveal<HTMLElement>();

  return (
    <article
      ref={ref}
      className={`
        group min-w-0 border-t border-brand-200 pt-7
        reveal ${isVisible ? "reveal-visible" : ""}
      `}
      style={{ transitionDelay: `${Math.min(index, 5) * 70}ms` }}
    >
      <div className="flex items-baseline gap-4">
        <span className="font-display text-sm text-brand-500 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>

        <h3 className="font-display min-w-0 text-xl leading-snug font-semibold wrap-break-word text-ink-900">
          {program.title}
        </h3>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed wrap-break-word text-ink-700">
        {program.description}
      </p>
    </article>
  );
}

export default function ProgramCards({ programs }: ProgramCardsProps) {
  return (
    <div className="mt-14 grid gap-x-10 gap-y-11 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 xl:gap-x-16">
      {programs.map((program, index) => (
        <ProgramCard key={program.id} program={program} index={index} />
      ))}
    </div>
  );
}
