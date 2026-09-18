import { useLayoutEffect, useRef } from "react";
import { variables } from "./interaction";

const layouts = {
  left: [
    [20, 22, "blue"],
    [86, 63, "green"],
  ],
  right: [
    [8, 84, "blue"],
    [82, 27, "green"],
  ],
  bottom: [
    [17, 45, "forest"],
    [48, 10, "purple"],
    [81, 80, "blue"],
  ],
} as const;

/** Separate HTML circles and lines; a shared floating frame keeps connections attached. */
export function HeroNetwork({ side }: { side: keyof typeof layouts }) {
  const ref = useRef<HTMLDivElement>(null);
  const points = layouts[side];
  const edges =
    side === "bottom"
      ? [
          [0, 1],
          [0, 2],
        ]
      : [[0, 1]];
  useLayoutEffect(() => {
    const node = ref.current!;
    const measure = () => {
      const width = node.clientWidth;
      const height = node.clientHeight;
      node.querySelectorAll<HTMLElement>(".network-line").forEach((line, i) => {
        const [from, to] = edges[i];
        const [x, y] = points[from];
        const [toX, toY] = points[to];
        const dx = ((toX - x) * width) / 100;
        const dy = ((toY - y) * height) / 100;
        line.style.width = `${(Math.hypot(dx, dy) / (width || 1)) * 100}%`;
        line.style.rotate = `${Math.atan2(dy, dx)}rad`;
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, [points]);
  return (
    <div className={`hero-network hero-network--${side}`} aria-hidden="true">
      <div className="network-float" ref={ref}>
        {edges.map(([from], i) => (
          <span
            key={i}
            className="network-line"
            style={variables({
              left: `${points[from][0]}%`,
              top: `${points[from][1]}%`,
              "--connect-delay": `${0.7 + i * 1.2}s`,
            })}
          />
        ))}
        {points.map(([x, y, color], i) => (
          <i
            key={i}
            className={`dot network-dot ${color}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        ))}
      </div>
    </div>
  );
}
