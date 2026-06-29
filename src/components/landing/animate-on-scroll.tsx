"use client";

import { useEffect, useRef } from "react";

export function AnimateOnScroll({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { el.classList.add("animate-in"); observer.unobserve(el); } },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={className} style={{ opacity: 0 }}>{children}</div>;
}
