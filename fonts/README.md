# Fonts

The site is set up to use **Helvetica Now Display Regular**, with a fallback
to Helvetica Neue / system sans-serif if it's not present.

Helvetica Now Display is a commercial Monotype font — it isn't bundled with
browsers or this project. To activate it:

1. Export/license the font files (`.woff2` and `.woff` are ideal for web).
2. Drop them in this folder named:
   - `HelveticaNowDisplay-Regular.woff2`
   - `HelveticaNowDisplay-Regular.woff`
3. That's it — `css/styles.css` already has the `@font-face` rule pointing
   here. Reload the page and the real typeface will load.

If you have other weights (Medium, Bold, etc.) and want to use them, add
additional `@font-face` blocks in `styles.css` following the same pattern
with a different `font-weight` value.

Until these files are added, the site falls back to Helvetica Neue, which
looks very close.
