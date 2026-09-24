import { asset } from "../assets";

const photos = [
  {
    file: "kto-my-experiment",
    alt: "Участники спектакля «Кто мы» под экраном с названием эксперимента",
  },
  {
    file: "kto-my-choices",
    alt: "Зрители перед экраном с вариантами «Это так» и «Это не так»",
  },
  {
    file: "kto-my-participants",
    alt: "Участники спектакля «Кто мы» на общей фотографии",
  },
];

export function Performance() {
  return (
    <section id="performance" className="section performance" aria-labelledby="performance-title">
      <div className="section-heading performance-heading">
        <div className="performance-title">
          <img
            className="performance-logo"
            src={asset("impresario.svg")}
            alt="импресарио"
          />
          <h2 id="performance-title">Кто мы?</h2>
        </div>
        <div className="performance-description">
          <p>
            Спектакль-эксперимент от Импресарио Федора Елютина, где зрители
            через статистику исследуют людей вокруг — их выборы, чувства и жизнь.
          </p>
        </div>
      </div>
      <div className="performance-gallery">
        {photos.map(({ file, alt }, index) => (
          <img
            key={file}
            src={asset(`${file}.webp`)}
            srcSet={`${asset(`${file}-960.webp`)} 960w, ${asset(`${file}.webp`)} 1920w`}
            sizes={index === 0
              ? "(max-width: 900px) 92vw, 62vw"
              : "(max-width: 600px) 92vw, (max-width: 900px) 45vw, 31vw"}
            width={1920}
            height={1280}
            alt={alt}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </section>
  );
}
