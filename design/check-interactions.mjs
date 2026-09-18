import { chromium } from "/tmp/hr-forum-browser/node_modules/playwright/index.mjs";
import fs from "node:fs";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const output = new URL("./qa/", import.meta.url).pathname;
const results = [];
const errors = [];
for (const [width, height] of [
  [1512, 982],
  [1280, 720],
  [768, 1024],
  [390, 844],
  [320, 568],
  [844, 390],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    isMobile: width < height,
    hasTouch: width < height,
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4175/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    overflow: document.documentElement.scrollWidth > innerWidth,
    program: {
      height: document.querySelector("#program").clientHeight,
      lastBottom:
        document
          .querySelector(".program-row:last-child")
          .getBoundingClientRect().bottom -
        document.querySelector("#program").getBoundingClientRect().top,
    },
    overflowingText: [
      ...document.querySelectorAll(
        ".change-card__face, .format-card, .speaker-card",
      ),
    ]
      .filter((e) => e.scrollHeight > e.clientHeight + 2)
      .map((e) => e.className),
  }));
  const scrollSection = async (id, progress = 0) => {
    await page.evaluate(
      ({ id, progress }) => {
        const section = document.getElementById(id);
        scrollTo({
          top:
            section.offsetTop + (section.clientHeight - innerHeight) * progress,
          behavior: "instant",
        });
      },
      { id, progress },
    );
    await page.waitForTimeout(120);
  };
  await scrollSection("changes");
  const card = page.locator(".change-card").first();
  if (width < height) await card.tap();
  else await card.hover();
  await page.waitForTimeout(700);
  result.flip = await card.getAttribute("aria-pressed");
  await page.screenshot({ path: `${output}changes-${width}.png` });
  await scrollSection("format-map");
  const chip = page.locator(".map-chip").first();
  const original = await chip.boundingBox();
  await page.mouse.move(
    original.x + original.width / 2,
    original.y + original.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    original.x + original.width / 2 + width * 0.12,
    original.y + original.height / 2 + height * 0.04,
    { steps: 12 },
  );
  result.lift = await chip.evaluate((e) => e.classList.contains("is-held"));
  await page.mouse.up();
  const moved = await chip.boundingBox();
  result.drag = Math.abs(moved.x - original.x) > 10;
  for (const id of ["formats", "speakers"]) {
    await scrollSection(id, 0.5);
    result[id] = await page
      .locator(`#${id} .sticky-stage`)
      .evaluate((e) => ({
        top: e.getBoundingClientRect().top,
        transform: e.querySelector('[class$="-track"]').style.transform,
      }));
    if ([1512, 390].includes(width))
      await page.screenshot({ path: `${output}${id}-${width}.png` });
    await scrollSection(id, 1);
    result[`${id}End`] = await page.locator(`#${id}`).evaluate((e) => {
      const last = e
        .querySelector("article:last-child")
        .getBoundingClientRect();
      return {
        bottom: last.bottom,
        right: last.right,
        viewportHeight: innerHeight,
        viewportWidth: innerWidth,
      };
    });
  }
  await scrollSection("program");
  if ([1512, 390, 320].includes(width))
    await page.screenshot({ path: `${output}program-${width}.png` });
  await scrollSection("tickets");
  await page.locator("#gallery").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.images].every((i) => i.complete),
  );
  result.brokenImages = await page.evaluate(() =>
    [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src),
  );
  await scrollSection("tickets");
  if ([1512, 390].includes(width))
    await page.screenshot({ path: `${output}tickets-${width}.png` });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  if ([1512, 390].includes(width))
    await page.screenshot({
      path: `${output}page-${width}.png`,
      fullPage: true,
    });
  await page.close();
  results.push(result);
}
const reduced = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
await reduced.goto("http://127.0.0.1:4175/", { waitUntil: "networkidle" });
results.push({
  reducedMotion: await reduced
    .locator(".sticky-stage")
    .first()
    .evaluate((e) => getComputedStyle(e).position),
});
fs.writeFileSync(
  `${output}interactions.json`,
  JSON.stringify({ errors, results }, null, 2),
);
console.log(JSON.stringify({ errors, results }, null, 2));
await browser.close();
