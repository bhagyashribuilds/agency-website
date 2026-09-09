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

**No templating — every page is a standalone `.html` file.** Nav, footer, floating contact stack, and theme-toggle markup are duplicated by hand across every page. When changing nav links, footer columns, or contact details, you must edit every page individually (currently: `index.html`, `contact.html`, `privacy.html`, `terms.html`, `404.html`, `work/index.html` plus the 4 case studies in `work/`, `services/index.html` plus the 6 service pages in `services/`, and `blog/index.html` plus each article in `blog/`).

Two nav variants exist: `index.html` has the full nav with in-page anchor links, a mobile burger panel, and the LinkedIn icon; every inner page (`work/`, `services/`, `contact.html`, the legal pages) uses a reduced nav — brand link home, theme toggle, and the primary CTA only. Inner pages rely on the breadcrumb and footer for navigation. Follow the reduced variant on any new inner page. `404.html` is the exception with a minimal footer and no Services column.

**Shared CSS/JS, page-specific everything else.** `assets/styles.css` and `assets/site.js` hold the entire design system and all interactive behavior (nav scroll elevation, active-link highlighting, theme toggle, mobile nav, FAQ accordion, scroll-reveal, count-up stat animation, and the lead-form → WhatsApp handler). Every page links these with a relative path (`assets/...` from the root, `../assets/...` from inside `work/`). `site.js` guards every feature with an existence check (e.g. `if(!el) return`) so it's safe to include on pages that don't use a given feature.

**Kept inline per page, never moved to the shared files:**
- The theme-flash-avoidance script in `<head>` — must run before first paint, reads `localStorage.theme` and sets `data-theme="dark"` on `<html>` synchronously.
- JSON-LD (`Person` on every page; `WebSite` on `index.html` only; `CreativeWork` + `BreadcrumbList` on `work/` pages) — this is page-specific data, not shared code.

**Theme system:** light is the default (no attribute); dark is `<html data-theme="dark">`, toggled by `#themeToggle` and persisted to `localStorage.theme`. All colors are CSS custom properties on `:root` / `:root[data-theme="dark"]` in `styles.css` — never hardcode a color, use the existing `--ink`, `--accent`, `--panel`, etc.

**Lead form is shared logic, not shared markup.** `index.html` (hero) and `contact.html` both have a `<form id="leadForm">` with identical field IDs (`lf-name`, `lf-contact`, `lf-need`, `lf-msg`). `site.js` binds one handler by ID, so both pages get the same behavior: POST to a Google Apps Script URL (`SCRIPT_URL` constant in `site.js`), then open a prefilled WhatsApp link. If you add the form to a new page, reuse the exact same IDs.

**`/services` pages:** `services/index.html` is the hub (a `.service-grid` of all six); each service page (`website-development`, `web-application-development`, `backend-api-development`, `website-redesign`, `technical-seo`, `maintenance-support`) follows the same structure — breadcrumb, kicker, H1, intro, a `.case-meta` grid (engagement size / timeline or background / tech), `.legal-content` prose sections, an optional `.service-grid` of related case studies, a `.faq-list`, then a `.case-cta`. Each carries `Person` + `Service` + `BreadcrumbList` + `FAQPage` JSON-LD; the hub carries `Person` + `BreadcrumbList` only (no FAQ on it).

The same honesty constraints as the case studies apply here: **no invented metrics, no guaranteed-ranking claims, and no pricing numbers** — the only figures used anywhere are the two verified ones (90% less deployment effort, 60% faster API response). Service pages state limits plainly (solo freelancer, no 24/7 cover, no ranking guarantees); keep that voice on any new one.

FAQ answers are capped by `.faq-item.open .faq-a{ max-height:400px }` in `styles.css`, and `overflow:hidden` silently clips anything taller. The tallest answer today is ~237px at a 375px viewport — if you add a longer one, re-measure at mobile width and raise the cap rather than letting it clip.

**`/blog`:** `blog/index.html` lists articles using `.post-list` / `.post-item` — a **row list, not a card grid**. This is deliberate: `.service-grid` is a fixed 3-column grid, so a single post leaves an obviously broken two-thirds gap. The row list reads correctly at any article count. Each row is a left meta column (category, date, reading time) and a right column (title link, excerpt, "Read the article →"), collapsing to one column under 700px.

Articles live flat at `blog/<slug>.html` — **no category subdirectories.** The audit specced `/blog/<category>/` index pages, but four near-empty category pages next to one article is exactly the thin-content pattern the same audit warns against. Add them once there's enough per category to justify one.

Each article carries `Person` + `Article` + `BreadcrumbList` JSON-LD (`datePublished`/`dateModified` in `YYYY-MM-DD`); the index carries `Person` + `Blog` + `BreadcrumbList`. Article body prose uses `.legal-content`, the meta strip uses `.case-meta`, and the closing CTA uses `.case-cta` — same as service and case-study pages.

Article constraints, same as everywhere else: **no invented statistics, no fabricated client anecdotes, and no pricing figures.** Article #1 is about pricing and deliberately contains no numbers — it explains what drives cost instead, and says plainly why it won't quote a figure. Keep 1–3 in-context internal links per article pointing at the relevant service page; more than that reads as link-stuffing.

**`/work` case studies:** `work/index.html` lists all case studies; each case study (`work/pricing-payment-integration.html`, `work/aws-cicd-infrastructure.html`, `work/realtime-websocket-application.html`, `work/ai-assisted-search.html`) follows the same structure — breadcrumb, `.case-meta` grid (project type / role / stack), then Business Problem / Solution / My Role / Technical Challenges / Results, then a `.case-cta`. Client work is under NDA: **never name real companies/products, and never invent metrics.** Only two numbers are verified (90% less deployment effort, 60% faster API response, both from the AWS/CI/CD case study) — everything else stays qualitative. This constraint should hold for any new case study added later.

**SEO/technical conventions to keep in sync when adding or removing a page:**
- Add the new URL to `sitemap.xml` (bump `<lastmod>`) and confirm it's allowed by `robots.txt`.
- Every page needs its own `<link rel="canonical">` pointing at its `https://bhagyashribuilds.online/...` URL.
- `og:image`/`twitter:image` must be the **absolute** URL `https://bhagyashribuilds.online/ogimage.png` (the file is `ogimage.png`, not `og-image.png` — a mismatch here previously broke social previews on every page).
- Internal links are relative and file-based (`contact.html`, not `/contact`) since there's no server-side URL rewriting configured — don't introduce extension-less links unless clean-URL rewrites are confirmed on the hosting platform.
