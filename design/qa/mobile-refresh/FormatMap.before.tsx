import {
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
function Chip({ item }: { item: (typeof labels)[number] }) {
  const ref = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const [held, setHeld] = useState(false);
  useLayoutEffect(() => {
    const node = ref.current!;
    const observer = new ResizeObserver(() => {
      if (node.style.left) position(node.offsetLeft, node.offsetTop);
    });
    observer.observe(node.parentElement!);
    return () => observer.disconnect();
  }, []);
  function position(x: number, y: number) {
    const node = ref.current!,
      parent = node.parentElement!.getBoundingClientRect(),
      b = node.getBoundingClientRect();
    node.style.left = `${(clamp(x, 0, parent.width - b.width) / parent.width) * 100}%`;
    node.style.top = `${(clamp(y, 0, parent.height - b.height) / parent.height) * 100}%`;
  }
  function down(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    const b = e.currentTarget.getBoundingClientRect();
    drag.current = {
      id: e.pointerId,
      x: e.clientX - b.left,
      y: e.clientY - b.top,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setHeld(true);
  }
  function move(e: PointerEvent<HTMLButtonElement>) {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const b = e.currentTarget.parentElement!.getBoundingClientRect();
    position(
      e.clientX - b.left - drag.current.x,
      e.clientY - b.top - drag.current.y,
    );
  }
  function keyboard(e: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;
    e.preventDefault();
    const n = ref.current!,
      step = n.parentElement!.clientWidth * 0.02;
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
      {(
        [
          ["yellow", 7, 12],
          ["green", 37, 10],
          ["blue", 53, 6],
          ["blue", 14, 35],
          ["purple", 72, 51],
          ["forest", 39, 69],
          ["yellow", 60, 77],
          ["green", 81, 91],
        ] as const
      ).map(([color, x, y], i) => (
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
    </section>
  );
}
