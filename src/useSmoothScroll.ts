import { useEffect } from "react";

/** Gentle wheel inertia; touch, keyboard, zoom and nested scrollers stay native. */
export function useSmoothScroll() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let target = scrollY;
    let previous = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const animate = (time: number) => {
      const dt = Math.min(time - previous || 16, 64);
      previous = time;
      target = Math.min(
        target,
        document.documentElement.scrollHeight - innerHeight,
      );
      const next = scrollY + (target - scrollY) * (1 - Math.exp(-dt / 115));
      scrollTo({
        top: Math.abs(target - next) < 1 ? target : next,
        behavior: "instant",
      });
      if (Math.abs(target - scrollY) > 1)
        frame = requestAnimationFrame(animate);
      else frame = 0;
    };
    const wheel = (event: WheelEvent) => {
      if (document.querySelector(".preloader")) return;
      if (
        reduced.matches ||
        event.ctrlKey ||
        event.metaKey ||
        event.defaultPrevented ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      let element = event.target instanceof Element ? event.target : null;
      while (element && element !== document.body) {
        const style = getComputedStyle(element);
        if (
          /(auto|scroll)/.test(style.overflowY) &&
          element.scrollHeight > element.clientHeight
        )
          return;
        element = element.parentElement;
      }
      event.preventDefault();
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? innerHeight * 0.025
          : event.deltaMode === 2
            ? innerHeight
            : 1);
      if (!frame) target = scrollY;
      target = Math.max(
        0,
        Math.min(
          target + delta * 0.88,
          document.documentElement.scrollHeight - innerHeight,
        ),
      );
      if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("pointerdown", stop);
    window.addEventListener("keydown", stop);
    reduced.addEventListener("change", stop);
    return () => {
      stop();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", stop);
      reduced.removeEventListener("change", stop);
    };
  }, []);
}
