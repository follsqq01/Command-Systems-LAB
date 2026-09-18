// Geometry regression check using dimensions measured in the in-app browser.
// Refresh design/qa/mobile-refresh/orbit-checks.json after changing copy or fonts.
// No browser automation dependency is required for this full-cycle calculation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const samples = JSON.parse(fs.readFileSync(new URL('./qa/mobile-refresh/orbit-checks.json', import.meta.url)));
for (const sample of samples) {
  assert.equal(sample.width, sample.contentWidth, `Page overflow at ${sample.width}px`);
  for (let step = 0; step < 3600; step++) {
    const phase = step * Math.PI / 1800;
    const boxes = sample.items.map(item => ({
      ...item, x: item.r * Math.cos(item.angle + phase), y: item.r * Math.sin(item.angle + phase),
    }));
    boxes.push({ name: 'Centre heading', x: 0, y: 0, ...sample.heading });
    boxes.forEach((box, i) => {
      boxes.slice(0, i).forEach(other => {
        const overlap = Math.abs(box.x - other.x) < (box.w + other.w) / 2
          && Math.abs(box.y - other.y) < (box.h + other.h) / 2;
        assert.ok(!overlap, `${sample.width}px, ${step / 10}°: ${box.name} / ${other.name}`);
      });
    });
  }
  console.log(`${sample.width}px: 3600 positions, no collisions or page overflow`);
}
