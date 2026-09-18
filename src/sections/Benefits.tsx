import { asset } from "../assets";
const circles = [
  ["04717.png", "Живое общение на форуме", false],
  ["LOOK0642_resized.jpg", "Спикер выступает перед участниками", false],
  ["4f4fb.svg", "", true],
  ["7fafc.png", "Участники обсуждают идеи на форуме", false],
  ["LOOK0760_resized.jpg", "Спикер рассказывает о командной работе", false],
  ["1c100.svg", "", true],
  ["071d8.png", "Команда участников форума", false],
] as const;
export function Benefits() {
  return (
    <section
      id="benefits"
      className="benefits"
      aria-label="Почему стоит участвовать"
    >
      <div className="section-heading">
        <h2>
          Почему стоит
          <br />
          участвовать
        </h2>
        <p>
          Вы увидите, как сегодня создаются сильные команды, получите
          практические модели найма и развития людей и разберёте подходы,
          которые можно применить в своей компании.
        </p>
      </div>
      <div className="circle-marquee">
        <div className="circle-track">
          {[0, 1].map((copy) => (
            <div
              className="circle-group"
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {circles.map(([file, alt, ring]) => (
                <div
                  className={`benefit-circle ${ring ? "benefit-circle--ring" : ""}`}
                  key={file}
                >
                  <img src={asset(file)} alt={alt} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
