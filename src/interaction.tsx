import { useLayoutEffect, useRef, type CSSProperties } from "react";

export const variables = (values: Record<string, string | number>) =>
  values as CSSProperties;
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Native document scrolling drives a sticky stage; no wheel or touch interception. */
export function useScrollStage(axis: "x" | "y", travelScale = 1, mobileMarquee = false) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = section.current!;
    const frame = stage.current!;
    const content = track.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let distance = 0;
    let travel = 0;
    let isMarquee = false;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (isMarquee) return;
      const progress = clamp(-root.getBoundingClientRect().top, 0, travel);
      const size =
        axis === "x"
          ? content.getBoundingClientRect().width
          : content.getBoundingClientRect().height;
      const fraction = travel ? progress / travel : 0;
      const offset = fraction * distance;
      content.style.transform = `translate${axis.toUpperCase()}(${(-offset / (size || 1)) * 100}%)`;
    };
    const measure = () => {
      isMarquee = mobileMarquee && matchMedia("(max-width: 900px)").matches;
      if (isMarquee) {
        distance = 0;
        travel = 0;
        content.style.transform = "";
        root.style.removeProperty("--stage-height");
        return;
      }
      const viewport =
        axis === "x" ? content.parentElement!.clientWidth : content.parentElement!.clientHeight;
      const length = axis === "x" ? content.scrollWidth : content.scrollHeight;
      distance = motion.matches ? 0 : Math.max(0, length - viewport);
      travel = distance * travelScale;
      root.style.setProperty(
        "--stage-top",
        `${Math.max(0, (innerHeight - frame.clientHeight) / 2)}px`,
      );
      root.style.setProperty(
        "--stage-height",
        `${frame.clientHeight + travel}px`,
      );
      update();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(content);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    motion.addEventListener("change", measure);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      motion.removeEventListener("change", measure);
    };
  }, [axis, travelScale, mobileMarquee]);
  return { section, stage, track };
}

/** Each dot rotates around the same centre on its own circular track. */
export function Orbits({ compact = false }: { compact?: boolean }) {
  const outerDots: [string, number][] = compact
    ? [
        ...["blue", "purple", "yellow", "green", "blue"].map((color, i): [string, number] => [color, -i * 4 - 1]),
        ["blue", -4], ["green", -14], ["forest", -23],
      ]
    : [["blue", -4], ["green", -14.67], ["forest", -25.33]];
  const innerDots: [string, number][] = compact
    ? [
        ...["green", "blue", "forest", "purple"].map((color, i): [string, number] => [color, -i * 8 - 3]),
        ["purple", -7], ["yellow", -21],
      ]
    : [["purple", -8], ["yellow", -18.67], ["green", -29.33]];
  return (
    <div
      className={`orbits${compact ? " orbits--compact" : ""}`}
      aria-hidden="true"
    >
      <div className="orbit orbit--outer">
        {outerDots.map(([color, phase], i) => (
          <span key={i} className="orbit-carrier" style={variables({ "--phase": `${phase}s` })}>
            <i className={`dot ${color}`} />
          </span>
        ))}
      </div>
      <div className="orbit orbit--inner">
        {innerDots.map(([color, phase], i) => (
          <span key={i} className="orbit-carrier" style={variables({ "--phase": `${phase}s` })}>
            <i className={`dot ${color}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
