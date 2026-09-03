# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static HTML portfolio site for Bhagyashri Chudji (freelance full-stack developer, Mumbai). No build tooling, no package.json, no framework — plain HTML/CSS/JS served as-is. Production domain: `https://bhagyashribuilds.online`.

## Commands

There is no build, lint, or test step — there's nothing to compile.

To preview locally with working relative asset paths (opening an HTML file directly via `file://` can behave inconsistently for `fetch`/asset loading in some tools):
```bash
python -m http.server 8123
```
then visit `http://localhost:8123/index.html`. A `.claude/launch.json` config (`static-preview`) is already set up to run this via the Browser pane's `preview_start`.

## Architecture

**No templating — every page is a standalone `.html` file.** Nav, footer, floating contact stack, and theme-toggle markup are duplicated by hand across every page. When changing nav links, footer columns, or contact details, you must edit every page individually (currently: `index.html`, `contact.html`, `privacy.html`, `terms.html`, `404.html`, `work/index.html`, and the 4 files in `work/`).

**Shared CSS/JS, page-specific everything else.** `assets/styles.css` and `assets/site.js` hold the entire design system and all interactive behavior (nav scroll elevation, active-link highlighting, theme toggle, mobile nav, FAQ accordion, scroll-reveal, count-up stat animation, and the lead-form → WhatsApp handler). Every page links these with a relative path (`assets/...` from the root, `../assets/...` from inside `work/`). `site.js` guards every feature with an existence check (e.g. `if(!el) return`) so it's safe to include on pages that don't use a given feature.

**Kept inline per page, never moved to the shared files:**
- The theme-flash-avoidance script in `<head>` — must run before first paint, reads `localStorage.theme` and sets `data-theme="dark"` on `<html>` synchronously.
- JSON-LD (`Person` on every page; `WebSite` on `index.html` only; `CreativeWork` + `BreadcrumbList` on `work/` pages) — this is page-specific data, not shared code.

**Theme system:** light is the default (no attribute); dark is `<html data-theme="dark">`, toggled by `#themeToggle` and persisted to `localStorage.theme`. All colors are CSS custom properties on `:root` / `:root[data-theme="dark"]` in `styles.css` — never hardcode a color, use the existing `--ink`, `--accent`, `--panel`, etc.

**Lead form is shared logic, not shared markup.** `index.html` (hero) and `contact.html` both have a `<form id="leadForm">` with identical field IDs (`lf-name`, `lf-contact`, `lf-need`, `lf-msg`). `site.js` binds one handler by ID, so both pages get the same behavior: POST to a Google Apps Script URL (`SCRIPT_URL` constant in `site.js`), then open a prefilled WhatsApp link. If you add the form to a new page, reuse the exact same IDs.

**`/work` case studies:** `work/index.html` lists all case studies; each case study (`work/pricing-payment-integration.html`, `work/aws-cicd-infrastructure.html`, `work/realtime-websocket-application.html`, `work/ai-assisted-search.html`) follows the same structure — breadcrumb, `.case-meta` grid (project type / role / stack), then Business Problem / Solution / My Role / Technical Challenges / Results, then a `.case-cta`. Client work is under NDA: **never name real companies/products, and never invent metrics.** Only two numbers are verified (90% less deployment effort, 60% faster API response, both from the AWS/CI/CD case study) — everything else stays qualitative. This constraint should hold for any new case study added later.

**SEO/technical conventions to keep in sync when adding or removing a page:**
- Add the new URL to `sitemap.xml` (bump `<lastmod>`) and confirm it's allowed by `robots.txt`.
- Every page needs its own `<link rel="canonical">` pointing at its `https://bhagyashribuilds.online/...` URL.
- `og:image`/`twitter:image` must be the **absolute** URL `https://bhagyashribuilds.online/ogimage.png` (the file is `ogimage.png`, not `og-image.png` — a mismatch here previously broke social previews on every page).
- Internal links are relative and file-based (`contact.html`, not `/contact`) since there's no server-side URL rewriting configured — don't introduce extension-less links unless clean-URL rewrites are confirmed on the hosting platform.
