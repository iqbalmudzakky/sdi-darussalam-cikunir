"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { COUNT_UP_ANIMATION_DURATION_MS } from "@/lib/shared/constant/animation";

function easeOutQuart(progress: number): number {
  return 1 - Math.pow(1 - progress, 4);
}

export function VisitorCounter({ count }: { count: number }) {
  const { ref, isVisible } = useReveal<HTMLSpanElement>();
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current || count <= 0) return;
    hasAnimatedRef.current = true;

    const startTime = performance.now();
    let frameId: number;

    function tick(now: number) {
      const progress = Math.min(
        (now - startTime) / COUNT_UP_ANIMATION_DURATION_MS,
        1,
      );
      setDisplayValue(Math.round(easeOutQuart(progress) * count));

      if (progress < 1) frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [isVisible, count]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue.toLocaleString("id-ID")}
    </span>
  );
}
