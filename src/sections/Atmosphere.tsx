import { useEffect, useRef } from "react";
import { asset } from "../assets";
const message =
  "Это форум, антиконференция и живое сообщество — всё сразу.　 ●　 Формат, где HR-процессы смотрят через призму команд — и сразу применяют　 ●　 ";
export function Atmosphere() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const updatePlayback = () => {
      if (visible && !reducedMotion.matches) void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    }, { rootMargin: "150px 0px" });
    observer.observe(video);
    reducedMotion.addEventListener("change", updatePlayback);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", updatePlayback);
      video.pause();
    };
  }, []);

  return (
    <section
      id="atmosphere"
      className="atmosphere"
      aria-label="Форум и сообщество"
    >
      <div className="text-marquee">
        <div className="text-track">
          <span>{message}</span>
          <span aria-hidden="true">{message}</span>
        </div>
      </div>
      <div className="atmosphere-media">
        <video
          ref={videoRef}
          className="atmosphere-video"
          src={asset("0917.mp4")}
          poster={asset("0917-poster.webp")}
          aria-hidden="true"
          muted
          loop
          playsInline
          preload="none"
        />
        <h2>Среда, в которой команды создают решения, которых ещё нет</h2>
      </div>
    </section>
  );
}
