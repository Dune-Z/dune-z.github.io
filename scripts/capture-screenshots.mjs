import { chromium, devices } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const baseURL = process.env.SITE_URL || 'http://127.0.0.1:8000';
const outputDir = path.resolve(process.cwd(), '.screenshots');

const pages = [
  { name: 'home', path: '/' },
  { name: 'categories', path: '/categories/' },
  { name: 'tags', path: '/tags/' },
  { name: 'posts', path: '/posts/' },
  { name: 'post-template', path: '/posts/template/' },
  { name: 'not-found', path: '/404.html' }
];

const viewports = [
  {
    suffix: 'desktop',
    options: {
      viewport: { width: 1440, height: 1100 },
      deviceScaleFactor: 1
    }
  },
  {
    suffix: 'mobile',
    options: {
      ...devices['iPhone 13']
    }
  }
];

async function ensureCleanOutputDir() {
  await fs.mkdir(outputDir, { recursive: true });
  const entries = await fs.readdir(outputDir, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
      .map((entry) => fs.unlink(path.join(outputDir, entry.name)))
  );
}

async function capturePage(browser, pageDef, viewportDef) {
  const context = await browser.newContext(viewportDef.options);
  const page = await context.newPage();
  const targetUrl = new URL(pageDef.path, baseURL).toString();

  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: path.join(outputDir, `${pageDef.name}-${viewportDef.suffix}.png`),
    fullPage: true
  });

  await context.close();
}

async function main() {
  await ensureCleanOutputDir();
  const browser = await chromium.launch({ headless: true });

  try {
    for (const pageDef of pages) {
      for (const viewportDef of viewports) {
        await capturePage(browser, pageDef, viewportDef);
      }
    }

    console.log(`Saved screenshots to ${outputDir}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
