#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts all images to WebP/AVIF formats with compression and resizing
 * Run: node optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if sharp is installed, if not install it
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Installing sharp dependency...');
  execSync('npm install sharp', { cwd: __dirname, stdio: 'inherit' });
  sharp = require('sharp');
}

const IMAGES_DIR = path.join(__dirname, 'images');
const QUALITY = 85; // Target 85% quality for good balance
const WEBP_QUALITY = 80;
const AVIF_QUALITY = 65;

// Define target sizes based on usage
const TARGET_SIZES = {
  // Stream cards (experience/work pages) - use original aspect ratio, max width constraint
  stream: { width: 1200, height: null },
  
  // Sticker thumbnails (fun page)
  sticker: { width: 200, height: 200 },
  
  // Hero/background images
  hero: { width: 1920, height: 1080 },
  
  // Lightbox images
  lightbox: { width: 1600, height: null },
  
  // Original size (no resize)
  original: null
};

// Map directories to their target sizes
const DIRECTORY_TARGETS = {
  'images/Personal': 'stream',
  'images/BlueHouse': 'lightbox',
  'images/funstickers': 'sticker',
  'images/HUM': 'lightbox',
  'images/UNT': 'lightbox',
  'images/Claire': 'lightbox',
  'images/Guidelines': 'original'
};

function getTargetSize(imagePath) {
  for (const [dir, target] of Object.entries(DIRECTORY_TARGETS)) {
    if (imagePath.includes(dir)) {
      return TARGET_SIZES[target];
    }
  }
  return TARGET_SIZES.original;
}

async function optimizeImage(inputPath) {
  const stats = fs.statSync(inputPath);
  const originalSize = stats.size;
  const ext = path.extname(inputPath).toLowerCase();
  const basename = path.basename(inputPath, ext);
  const dir = path.dirname(inputPath);
  
  console.log(`Processing: ${path.basename(inputPath)} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Get target size
    const targetSize = getTargetSize(inputPath);
    
    // Resize if needed
    let processor = image;
    if (targetSize) {
      if (targetSize.height) {
        // Fixed dimensions
        processor = processor.resize(targetSize.width, targetSize.height, {
          fit: 'cover',
          position: 'center'
        });
      } else {
        // Width only, preserve aspect ratio
        processor = processor.resize(targetSize.width, null, {
          fit: 'inside',
          position: 'center'
        });
      }
    }
    
    // Generate WebP
    const webpPath = path.join(dir, `${basename}.webp`);
    await processor.clone()
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(webpPath);
    
    const webpStats = fs.statSync(webpPath);
    const webpSavings = ((originalSize - webpStats.size) / originalSize * 100).toFixed(1);
    console.log(`  ✓ WebP: ${(webpStats.size / 1024 / 1024).toFixed(2)} MB (${webpSavings}% reduction)`);
    
    // Generate AVIF (if supported)
    try {
      const avifPath = path.join(dir, `${basename}.avif`);
      await processor.clone()
        .avif({ quality: AVIF_QUALITY, effort: 4 })
        .toFile(avifPath);
      
      const avifStats = fs.statSync(avifPath);
      const avifSavings = ((originalSize - avifStats.size) / originalSize * 100).toFixed(1);
      console.log(`  ✓ AVIF: ${(avifStats.size / 1024 / 1024).toFixed(2)} MB (${avifSavings}% reduction)`);
    } catch (avifError) {
      console.log(`  ⚠ AVIF not supported or failed (WebP used as fallback)`);
    }
    
    return true;
  } catch (error) {
    console.error(`  ✗ Error processing ${inputPath}:`, error.message);
    return false;
  }
}

async function findAllImages(dir) {
  const images = [];
  
  function scanDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'].includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory(dir);
  return images;
}

async function main() {
  console.log('🚀 Starting Image Optimization...\n');
  console.log('Target quality: WebP 80%, AVIF 65%');
  console.log('Output formats: WebP + AVIF with original fallback\n');
  
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }
  
  const images = await findAllImages(IMAGES_DIR);
  console.log(`Found ${images.length} images to optimize\n`);
  
  let totalOriginalSize = 0;
  let totalWebpSize = 0;
  let totalAvifSize = 0;
  let successCount = 0;
  
  for (const imagePath of images) {
    const stats = fs.statSync(imagePath);
    totalOriginalSize += stats.size;
    
    const success = await optimizeImage(imagePath);
    if (success) successCount++;
    
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Optimization Summary:');
  console.log(`  Processed: ${successCount}/${images.length} images`);
  console.log(`  Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Calculate total WebP size
  for (const imagePath of images) {
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    if (fs.existsSync(webpPath)) {
      totalWebpSize += fs.statSync(webpPath).size;
    }
  }
  
  // Calculate total AVIF size
  for (const imagePath of images) {
    const avifPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.avif');
    if (fs.existsSync(avifPath)) {
      totalAvifSize += fs.statSync(avifPath).size;
    }
  }
  
  console.log(`  WebP total: ${(totalWebpSize / 1024 / 1024).toFixed(2)} MB (${((totalOriginalSize - totalWebpSize) / totalOriginalSize * 100).toFixed(1)}% reduction)`);
  console.log(`  AVIF total: ${(totalAvifSize / 1024 / 1024).toFixed(2)} MB (${((totalOriginalSize - totalAvifSize) / totalOriginalSize * 100).toFixed(1)}% reduction)`);
  console.log('\n✨ Optimization complete!');
}

main().catch(console.error);
