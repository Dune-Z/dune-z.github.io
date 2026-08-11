# Modular Site Components + Paper-Style Blog Posts — Design

**Date:** 2026-08-10
**Goal:** Restructure the site's CSS/JS into small, reusable modules *without changing any visible content or rendering*, and add a blog-post kit that mimics the typography of arXiv:2605.29157 (Parallax), including interactive figures and the site's animated link highlighter.

## Constraints

- No build step, no framework. The site stays hand-editable static HTML served by GitHub Pages.
- Existing pages must render pixel-identically (verified by computed-style dumps + screenshots before/after).
- Visible text content is untouched.

## Architecture

### CSS — one aggregator, four modules

`css/style.css` becomes an `@import` aggregator so every page keeps its single
`<link href="/css/style.css">`. Modules:

| File | Responsibility |
|---|---|
| `css/base.css` | Page chrome: body, `main` card, headings, code, tables, legacy classes |
| `css/header.css` | Site header/nav/footer |
| `css/links.css` | Every link flavor + the floating link-highlight styles + `.mono-link` utilities |
| `css/post.css` | Paper-style post typography (scoped under `.post`) |
| `css/figures.css` | `[data-animate]` scroll-reveal states + `.post-figure` layout |
| `css/fonts.css` | Unchanged; still linked separately by pages |

New reusable classes replacing `index.html` inline styles (rendering identical):

- `.mono-link` — Latin Modern Mono, 0.9em, no underline (organization/person links)
- `.mono-link--95` — 0.95em variant
- `.northwestern-link` absorbs its one-off inline styles (mono, 0.95em, underlined)
- `.material-link` moves from an inline `<style>` block into `links.css`
- `.paper-link` — new blue reference-style link matching the paper's link color; participates in the animated highlighter

### JS — ES modules, same entry path

`<script defer src="/js/site.js">` becomes `<script type="module" src="/js/site.js">` on every page. Modules:

| File | Responsibility |
|---|---|
| `js/site.js` | Entry: wires everything on DOM ready |
| `js/site-config.js` | Site identity + nav items (edit here to change nav) |
| `js/utils/dom.js` | `escapeHtml` |
| `js/components/header.js` | Header renderer |
| `js/components/footer.js` | Footer renderer |
| `js/components/shared-scripts.js` | MathJax / math-code / center-img loaders |
| `js/components/link-highlight.js` | The spring-follow link highlighter. `ANIMATED_LINK_SELECTOR` is the single place to register new link flavors |
| `js/components/figure.js` | IntersectionObserver scroll-reveal for `[data-animate]`, reduced-motion aware |

Logic is moved verbatim from the old `site.js`; no behavior changes. Cache-busting `?v=` bumps to `20260810` (module imports rely on GitHub Pages' 10-minute max-age).

### Paper-style post kit

A post is a folder `posts/<slug>/index.html` with `<main class="post">`. Copy
`posts/template/` to start; it is itself a rendered demo of every feature.

Typography mimicking the paper:

- `.post-title`, `.post-authors`, section headings, and all `strong`/`b` render in **Latin Modern Sans bold** (fonts already shipped in `/fonts`).
- `h2`/`h3` are auto-numbered (`1`, `1.1`) with CSS counters — no borders/small-caps inside posts.
- `.post-header` is the rounded light card holding title, authors, affiliations, abstract, and a `Date / Code / Correspondence` meta grid, like the paper's first page.
- Figure captions auto-label as sans-bold "Figure N:".
- Body text keeps the site's existing serif stack; MathJax already loads site-wide.

Interactivity:

- `data-animate="fade-up|fade|zoom"` on any element (typically figures) reveals it on scroll; `data-animate-delay` staggers. Falls back to visible for reduced-motion users and browsers without IntersectionObserver.
- Fully interactive figures are inline SVG + a small per-post `<script type="module">`; the template ships a working example (kernel-bandwidth demo).
- Links inside posts use the existing animated highlighter (`.custom-link`, `.arxiv-link`, new `.paper-link`) — the same spring animation as the homepage.

### Link previews (added same day)

Hovering (or keyboard-focusing) any link shows a floating snapshot card of the
destination. Live iframe embeds are impossible for most external targets
(X-Frame-Options / CSP frame-ancestors), so previews are pre-captured:

- `npm run previews` (`scripts/capture-link-previews.mjs`) scans every HTML
  file for link targets, screenshots each destination at 1024×640, and writes
  `previews/<slug>.jpg` + `previews/manifest.json` (href → image/title).
  arXiv `/pdf/` links snapshot their `/abs/` page. Re-run it after adding
  links; entries for removed links are pruned automatically.
- `js/components/link-preview.js` + `css/link-preview.css` render the card:
  700 ms hover dwell before every show (no fast-swap between links), flips
  below the link when there's no room above, mouse/keyboard only (hidden on
  touch), reduced-motion aware. Links without a manifest entry show no card.

### Verification

- `scripts/capture-screenshots.mjs` gains the `/posts/template/` page.
- Before/after computed-style dump of all elements on all existing pages must diff clean.

## Rejected alternatives

- **Static site generator (Hugo/Eleventy/Astro):** heavier than needed; the user hand-edits HTML and the ask was modular components, not a toolchain.
- **Web Components:** more indirection than the existing `#site-header` + renderer pattern warrants.
