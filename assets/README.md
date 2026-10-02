# Assets

Drop your real media here. The site already points to these paths and falls back to cinematic placeholders if a file is missing.

## Videos (`assets/videos/`)

| File | Used for |
|------|----------|
| `hero.mp4` | Hero background (muted, loop, cover) |
| `before.mp4` | Before/After — RAW side |
| `after.mp4` | Before/After — FINAL side |
| `khaled.mp4` | Optional about portrait video |
| `project-01.mp4` … `project-06.mp4` | Portfolio previews |

Recommended: H.264, compressed, under ~8–15MB each for web.

## Images (`assets/images/`)

| File | Used for |
|------|----------|
| `logo.png` | Site logo / favicon |
| `og-share.jpg` | Open Graph / Twitter share image (1200×630 recommended) |
| `hero-poster.webp` | Hero poster frame |
| `before-poster.webp` / `after-poster.webp` | Compare posters |
| `khaled.jpg` | About portrait |
| `project-01.webp` … `project-06.webp` | Portfolio thumbnails |

## SEO / domain

Before launch, replace `EXAMPLE.com` in:

- `index.html` (canonical, Open Graph, Twitter, JSON-LD)
- `robots.txt`
- `sitemap.xml`


## Adding projects

Edit the `projects` array in `js/portfolio.js`. Filtering and UI update automatically.
