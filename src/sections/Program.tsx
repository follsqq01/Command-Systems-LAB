const program = [
  ["12:00–12:30", "Регистрация и welcome-кофе", "", "green"],
  ["12:30–12:45", "Открытие форума", "Екатерина Крайванова", "yellow"],
  [
    "12:45–14:05",
    "TED-выступления",
    "Спикеры: Атасенов Саркиз, Диана Гладких, Губанов Роман",
    "purple",
  ],
  [
    "14:05–15:25",
    "Исследовательская сессия",
    "Модератор: Александр Сычев. Участники: Андрей Завадских, Алексей Никифоров, Алексей Захаров, Роман Адушкин",
    "blue",
  ],
  ["15:25–16:25", "Обед", "", "green"],
  ["16:25–17:40", "Антиконференция + мастерская", "Участники форума", "yellow"],
  ["17:40–17:55", "Закрытие и рефлексия", "Екатерина Крайванова", "green"],
];
export function Program() {
  return (
    <section id="program" className="section program">
      <h2>Программа — 27 октября</h2>
      <ol className="program-list">
        {program.map(([time, title, people, color]) => (
          <li key={time} className="program-row">
            <i className={`dot ${color}`} aria-hidden="true" />
            <span className="program-time">{time}</span>
            <h3>{title}</h3>
            <p>{people}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
