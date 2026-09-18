import { ActionLink } from "../ActionLink";
export function Invitation() {
  return (
    <section id="invitation" className="section invitation">
      <h2>
        Приходите со своим вопросом —<br />
        будем искать новые решения вместе.
      </h2>
      <ActionLink className="button" destination="tickets">
        Принять участие →
      </ActionLink>
    </section>
  );
}
