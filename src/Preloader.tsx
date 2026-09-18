import { useEffect, useRef, useState } from "react";
import { variables } from "./interaction";

/** Progress follows settled image/font requests, with a short visual interpolation. */
export function Preloader({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const ready = useRef(onReady);
  ready.current = onReady;
  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const images = [
      ...document.querySelectorAll<HTMLImageElement>("main img"),
    ].filter((image) => image.loading !== "lazy");
    const total = images.length + 1;
    let settled = 0,
      displayed = 0,
      frame = 0,
      finishTimer = 0;
    let active = true;
    const started = performance.now();
    let previous = started;
    const cleanups: (() => void)[] = [];
    const done = () => {
      if (active) settled++;
    };
    images.forEach((image) => {
      if (image.complete) {
        done();
        return;
      }
      let complete = false;
      const settle = () => {
        if (!complete) {
          complete = true;
          done();
        }
      };
      image.addEventListener("load", settle, { once: true });
      image.addEventListener("error", settle, { once: true });
      cleanups.push(() => {
        image.removeEventListener("load", settle);
        image.removeEventListener("error", settle);
      });
    });
    document.fonts.ready.then(done, done);
    const tick = (now: number) => {
      // Release the page even if a remote asset never answers.
      if (now - started > 8000) settled = total;
      displayed = Math.min(
        (settled / total) * 100,
        displayed + Math.max(0, now - previous) * 0.14,
      );
      previous = now;
      setProgress(Math.floor(displayed));
      if (displayed >= 100 && now - started > 950) {
        setLeaving(true);
        finishTimer = window.setTimeout(() => ready.current(), 280);
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(finishTimer);
      cleanups.forEach((cleanup) => cleanup());
      document.documentElement.style.overflow = previousOverflow;
    };
  }, []);
  return (
    <div
      className={`preloader${leaving ? " preloader--leaving" : ""}`}
      aria-label="Загрузка сайта"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div className="preloader-orbit">
        {["blue", "green", "purple", "yellow"].map((color, i) => (
          <span
            className="preloader-carrier"
            style={variables({ "--phase": `${-i * 1.5}s` })}
            key={color}
          >
            <i className={`dot ${color}`} />
          </span>
        ))}
        <span className="preloader-progress">
          {progress}
          <small>%</small>
        </span>
      </div>
    </div>
  );
}
