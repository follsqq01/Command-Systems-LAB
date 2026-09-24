import { useEffect, useRef } from "react";
import { asset } from "../assets";

export function Footer() {
  const footer = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = footer.current;
    if (!element) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        element.style.removeProperty("--footer-offset");
        element.style.removeProperty("--footer-reveal");
        return;
      }
      const rect = element.getBoundingClientRect();
      const offset = Math.max(0, Math.min(rect.height, rect.bottom - innerHeight));
      // Pin the inner stage to the viewport bottom inside the existing footer height.
      element.style.setProperty("--footer-offset", `${-offset}px`);
      element.style.setProperty("--footer-reveal", String(1 - offset / Math.max(1, rect.height)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onScroll = () => {
      if (visible) schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    const resizeObserver = new ResizeObserver(schedule);
    observer.observe(element);
    resizeObserver.observe(element);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <footer ref={footer} className="site-footer-shell" aria-label="Организаторы">
      <div className="site-footer">
        <div className="site-footer__logos">
          <img src={asset("b76d8.svg")} alt="Omega Events" />
          <span aria-hidden="true">×</span>
          <img src={asset("e7792.svg")} alt="Металогика" />
        </div>
      </div>
    </footer>
  );
}
