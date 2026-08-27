/**
 * Shared Mobile Image Utilities
 * Provides reusable functions for WebP loading, fallback handling, and touch event management
 */

/**
 * Creates an image element with WebP-first loading and fallback support
 * @param {string} webpSrc - Primary WebP image source
 * @param {string} fallbackSrc - Fallback image source (PNG/JPG)
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - CSS class name
 * @param {string} loading - Loading attribute ('lazy' or 'eager')
 * @param {Object} options - Additional options { aspectRatio, style }
 * @returns {HTMLImageElement} Configured image element
 */
function createOptimizedImage(webpSrc, fallbackSrc, alt, className, loading = 'lazy', options = {}) {
  const img = document.createElement('img');
  
  if (fallbackSrc) {
    img.src = webpSrc;
    img.setAttribute('data-fallback', fallbackSrc);
    img.onerror = function() {
      if (this.getAttribute('data-fallback')) {
        this.src = this.getAttribute('data-fallback');
      }
    };
  } else {
    img.src = webpSrc;
  }
  
  img.alt = alt;
  img.className = className;
  img.loading = loading;
  img.decoding = 'async';
  
  if (options.aspectRatio) {
    img.style.aspectRatio = options.aspectRatio;
  }
  
  if (options.style) {
    Object.assign(img.style, options.style);
  }
  
  return img;
}

/**
 * Applies selective touch event prevention to prevent page scrolling
 * while allowing interactions with specific interactive elements
 * @param {Array<string>} interactiveSelectors - CSS selectors for interactive elements
 */
function setupTouchScrollLock(interactiveSelectors = ['.pinboard-item', '.sticker-item', '.drawing-canvas', '.image-stream-container']) {
  document.addEventListener('touchmove', (e) => {
    // Allow scrolling in mobile menu
    if (e.target.closest('.mobile-menu')) return;
    
    // Allow scrolling in specific interactive containers
    const isInteractive = interactiveSelectors.some(selector => e.target.closest(selector));
    if (isInteractive) return;
    
    // Prevent default scrolling on body
    e.preventDefault();
  }, { passive: false });
}

/**
 * Initializes selective viewport scroll prevention for desktop
 * @param {Array<string>} scrollableSelectors - CSS selectors for scrollable elements
 */
function setupDesktopScrollLock(scrollableSelectors = ['.image-stream-container', '.mobile-menu']) {
  document.addEventListener('touchmove', (e) => {
    const isScrollable = scrollableSelectors.some(selector => e.target.closest(selector));
    if (isScrollable) return;
    e.preventDefault();
  }, { passive: false });
}

/**
 * Mobile 3D transform flattening for performance
 * Apply this CSS to prevent viewport clipping on mobile devices
 */
function getMobileTransformCSS() {
  return `
    @media (max-width: 767px) {
      /* Flatten 3D transforms for mobile performance */
      .mac-window {
        perspective: none !important;
        transform: none !important;
      }
      
      .mac-viewport {
        perspective: none !important;
        transform: none !important;
      }
      
      .mac-content {
        perspective: none !important;
        transform: none !important;
      }
      
      /* Disable GPU-heavy backdrop filters on mobile */
      .mac-window, .glass-info-card, .pen-toolbar, .mobile-menu {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      
      /* Disable edge glow effects on mobile */
      body::after {
        display: none !important;
      }
      
      /* Disable complex drop-shadow filters on mobile */
      .sticker-item, .sticker-item .sticker-image {
        filter: none !important;
      }
      
      /* Hide tab thumbnails on mobile to save memory */
      .mac-tab-thumb {
        display: none !important;
      }
    }
  `;
}

/**
 * WebP fallback handler for lightbox/gallery images
 * @param {HTMLImageElement} img - Image element to configure
 * @param {string} primarySrc - Primary WebP source
 * @param {string} fallbackSrc - Fallback source
 */
function setupWebPFallback(img, primarySrc, fallbackSrc) {
  if (fallbackSrc) {
    img.src = primarySrc;
    img.setAttribute('data-fallback', fallbackSrc);
    img.onerror = function() {
      if (this.getAttribute('data-fallback')) {
        this.src = this.getAttribute('data-fallback');
      }
    };
  } else {
    img.src = primarySrc;
  }
  img.loading = 'eager';
  img.decoding = 'sync';
}

/**
 * Prevents CLS by setting aspect ratio from natural dimensions
 * @param {HTMLImageElement} img - Image element
 */
function setNaturalAspectRatio(img) {
  img.onload = function() {
    if (img.naturalWidth && img.naturalHeight) {
      img.style.aspectRatio = `${img.naturalWidth}/${img.naturalHeight}`;
    }
  };
}

/**
 * Mobile tab thumbnail optimization - prevents loading on mobile
 * @param {HTMLImageElement} tabThumb - Tab thumbnail image element
 * @param {string} src - Image source
 * @param {string} fallback - Fallback source
 */
function setupMobileTabThumb(tabThumb, src, fallback) {
  // Skip setting src on mobile to prevent memory issues in webviews
  if (window.innerWidth > 767) {
    if (fallback) {
      tabThumb.src = src;
      tabThumb.setAttribute('data-fallback', fallback);
      tabThumb.onerror = function() {
        if (this.getAttribute('data-fallback')) {
          this.src = this.getAttribute('data-fallback');
        }
      };
    } else {
      tabThumb.src = src;
    }
  }
  tabThumb.loading = 'lazy';
  tabThumb.decoding = 'async';
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createOptimizedImage,
    setupTouchScrollLock,
    setupDesktopScrollLock,
    getMobileTransformCSS,
    setupWebPFallback,
    setNaturalAspectRatio,
    setupMobileTabThumb
  };
}