import { asset } from "../assets";
import { ActionLink } from "../ActionLink";
import { HeroNetwork } from "../HeroNetwork";
import { variables } from "../interaction";
export function Hero() {
  return (
    <header id="home" className="hero">
      <div className="hero-nav">
        <a
          href="#home"
          className="hero-logos"
          aria-label="Лаборатория командных систем — главная"
        >
          <img src={asset("b76d8.svg")} alt="Omega Events" />
          <span>×</span>
          <img src={asset("e7792.svg")} alt="Металогика" />
        </a>
        <nav aria-label="Разделы сайта">
          <ActionLink destination="program">Программа</ActionLink>
          <ActionLink destination="formats">Формат</ActionLink>
          <ActionLink destination="speakers">Спикеры</ActionLink>
        </nav>
        <ActionLink className="hero-phone button button--outline" destination="phone">
          +7 901 340 43 03
        </ActionLink>
      </div>
      <div className="hero-body">
        <HeroNetwork side="left" />
        <div className="hero-content">
          <h1>
            Лаборатория
            <br />
            командных систем
          </h1>
          <p>
            От лучших практик к новым практикам.
            <br />
            Как вместе создавать опыт, которого еще не существует.
          </p>
          <p className="hero-address">
            27 октября БАУНС – пространство Omega Events
            <br />
            Москва, ст.м. Белорусская, 3-я ул. Ямского поля, д.&nbsp;2&nbsp;к6
          </p>
          <div className="hero-actions">
            <ActionLink className="button" destination="tickets">
              Принять участие
            </ActionLink>
          </div>
        </div>
        <HeroNetwork side="right" />
        <HeroNetwork side="bottom" />
      </div>
      {(
        ["blue", "purple", "forest", "forest", "yellow", "yellow"] as const
      ).map((color, i) => (
        <i
          key={i}
          className={`dot hero-solo hero-solo--${i} ${color}`}
          style={variables({ "--solo-index": i })}
          aria-hidden="true"
        />
      ))}
      {(["yellow", "purple", "green", "forest", "blue"] as const).map(
        (color, i) => (
          <i
            key={i}
            className={`dot hero-mobile-dot hero-mobile-dot--${i} ${color}`}
            aria-hidden="true"
          />
        ),
      )}
    </header>
  );
}
