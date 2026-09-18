import { asset } from "../assets";
export function Gallery() {
  return (
    <section id="gallery" className="section gallery">
      <h2>Как это было?</h2>
      <div className="gallery-grid">
        {[
          ["811fa.png", "Участники в конференц-зале"],
          ["0d7b2.png", "Выступление спикера на сцене"],
          ["a95af.png", "Спикер с микрофоном"],
          ["efe24.png", "Кофе и угощения для участников"],
        ].map(([file, alt]) => (
          <img key={file} src={asset(file)} alt={alt} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
