import { useEffect, useRef } from "react";

export function useAutoScroll(
  dependency: unknown,
  containerRef: React.RefObject<HTMLDivElement | null>,
  skipRef: React.RefObject<boolean>
) {
  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [dependency, containerRef, skipRef]);
}
