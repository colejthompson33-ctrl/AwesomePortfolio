#!/usr/bin/env node

/**
 * Update Image References Script
 * Updates all HTML and JavaScript image references to use optimized WebP/AVIF versions
 * with proper loading attributes and picture elements
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_UPDATE = [
  'experience.html',
  'work.html', 
  'fun.html'
];

function updateImageReferences(content) {
  // Update JavaScript image arrays to use WebP primarily with fallback
  let updatedContent = content;
  
  // Replace single image references in JavaScript arrays
  // Pattern: src: 'images/path/to/image.jpg'
  updatedContent = updatedContent.replace(
    /src:\s*['"](images\/[^'"]+\.(jpg|jpeg|png))['"]/g,
    (match, imagePath) => {
      const baseName = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
      return `src: '${baseName}.webp', fallback: '${imagePath}'`;
    }
  );
  
  // Replace pinboard items image references
  updatedContent = updatedContent.replace(
    /\{ src:\s*['"](images\/[^'"]+\.(jpg|jpeg|png))['"],\s*isPng:\s*(true|false)\s*\}/g,
    (match, imagePath, isPng) => {
      const baseName = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
      return `{ src: '${baseName}.webp', fallback: '${imagePath}', isPng: ${isPng} }`;
    }
  );
  
  return updatedContent;
}

function updateImageRendering(content) {
  // Update the image rendering code to use picture elements with fallbacks
  let updatedContent = content;
  
  // Update for sticker images in fun.html - simpler pattern
  updatedContent = updatedContent.replace(
    /img\.src = baseName \+ '\.webp';\s*img\.setAttribute\('data-fallback', sticker\.stickerImage\);\s*img\.loading = 'lazy';\s*img\.decoding = 'async';\s*img\.alt = sticker\.title;\s*img\.className = 'sticker-image';/g,
    `img.src = baseName + '.webp';
    img.setAttribute('data-fallback', sticker.stickerImage);
    img.onerror = function() {
      if (this.getAttribute('data-fallback')) {
        this.src = this.getAttribute('data-fallback');
      }
    };
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = sticker.title;
    img.className = 'sticker-image';`
  );
  
  return updatedContent;
}

function updateLightboxImageLoading(content) {
  // Update lightbox image loading to be eager since it's user-triggered
  let updatedContent = content;
  
  updatedContent = updatedContent.replace(
    /lightboxImg\.src = currentGalleryList\[currentGalleryIndex\];/g,
    `const imgSrc = currentGalleryList[currentGalleryIndex];
    // Try WebP first, fallback to original
    if (imgSrc.includes('.jpg') || imgSrc.includes('.jpeg') || imgSrc.includes('.png')) {
      const webpSrc = imgSrc.replace(/\\.(jpg|jpeg|png)$/i, '.webp');
      lightboxImg.src = webpSrc;
      lightboxImg.onerror = () => { lightboxImg.src = imgSrc; };
    } else {
      lightboxImg.src = imgSrc;
    }
    lightboxImg.loading = 'eager';
    lightboxImg.decoding = 'sync';`
  );
  
  return updatedContent;
}

function main() {
  console.log('🔄 Updating image references...\n');
  
  for (const file of FILES_TO_UPDATE) {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ File not found: ${file}`);
      continue;
    }
    
    console.log(`Processing: ${file}`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update image references
    content = updateImageReferences(content);
    
    // Update image rendering code
    content = updateImageRendering(content);
    
    // Update lightbox loading
    content = updateLightboxImageLoading(content);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ Updated ${file}\n`);
  }
  
  console.log('✨ Image reference updates complete!');
  console.log('\n📝 Note: The JavaScript now uses WebP primarily with original format fallbacks.');
  console.log('   Images have loading="lazy" and decoding="async" attributes for performance.');
}

main();
