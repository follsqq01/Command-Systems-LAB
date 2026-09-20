import { ActionLink } from "../ActionLink";
import { Orbits } from "../interaction";
function Price({ value }: { value: string }) {
  return (
    <>
      {value.replace("₽", "")}
      <span className="ruble">₽</span>
    </>
  );
}
export function Tickets() {
  return (
    <section id="tickets" className="section tickets">
      <h2>
        Новый опыт
        <br />
        начинается с участия
      </h2>
      <div className="tickets-grid">
        {[
          ["Индивидуальный", "6 000 ₽", "9 000 ₽", "12 000 ₽"],
          ["На двоих", "10 000 ₽", "15 000 ₽", "20 000 ₽"],
        ].map(([name, price, standard, last], i) => (
          <article className={`ticket ${i ? "ticket--duo" : ""}`} key={name}>
            {i === 1 && <Orbits compact />}
            <div className="ticket-copy">
              <h3>{name}</h3>
              <p className="ticket-price">
                <Price value={price} />
              </p>
              <p>Раннее бронирование — до 13 октября</p>
              <p>
                Стандартный билет — <Price value={standard} />
                <br />В день мероприятия — <Price value={last} />
              </p>
              <ActionLink className="button" destination="booking">
                Купить
              </ActionLink>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
