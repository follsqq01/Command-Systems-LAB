# Performance block, page order and reveal footer QA

- References: the three screenshots supplied on 23 September 2026 for the “Кто мы?” section, end-of-page section order, and curved logo footer.
- Prototype: `http://127.0.0.1:4175/#performance`.
- Desktop visual check: 1568 × 1000 in the Codex in-app browser.
- Mobile visual check: 390 × 844 in the Codex in-app browser.

The performance section uses a centered logo, title and description above a 2:1 photo grid. The approved copy names Импресарио Федора Елютина. The final section order is speakers, performance, tickets, benefits, gallery, footer.

The footer is revealed below a single curved gallery edge. The logo stage stays at the viewport bottom during the reveal without adding scrolling space. Footer height is capped at 400 px on desktop and is 220 px on mobile. Reduced-motion visitors get the final composition without the scroll transform.

At 390 px the performance heading becomes one column, all three photos remain uncropped inside the existing responsive layout, and the footer logos fit within the viewport. `documentElement.scrollWidth` equals `clientWidth` (390 px), so the changes add no page-wide horizontal overflow.

The performance is included in the shared agenda from 18:00 to 19:00. At 1512 × 982 and 1440 × 800, the desktop agenda occupies exactly one viewport; its last three rows have equal heights. The research session retains extra room for its longer description. The mobile ticket decoration emerges from the upper-right corner; its full orbit was checked against the text at 320 px. Desktop ticket decoration retains its original dimensions and placement.

The production build passes with `tsc --noEmit` and Vite.

final result: passed
