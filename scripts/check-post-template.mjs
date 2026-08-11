// Scroll through the post template, verify reveals + interactivity, screenshot figures.
import { chromium } from 'playwright';

const baseURL = process.env.SITE_URL || 'http://127.0.0.1:8000';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto(baseURL + '/posts/template/', { waitUntil: 'networkidle' });

// Scroll to first figure, wait for reveal
const fig1 = page.locator('.post-figure').first();
await fig1.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
const fig1Revealed = await fig1.evaluate((el) => el.classList.contains('is-revealed'));
const fig1Opacity = await fig1.evaluate((el) => getComputedStyle(el).opacity);
console.log('figure1 revealed:', fig1Revealed, 'opacity:', fig1Opacity);
await fig1.screenshot({ path: '.screenshots/post-figure1.png' });

// Scroll to interactive figure
const fig2 = page.locator('#kernel-demo');
await fig2.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
console.log('figure2 revealed:', await fig2.evaluate((el) => el.classList.contains('is-revealed')));

const readoutBefore = await page.locator('#kernel-readout').textContent();
// Move pointer across the plot
const svgBox = await page.locator('#kernel-svg').boundingBox();
await page.mouse.move(svgBox.x + svgBox.width * 0.25, svgBox.y + svgBox.height * 0.5);
await page.waitForTimeout(200);
const readoutAfterPointer = await page.locator('#kernel-readout').textContent();
// Drag the slider
await page.locator('#kernel-bandwidth').fill('120');
await page.waitForTimeout(200);
const readoutAfterSlider = await page.locator('#kernel-readout').textContent();
console.log('readout:', JSON.stringify(readoutBefore), '->', JSON.stringify(readoutAfterPointer), '->', JSON.stringify(readoutAfterSlider));
await fig2.screenshot({ path: '.screenshots/post-figure2.png' });

// Caption auto-labels
const caption = await page.locator('.post-figure figcaption').first().evaluate((el) => getComputedStyle(el, '::before').content);
console.log('caption ::before content:', caption);

// Link highlighter present + hover works on a paper-link
await page.locator('.paper-link').first().scrollIntoViewIfNeeded();
await page.locator('.paper-link').first().hover();
await page.waitForTimeout(600);
console.log('highlight visible:', await page.locator('.link-highlight').evaluate((el) => el.classList.contains('is-visible')));

console.log('errors:', errors.length ? errors : 'none');
await browser.close();
