import { useEffect, useLayoutEffect, useState, type ChangeEvent } from "react";
import { useScrollStage } from "../interaction";

type Speaker = {
  id: string;
  name: string;
  description: string;
  photo: string;
  fit: "contain" | "cover";
  photoX: number;
  photoY: number;
  zoom: number;
};

const contentUrl = `${import.meta.env.BASE_URL}content/speakers.json`;
const photoUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const speakerEditorEnabled = import.meta.env.DEV && import.meta.env.VITE_SPEAKERS_EDITOR === "1";
const formatDescription = (text: string) => text.trim().replace(/\.+$/, "");

export function Speakers() {
  const { section, stage, track } = useScrollStage("x", 1.3, true);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [draft, setDraft] = useState<Speaker[]>([]);
  const [editing, setEditing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(contentUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw Error("Не удалось загрузить спикеров.");
        return response.json() as Promise<Speaker[]>;
      })
      .then(setSpeakers)
      .catch((error) => setStatus(String(error)));
  }, []);

  useLayoutEffect(() => {
    const cards = Array.from(track.current?.querySelectorAll<HTMLElement>(".speaker-card") ?? []);
    const mobile = matchMedia("(max-width: 900px)");
    const measure = () => {
      for (const card of cards) {
        if (!mobile.matches || editing) {
          card.style.removeProperty("--speaker-photo-size");
          continue;
        }
        const copy = card.querySelector<HTMLElement>(".speaker-copy");
        if (!copy) continue;
        const style = getComputedStyle(card);
        const horizontalPadding = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
        const verticalPadding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
        const availableWidth = card.clientWidth - horizontalPadding;
        const availableHeight = card.clientHeight - verticalPadding - copy.getBoundingClientRect().height - Number.parseFloat(style.rowGap);
        card.style.setProperty("--speaker-photo-size", `${Math.floor(Math.max(0, Math.min(availableWidth, availableHeight)))}px`);
      }
    };
    const observer = new ResizeObserver(measure);
    for (const card of cards) {
      observer.observe(card);
      const copy = card.querySelector(".speaker-copy");
      if (copy) observer.observe(copy);
    }
    mobile.addEventListener("change", measure);
    measure();
    return () => {
      observer.disconnect();
      mobile.removeEventListener("change", measure);
    };
  }, [speakers, draft, editing, track]);

  const visible = editing ? draft : speakers;
  const update = (id: string, values: Partial<Speaker>) =>
    setDraft((cards) => cards.map((card) => card.id === id ? { ...card, ...values } : card));
  const move = (index: number, direction: -1 | 1) =>
    setDraft((cards) => {
      const next = [...cards];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });

  async function upload(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setStatus("Выберите PNG, JPEG или WebP до 8 МБ.");
      return;
    }
    setBusy(true);
    setStatus("Загружаю фотографию…");
    try {
      const response = await fetch("/api/speaker-photo", { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const result = await response.json() as { path?: string; error?: string };
      if (!response.ok || !result.path) throw Error(result.error || "Не удалось загрузить фото.");
      update(id, { photo: result.path, fit: "cover", photoX: 50, photoY: 50, zoom: 1 });
      setStatus("Фото добавлено. Нажмите «Сохранить изменения».");
    } catch (error) {
      setStatus(String(error instanceof Error ? error.message : error));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (draft.some((card) => !card.name.trim() || !card.description.trim() || !card.photo)) {
      setStatus("Заполните имя, описание и фото в каждой карточке.");
      return;
    }
    setBusy(true);
    setStatus("Сохраняю изменения…");
    try {
      const response = await fetch("/api/speakers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft.map((card) => ({ ...card, name: card.name.trim(), description: card.description.trim() }))),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw Error(result.error || "Не удалось сохранить карточки.");
      setSpeakers(draft);
      setEditing(false);
      setStatus("Карточки сохранены в проекте.");
    } catch (error) {
      setStatus(String(error instanceof Error ? error.message : error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section ref={section} id="speakers" className={`scroll-section speakers${editing ? " is-editing" : ""}${paused ? " is-paused" : ""}`} aria-label="Спикеры и эксперты">
      <div ref={stage} className="sticky-stage speakers-stage">
        <div className="section-heading">
          <h2>Спикеры<br />и эксперты</h2>
          <p>На форуме выступят лидеры, которые создают и развивают сильные команды — и готовы делиться не теорией, а реальным опытом.</p>
        </div>
        {speakerEditorEnabled && (
          <div className="speaker-editor-bar">
            {!editing ? (
              <button className="button button--outline" type="button" onClick={() => { setDraft(speakers.map((card) => ({ ...card }))); setEditing(true); setPaused(false); setStatus(""); }}>
                Редактировать спикеров
              </button>
            ) : (
              <>
                <button className="button button--outline" type="button" disabled={busy} onClick={() => {
                  setDraft((cards) => [...cards, { id: crypto.randomUUID().replaceAll("-", ""), name: "", description: "", photo: "", fit: "cover", photoX: 50, photoY: 50, zoom: 1 }]);
                  setStatus("Заполните новую карточку и сохраните изменения.");
                }}>+ Добавить спикера</button>
                <button className="button" type="button" disabled={busy} onClick={save}>Сохранить изменения</button>
                <button className="speaker-text-button" type="button" disabled={busy} onClick={() => { setEditing(false); setStatus(""); }}>Отмена</button>
              </>
            )}
            {status && <span className="speaker-editor-status" role="status">{status}</span>}
          </div>
        )}
        {!editing && <button className="speakers-pause" type="button" aria-pressed={paused} disabled={!speakers.length} onClick={() => setPaused((value) => !value)}>
          <span className="speakers-pause__icon" aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
          {paused ? "Продолжить" : "Пауза"}
        </button>}
        <div className="speakers-window" onClick={(event) => {
          if (!editing && matchMedia("(max-width: 900px)").matches && (event.target as HTMLElement).closest(".speaker-card")) {
            setPaused((value) => !value);
          }
        }}>
          <div ref={track} className="speakers-track" style={{ animationDuration: `${Math.max(36, speakers.length * 7)}s` }}>
            <div className="speakers-marquee-set">
            {visible.map((card, index) => (
              <article className={`speaker-card ${index % 2 ? "speaker-card--reverse" : ""}`} key={card.id}>
                <div className="speaker-copy">
                  {editing ? (
                    <>
                      <input className="speaker-edit-name" aria-label={`Имя спикера ${index + 1}`} placeholder="Имя спикера" maxLength={120} value={card.name} onChange={(event) => update(card.id, { name: event.target.value })} />
                      <textarea className="speaker-edit-description" aria-label={`Описание спикера ${index + 1}`} placeholder="Напишите описание" maxLength={2000} rows={5} value={card.description} onChange={(event) => update(card.id, { description: event.target.value })} />
                    </>
                  ) : (
                    <><h3>{card.name}</h3><p>{formatDescription(card.description)}</p></>
                  )}
                </div>
                <div className="speaker-photo">
                  {card.photo ? <img src={photoUrl(card.photo)} alt={card.name || "Фотография спикера"} style={{ objectFit: card.fit, objectPosition: `${card.photoX}% ${card.photoY}%`, transform: `scale(${card.zoom})`, transformOrigin: `${card.photoX}% ${card.photoY}%` }} /> : <span className="speaker-photo-empty">Фото спикера</span>}
                  {editing && <label className="speaker-photo-change">
                    {card.photo ? "Заменить фото" : "Добавить фото"}
                    <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={(event) => upload(card.id, event)} />
                  </label>}
                </div>
                {editing && <div className="speaker-edit-tools">
                  <div className="speaker-photo-settings">
                    <label>Режим фото
                      <select value={card.fit} onChange={(event) => update(card.id, { fit: event.target.value as Speaker["fit"] })}>
                        <option value="cover">Заполнить круг</option>
                        <option value="contain">Показать целиком</option>
                      </select>
                    </label>
                    <label>По горизонтали <input type="range" min="0" max="100" value={card.photoX} onChange={(event) => update(card.id, { photoX: Number(event.target.value) })} /></label>
                    <label>По вертикали <input type="range" min="0" max="100" value={card.photoY} onChange={(event) => update(card.id, { photoY: Number(event.target.value) })} /></label>
                    <label>Масштаб <input type="range" min="1" max="2.5" step="0.05" value={card.zoom} onChange={(event) => update(card.id, { zoom: Number(event.target.value) })} /></label>
                  </div>
                  <div className="speaker-order-tools">
                    <button type="button" disabled={index === 0 || busy} onClick={() => move(index, -1)} aria-label={`Переместить ${card.name || `карточку ${index + 1}`} влево`}>←</button>
                    <button type="button" disabled={index === visible.length - 1 || busy} onClick={() => move(index, 1)} aria-label={`Переместить ${card.name || `карточку ${index + 1}`} вправо`}>→</button>
                    <button type="button" disabled={busy} onClick={() => setDraft((cards) => cards.filter((item) => item.id !== card.id))}>Удалить</button>
                  </div>
                </div>}
              </article>
            ))}
            </div>
            {!editing && speakers.length > 0 && <div className="speakers-marquee-set speakers-marquee-set--copy" aria-hidden="true">
              {speakers.map((card, index) => (
                <article className={`speaker-card ${index % 2 ? "speaker-card--reverse" : ""}`} key={`copy-${card.id}`}>
                  <div className="speaker-copy"><h3>{card.name}</h3><p>{formatDescription(card.description)}</p></div>
                  <div className="speaker-photo">
                    {card.photo ? <img src={photoUrl(card.photo)} alt="" style={{ objectFit: card.fit, objectPosition: `${card.photoX}% ${card.photoY}%`, transform: `scale(${card.zoom})`, transformOrigin: `${card.photoX}% ${card.photoY}%` }} /> : <span className="speaker-photo-empty">Фото спикера</span>}
                  </div>
                </article>
              ))}
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}
