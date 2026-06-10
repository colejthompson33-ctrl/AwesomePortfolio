# Portfolio

Plain HTML/CSS site — no build step, no dependencies. Open `index.html`
directly in a browser, or serve the folder with any static server.

## Structure

```
portfolio/
├── index.html        Home — canyon photo, category nav
├── about.html         About — sky photo, Experience/Resume nav
├── experience.html     Experience detail — heading + copy + back link
├── css/styles.css     All styles (colors, layout, type)
└── images/
    ├── canyon.jpg      placeholder — replace with your real export
    └── sky.jpg         placeholder — replace with your real export
```

## Replacing placeholder images

The two images in `images/` are flat color-gradient placeholders standing
in for your Figma photo exports. Export the real photos from Figma at full
resolution (JPG, ~2400px wide is plenty for a full-bleed background) and
overwrite `images/canyon.jpg` and `images/sky.jpg` with the same filenames —
no code changes needed.

## Adding more pages

`index.html` already links to category pages that don't exist yet
(`graphic-design.html`, `agency-work.html`, `branding.html`, `concert.html`,
`ui-ux.html`), and `about.html` links to `resume.html`. Copy `experience.html`
as a starting template for any of these — same `.hero` + `.panel` /
`.nav-overlay` pattern, just swap the breadcrumb, background class
(`hero-canyon` / `hero-sky`, or add a new background image + CSS class), and
content.

## Local preview

```bash
# from the portfolio/ folder
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

1. Push this folder to a GitHub repo.
2. Connect the repo to Vercel, Netlify, or Cloudflare Pages — no build
   command needed (or set output directory to `portfolio` if it's nested
   in a larger repo).
3. Point your custom domain's DNS at the host (they'll give you the exact
   records).
