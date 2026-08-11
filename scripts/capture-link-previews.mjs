// Captures a screenshot of every page the site links to and writes
// previews/manifest.json mapping href -> { image, title }. The hover cards in
// js/components/link-preview.js read that manifest.
//
// Run with the local server up:  python3 -m http.server 8000  then
//   npm run previews
// Re-run any time to refresh the snapshots (new links are picked up
// automatically; stale images are overwritten).
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import { navItems } from '../js/site-config.js';

const baseURL = process.env.SITE_URL || 'http://127.0.0.1:8000';
const outputDir = path.resolve(process.cwd(), 'previews');
const VIEWPORT = { width: 1024, height: 640 };
// Headless Chrome's default UA gets bot-walled by some sites; use a normal one.
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

async function collectHrefs() {
  const hrefs = new Set();
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['node_modules', 'previews', 'fonts', 'logs'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.name.endsWith('.html')) {
        const content = (await fs.readFile(full, 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
        for (const match of content.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
          const href = match[1];
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')) {
            hrefs.add(href);
          }
        }
      }
    }
  }
  await walk(process.cwd());
  // The header nav is rendered by JS, so its links never appear in the HTML.
  for (const item of navItems) {
    if (item.href.startsWith('http') || item.href.startsWith('/')) {
      hrefs.add(item.href);
    }
  }
  return [...hrefs];
}

function slugFor(href) {
  const clean = href.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  const hash = crypto.createHash('sha1').update(href).digest('hex').slice(0, 8);
  return `${clean || 'link'}-${hash}`;
}

async function capture(browser, href, manifest) {
  let target = href.startsWith('/') ? new URL(href, baseURL).toString() : href;
  // PDF URLs download instead of rendering; for arXiv, snapshot the abstract page.
  target = target.replace(/arxiv\.org\/pdf\//, 'arxiv.org/abs/');
  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: USER_AGENT,
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const slug = slugFor(href);
  const file = `${slug}.jpg`;

  try {
    await page.goto(target, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(2000); // let fonts/animations settle
    await page.screenshot({ path: path.join(outputDir, file), type: 'jpeg', quality: 70 });
    const title = (await page.title().catch(() => '')) || new URL(target).hostname;
    manifest[href] = { image: `/previews/${file}`, title, capturedAt: new Date().toISOString() };
    console.log(`ok    ${href}  ->  ${file}  (${title.slice(0, 60)})`);
  } catch (error) {
    console.log(`FAIL  ${href}  (${String(error).split('\n')[0].slice(0, 100)})`);
  } finally {
    await context.close();
  }
}

const hrefs = await collectHrefs();
console.log(`Found ${hrefs.length} unique link targets`);
await fs.mkdir(outputDir, { recursive: true });

let manifest = {};
try {
  manifest = JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.json'), 'utf8'));
} catch { /* first run */ }

const browser = await chromium.launch({ headless: true });
try {
  for (const href of hrefs) {
    await capture(browser, href, manifest);
  }
} finally {
  await browser.close();
}

// Drop manifest entries for links that no longer exist anywhere on the site.
for (const key of Object.keys(manifest)) {
  if (!hrefs.includes(key)) delete manifest[key];
}

await fs.writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`Wrote ${outputDir}/manifest.json with ${Object.keys(manifest).length} entries`);

// Delete snapshot images no manifest entry references anymore.
const referenced = new Set(Object.values(manifest).map((entry) => path.basename(entry.image)));
for (const file of await fs.readdir(outputDir)) {
  if (file.endsWith('.jpg') && !referenced.has(file)) {
    await fs.unlink(path.join(outputDir, file));
    console.log(`pruned ${file}`);
  }
}
