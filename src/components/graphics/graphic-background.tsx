"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface Props {
  src: string;
  className?: string;
  opacity?: number;
  zIndex?: number;
  parallax?: boolean;
  parallaxSpeed?: number;
  animate?: "float" | "fade" | "pulse" | "drift" | "none";
  overflow?: boolean;
  children?: ReactNode;
}

export function GraphicBackground({
  src,
  className = "",
  opacity = 0.5,
  zIndex = 0,
  parallax = false,
  parallaxSpeed = 0.05,
  animate = "none",
  overflow = false,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = src;
  }, [visible, src]);

  useEffect(() => {
    if (!parallax) return;
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [parallax]);

  const animClass = animate !== "none" ? `graphic--${animate}` : "";

  return (
    <div
      ref={ref}
      className={`graphic-wrap ${overflow ? "graphic-wrap--overflow" : ""} ${className}`}
      style={{ zIndex, opacity: loaded ? opacity : 0 }}
    >
      {loaded && (
        <img
          src={src}
          alt=""
          className={`graphic-img ${animClass}`}
          aria-hidden="true"
          loading="lazy"
          style={
            parallax
              ? { transform: `translateY(${scrollY * parallaxSpeed}px)` }
              : undefined
          }
        />
      )}
      {children}
    </div>
  );
}
