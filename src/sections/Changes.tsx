import { useEffect, useRef, useState, type PointerEvent } from "react";
const changes = [
  [
    "AI меняет роли в командах",
    "Привычные функции автоматизируются. Нужно заново понимать, какие люди и компетенции действительно нужны.",
  ],
  [
    "Микрокоманды — новый стандарт",
    "Меньше людей, больше автономности, доверия и личной ответственности за результат.",
  ],
  [
    "Найм больше не про количество",
    "Важно понимать не только кого нанимать, но и как человек будет думать и действовать внутри команды.",
  ],
  [
    "Готовые сценарии перестали работать",
    "Командам приходится принимать решения там, где нет проверенных шаблонов и единственно верного ответа.",
  ],
];
function MagneticCard({ item, index }: { item: string[]; index: number }) {
  const [scrollFlipped, setScrollFlipped] = useState(false);
  const [manualFlipped, setManualFlipped] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const card = useRef<HTMLButtonElement>(null);
  const pointer = useRef("mouse");
  const flipped = manualFlipped ?? (scrollFlipped || hovered);

  useEffect(() => {
    const element = card.current;
    if (!element) return;
    const mobile = matchMedia("(max-width: 900px)");
    let timer: number | undefined;
    let autoDone = false;
    const clearTimer = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
    };
    const checkPosition = () => {
      if (!mobile.matches) return;
      const rect = element.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!visible) {
        clearTimer();
        autoDone = false;
        setScrollFlipped(false);
        setManualFlipped(null);
        return;
      }

      // On a narrow phone, wait until the whole front has appeared and then
      // travelled another half-card. Keep the earlier trigger for tall cards.
      const triggerTop = Math.max(
        window.innerHeight - rect.height * 1.5,
        window.innerHeight * 0.62 - rect.height / 2,
      );
      const ready = rect.top <= triggerTop;
      if (ready && !autoDone && timer === undefined) {
        timer = window.setTimeout(() => {
          autoDone = true;
          timer = undefined;
          setScrollFlipped(true);
        }, 250);
      } else if (!ready && !autoDone) {
        clearTimer();
      }
    };
    const reset = () => {
      clearTimer();
      autoDone = false;
      setScrollFlipped(false);
      setManualFlipped(null);
      checkPosition();
    };
    mobile.addEventListener("change", reset);
    window.addEventListener("scroll", checkPosition, { passive: true });
    window.addEventListener("resize", checkPosition);
    checkPosition();
    return () => {
      clearTimer();
      mobile.removeEventListener("change", reset);
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
  }, []);

  function move(e: PointerEvent<HTMLButtonElement>) {
    if (
      e.pointerType !== "mouse" ||
      matchMedia("(max-width: 900px)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const b = e.currentTarget.getBoundingClientRect();
    card.current!.style.setProperty(
      "--magnet-x",
      `${((e.clientX - b.left) / b.width - 0.5) * 4}%`,
    );
    card.current!.style.setProperty(
      "--magnet-y",
      `${((e.clientY - b.top) / b.height - 0.5) * 4}%`,
    );
  }
  return (
    <button
      ref={card}
      className="change-card"
      aria-label={item[0]}
      aria-pressed={flipped}
      onPointerDown={(e) => { pointer.current = e.pointerType; }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse" && !matchMedia("(max-width: 900px)").matches) setHovered(true);
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        setHovered(false);
        card.current?.style.setProperty("--magnet-x", "0%");
        card.current?.style.setProperty("--magnet-y", "0%");
      }}
      onClick={(e) => {
        if (matchMedia("(max-width: 900px)").matches || e.detail === 0 || pointer.current !== "mouse") {
          setManualFlipped(!flipped);
        }
      }}
    >
      <span className={`change-card__inner ${flipped ? "is-flipped" : ""}`}>
        <span className="change-card__face" aria-hidden={flipped}>
          <span className="change-card__number">0{index + 1}</span>
          <span className="change-card__title">{item[0]}</span>
        </span>
        <span
          className="change-card__face change-card__back"
          aria-hidden={!flipped}
        >
          <span className="change-card__number">0{index + 1}</span>
          <span>{item[1]}</span>
        </span>
      </span>
    </button>
  );
}
export function Changes() {
  return (
    <section id="changes" className="section changes">
      <h2>
        Что сейчас меняется
        <br />в командах
      </h2>
      <div className="changes-grid">
        {changes.map((item, index) => (
          <MagneticCard key={item[0]} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}
