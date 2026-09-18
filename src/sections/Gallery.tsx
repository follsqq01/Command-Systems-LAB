import { asset } from "../assets";
export function Gallery() {
  return (
    <section id="gallery" className="section gallery">
      <h2>Как это было?</h2>
      <div className="gallery-grid">
        {[
          ["811fa.webp", "Участники в конференц-зале"],
          ["0d7b2.webp", "Выступление спикера на сцене"],
          ["a95af.webp", "Спикер с микрофоном"],
          ["efe24.webp", "Кофе и угощения для участников"],
        ].map(([file, alt]) => (
          <img key={file} src={asset(file)} alt={alt} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
