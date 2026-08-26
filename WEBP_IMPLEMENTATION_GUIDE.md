# WebP Image Optimization Implementation Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install sharp
```

### 2. Run Optimization Script
```bash
node optimize-images-webp.js
```

### 3. Update HTML with WebP Sources

#### Method 1: Using `<picture>` Tags (Recommended)
```html
<picture>
  <source srcset="images/your-image.webp" type="image/webp">
  <source srcset="images/your-image-mobile.webp" media="(max-width: 768px)" type="image/webp">
  <img src="images/your-image.jpg" alt="Description" loading="lazy" decoding="async">
</picture>
```

#### Method 2: Using `srcset` with Fallback
```html
<img 
  src="images/your-image.jpg" 
  srcset="images/your-image.webp 1x, images/your-image-mobile.webp 1x"
  alt="Description" 
  loading="lazy" 
  decoding="async"
  width="800" 
  height="600"
>
```

#### Method 3: JavaScript Fallback (For Dynamic Images)
```javascript
const img = document.createElement('img');
img.src = 'images/your-image.webp';
img.setAttribute('data-fallback', 'images/your-image.jpg');
img.onerror = function() {
  if (this.getAttribute('data-fallback')) {
    this.src = this.getAttribute('data-fallback');
  }
};
img.loading = 'lazy';
img.decoding = 'async';
img.alt = 'Description';
```

## Performance Guidelines

### Mobile First Approach
- **Mobile devices**: Serve WebP images with max-width of 800px
- **Desktop devices**: Serve full-resolution WebP images
- **Fallback**: Always include original JPEG/PNG for older browsers

### Quality Settings
- **General WebP Quality**: 75-80% (good balance of compression vs quality)
- **Funstickers (with transparency)**: 95% quality with alpha transparency enabled
- **File Size Reduction**: Typically 25-35% smaller than JPEG
- **Browser Support**: WebP supported by 95%+ of modern browsers

### Loading Priorities
- **Hero Images**: Use `fetchpriority="high"` for above-the-fold images
- **Content Images**: Use `loading="lazy"` for below-the-fold images
- **Decoding**: Always use `decoding="async"` for non-critical images

## Preventing Layout Shifts (CLS)

### Method 1: Explicit Dimensions
```html
<img 
  src="image.webp" 
  width="800" 
  height="600" 
  loading="lazy"
  decoding="async"
>
```

### Method 2: CSS Object-Fit
```css
img {
  object-fit: contain;
  width: 100%;
  height: auto;
}
```

### Method 3: Container with Padding
```css
.image-container {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 aspect ratio */
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

## Image Quality & Aspect Ratio Fixes

### For Sticker/Fun Images (fun.html)
- **CSS**: Use `object-fit: contain` to preserve native aspect ratios
- **JavaScript**: Remove forced aspect-ratio setting to let browser handle natural dimensions
- **Conversion**: Use high-quality WebP (95%+) with alpha transparency for PNG stickers
- **No Clipping**: Ensure images maintain original proportions without cropping

### Conversion Settings
```javascript
// High-quality WebP with transparency (for funstickers)
await sharp(inputPath)
  .webp({ 
    quality: 95,
    alphaQuality: 95,
    effort: 6
  })
  .toFile(outputPath);
```

## Browser Compatibility

### WebP Support
- Chrome: 32+
- Firefox: 65+
- Safari: 14+
- Edge: 18+
- Opera: 19+

### Fallback Strategy
Always include JPEG/PNG fallback for:
- IE11 (no WebP support)
- Older Safari versions
- Low-bandwidth connections

## Monitoring Performance

### Key Metrics to Track
- **Largest Contentful Paint (LCP)**: Should be < 2.5s
- **Cumulative Layout Shift (CLS)**: Should be < 0.1
- **First Contentful Paint (FCP)**: Should be < 1.8s

### Testing Tools
- Google PageSpeed Insights
- Lighthouse (Chrome DevTools)
- WebPageTest.org

## Manual Conversion (Alternative)

If you prefer manual conversion using command-line tools:

### Using cwebp (WebP official tool)
```bash
# Install
brew install webp  # macOS
apt-get install webp  # Ubuntu/Debian

# Convert single image (high quality with transparency)
cwebp -q 95 -alpha_q 95 input.png -o output.webp

# Convert with max width for mobile
cwebp -q 95 -resize 800 0 input.jpg -o output-mobile.webp
```

### Using ImageMagick
```bash
# Install
brew install imagemagick  # macOS
apt-get install imagemagick  # Ubuntu/Debian

# Convert with transparency
convert input.png -quality 95 -define webp:lossless=false output.webp
```

## Implementation Checklist

- [ ] Run optimization script to generate WebP versions
- [ ] Update hero images with `fetchpriority="high"`
- [ ] Add `loading="lazy"` and `decoding="async"` to all non-hero images
- [ ] Implement `<picture>` tags or srcset for responsive images
- [ ] Add `object-fit: contain` to sticker images to prevent clipping
- [ ] Remove forced aspect-ratio JavaScript for fun stickers
- [ ] Test on mobile devices for performance improvements
- [ ] Verify fallback behavior on older browsers
- [ ] Check image quality and transparency preservation
- [ ] Monitor Core Web Vitals after deployment