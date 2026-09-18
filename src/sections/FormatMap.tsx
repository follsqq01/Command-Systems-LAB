import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from "react";
import { clamp, variables } from "../interaction";

const labels = [
  {
    text: "Рефлексия и исследование",
    color: "white",
    x: 10,
    y: 18,
    mx: 52,
    my: 41,
  },
  { text: "03 · Антиконференция", color: "blue", x: 39, y: 21, mx: 4, my: 56 },
  {
    text: "Короткие и точные выступления",
    color: "white",
    x: 67,
    y: 12,
    mx: 52,
    my: 26,
  },
  {
    text: "02 · Исследовательская сессия",
    color: "green",
    x: 5,
    y: 45,
    mx: 4,
    my: 41,
  },
  { text: "04 · Мастерская", color: "yellow", x: 78, y: 41, mx: 4, my: 71 },
  {
    text: "Peer-to-peer и самоорганизация",
    color: "white",
    x: 8,
    y: 70,
    mx: 52,
    my: 56,
  },
  {
    text: "Игровые и коммуникационные форматы",
    color: "white",
    x: 69,
    y: 63,
    mx: 52,
    my: 71,
  },
  {
    text: "01 · TED-выступления",
    color: "purple",
    x: 43,
    y: 62,
    mx: 4,
    my: 26,
  },
];

const dots = [
  ["yellow", 7, 12], ["green", 37, 10], ["blue", 53, 6],
  ["blue", 14, 35], ["purple", 72, 51], ["forest", 39, 69],
  ["yellow", 60, 77], ["green", 81, 91],
] as const;

type Item = (typeof labels)[number];

function MobileOrbits() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mobile = matchMedia("(max-width: 900px)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const lanes = Array.from(root.querySelectorAll<HTMLElement>(".mobile-orbit"));
    const items = lanes.map((lane) => Array.from(lane.querySelectorAll<HTMLElement>(".mobile-orbit__item")));
    let visible = false;
    let frame = 0;
    let widths = lanes.map((lane) => lane.clientWidth);
    let depths = lanes.map((lane) => lane.clientHeight);

    const measure = () => {
      widths = lanes.map((lane) => lane.clientWidth);
      depths = lanes.map((lane) => lane.clientHeight);
    };
    const animate = (now: number) => {
      lanes.forEach((_, laneIndex) => {
        const width = widths[laneIndex];
        const depth = depths[laneIndex];
        if (!width) return;
        const travel = width + 380;
        const duration = laneIndex === 0 ? 19000 : 21000;
        items[laneIndex].forEach((item, index) => {
          const phase = (now / duration + index / items[laneIndex].length + (laneIndex ? 0.37 : 0.07)) % 1;
          const x = laneIndex ? width + 190 - phase * travel : -190 + phase * travel;
          const t = Math.max(0, Math.min(1, x / width));
          const y = depth * (0.05 + 3.6 * t * (1 - t));
          item.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        });
      });
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (mobile.matches && !reducedMotion.matches && visible) {
        measure();
        frame = requestAnimationFrame(animate);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { rootMargin: "150px" });
    const resize = new ResizeObserver(measure);
    lanes.forEach((lane) => resize.observe(lane));
    observer.observe(root);
    mobile.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      mobile.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div ref={ref} className="mobile-orbits" role="list" aria-label="Форматы работы">
      {[0, 1].map((lane) => (
        <div className={`mobile-orbit mobile-orbit--${lane}`} key={lane}>
          <svg className="mobile-orbit__line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 0 5 Q 50 185 100 5" />
          </svg>
          {labels.filter((_, index) => index % 2 === lane).flatMap((label, index) => [
            <span className={`mobile-orbit__item mobile-orbit__tag ${label.color}`} role="listitem" key={label.text}>{label.text}</span>,
            <span className={`mobile-orbit__item mobile-orbit__dot dot ${dots[lane + index * 2][0]}`} aria-hidden="true" key={`dot-${index}`} />,
          ])}
        </div>
      ))}
    </div>
  );
}

function Chip({ item }: { item: Item }) {
  const ref = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [held, setHeld] = useState(false);

  function position(x: number, y: number) {
    const n = ref.current!;
    const parent = n.parentElement!;
    const maxX = parent.clientWidth - n.offsetWidth;
    const maxY = parent.clientHeight - n.offsetHeight;
    n.style.left = `${clamp(x, 0, maxX)}px`;
    n.style.top = `${clamp(y, 0, maxY)}px`;
  }

  useLayoutEffect(() => {
    const n = ref.current!;
    n.style.left = "";
    n.style.top = "";
  }, []);

  function down(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    const n = ref.current!;
    n.setPointerCapture(e.pointerId);
    drag.current = {
      x: e.clientX - n.offsetLeft,
      y: e.clientY - n.offsetTop,
    };
    setHeld(true);
  }

  function move(e: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    position(e.clientX - drag.current.x, e.clientY - drag.current.y);
  }

  function keyboard(e: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;
    e.preventDefault();
    const n = ref.current!;
    const step = n.parentElement!.clientWidth * 0.02;
    position(
      n.offsetLeft +
        (e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0),
      n.offsetTop +
        (e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0),
    );
  }

  function release() {
    drag.current = null;
    setHeld(false);
  }

  return (
    <button
      ref={ref}
      className={`map-chip ${item.color}${held ? " is-held" : ""}`}
      style={variables({
        "--x": `${item.x}%`,
        "--y": `${item.y}%`,
        "--mobile-x": `${item.mx}%`,
        "--mobile-y": `${item.my}%`,
      })}
      aria-label={`${item.text}. Перетащите или используйте стрелки клавиатуры`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onKeyDown={keyboard}
    >
      {item.text}
    </button>
  );
}

export function FormatMap() {
  return (
    <section id="format-map" className="format-map" aria-label="Четыре формата">
      <h2>Четыре формата, один вопрос – как создавать новое вместе?</h2>
      {dots.map(([color, x, y], i) => (
        <i
          key={i}
          className={`map-dot dot ${color}`}
          style={variables({ left: `${x}%`, top: `${y}%`, "--dot-order": i })}
          aria-hidden="true"
        />
      ))}
      {labels.map((item) => (
        <Chip key={item.text} item={item} />
      ))}
      <MobileOrbits />
    </section>
  );
}
