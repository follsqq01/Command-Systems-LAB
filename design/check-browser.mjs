import { chromium } from '/tmp/hr-forum-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const output = path.resolve(import.meta.dirname, 'qa');
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1512, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
await page.goto(process.env.HR_FORUM_URL ?? 'http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
await page.screenshot({ path: path.join(output, 'desktop-hero.png'), clip: { x: 0, y: 0, width: 1512, height: 709 } });
const desktop = await page.evaluate(() => ({
  viewport: innerWidth,
  contentWidth: document.documentElement.scrollWidth,
  height: document.documentElement.scrollHeight,
  fonts: [...document.fonts].map(f => ({ family: f.family, weight: f.weight, status: f.status })),
  brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
  links: [...document.querySelectorAll('a')].map(a => ({ text: a.textContent.trim(), href: a.getAttribute('href') })),
  sections: [...document.querySelectorAll('section,header')].map(s => ({id:s.id, top:s.getBoundingClientRect().top, height:s.getBoundingClientRect().height})),
}));
await page.getByRole('link', { name: 'Спикеры', exact: true }).click();
await page.waitForTimeout(700);
const navigation = await page.evaluate(() => ({ hash: location.hash, speakersTop: document.getElementById('speakers').getBoundingClientRect().top }));
await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
await page.getByRole('link', { name: 'Принять участие', exact: true }).first().click();
await page.waitForTimeout(700);
const ticketsNavigation = await page.evaluate(() => ({ hash: location.hash, ticketsTop: document.getElementById('tickets').getBoundingClientRect().top }));
const smallViewports = [];
for (const width of [1280, 768, 390]) {
  await page.setViewportSize({ width, height: 844 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(100);
  smallViewports.push(await page.evaluate(() => ({width:innerWidth, contentWidth:document.documentElement.scrollWidth, height:document.documentElement.scrollHeight})));
  if (width === 390) await page.screenshot({ path: path.join(output, 'mobile.png'), fullPage: true });
}
const report = { errors, desktop, navigation, ticketsNavigation, smallViewports };
fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (errors.length || desktop.brokenImages.length || smallViewports.some(v => v.width !== v.contentWidth)) process.exitCode = 1;
