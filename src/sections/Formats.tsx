import { asset } from "../assets";
import { Orbits, useScrollStage } from "../interaction";
const formats = [
  [
    "TED-выступления",
    "Четыре коротких выступления по двадцать минут, каждое из которых предлагает новый взгляд на команды и совместное создание опыта. Динамичный формат станет отправной точкой для общего разговора.",
    "4ce30.svg",
  ],
  [
    "Исследовательская сессия",
    "В живом диалоге участники рассмотрят новые модели развития бизнеса и исследуют, как объединять разный опыт, формировать доверие и действовать в ситуациях, когда готовых решений ещё нет.",
    "27251.svg",
  ],
  [
    "Мастерская",
    "Через упражнения и диагностику «Металогики» участники исследуют собственные ценностные стратегии и разберутся, почему одни команды создают новые практики, а другие продолжают действовать по привычным сценариям.",
    "cfb93.svg",
  ],
  [
    "Антиконференция",
    "Участники сами формируют повестку, предлагая реальные вопросы, задачи и кейсы для обсуждения в малых группах, чтобы вместе исследовать их и находить новые решения.",
    "0b007.svg",
  ],
];
export function Formats() {
  const { section, stage, track } = useScrollStage("y");
  return (
    <section
      id="formats"
      className="scroll-section formats"
      ref={section}
      aria-label="Форматы участия"
    >
      <div className="sticky-stage formats-stage" ref={stage}>
        <div className="formats-intro">
          <h2>
            Новый опыт
            <br />
            начинается
            <br />с участия
          </h2>
          <Orbits />
        </div>
        <div className="formats-window">
          <div className="formats-track" ref={track}>
            {formats.map(([title, text, icon], i) => (
              <article className="format-card" key={title}>
                <div className="format-card__heading">
                  <h3>{title}</h3>
                  <span
                    className={`format-icon ${["green", "blue", "purple", "yellow"][i]}`}
                  >
                    <img src={asset(icon)} alt="" />
                  </span>
                </div>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
