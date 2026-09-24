import { Hero } from "./sections/Hero";
import { Atmosphere } from "./sections/Atmosphere";
import { Changes } from "./sections/Changes";
import { FormatMap } from "./sections/FormatMap";
import { Program } from "./sections/Program";
import { Formats } from "./sections/Formats";
import { Invitation } from "./sections/Invitation";
import { Speakers } from "./sections/Speakers";
import { Performance } from "./sections/Performance";
import { Gallery } from "./sections/Gallery";
import { Tickets } from "./sections/Tickets";
import { Benefits } from "./sections/Benefits";
import { Footer } from "./sections/Footer";
import { useSmoothScroll } from "./useSmoothScroll";
import { useRef, useState } from "react";
import { Preloader } from "./Preloader";
import { useRussianTypography } from "./typography";

export function Forum() {
  useSmoothScroll();
  const content = useRef<HTMLElement>(null);
  useRussianTypography(content);
  const [loading, setLoading] = useState(true);
  return (
    <>
      {loading && <Preloader onReady={() => setLoading(false)} />}
      <main ref={content} className={`forum${loading ? " is-loading" : ""}`} inert={loading}>
        <Hero />
        <Atmosphere />
        <Changes />
        <FormatMap />
        <Program />
        <Formats />
        <Invitation />
        <Speakers />
        <Performance />
        <Tickets />
        <Benefits />
        <Gallery />
        <Footer />
      </main>
    </>
  );
}
