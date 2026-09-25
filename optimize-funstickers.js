#!/usr/bin/env node

/**
 * Fun Sticker Image Optimization Script
 * Converts sticker images to WebP/AVIF formats while preserving original aspect ratios
 * Run: node optimize-funstickers.js
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

const FUNSTICKERS_DIR = path.join(__dirname, 'images/funstickers');
const WEBP_QUALITY = 84; // High quality for crisp linework
const AVIF_QUALITY = 78; // Slightly lower but still high quality
const MAX_DIMENSION = 1400; // Maximum dimension on longest side

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
    
    console.log(`  Original: ${metadata.width}x${metadata.height}px`);
    
    // Calculate if we need to resize (only if larger than MAX_DIMENSION)
    let processor = image;
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      const scale = Math.min(MAX_DIMENSION / metadata.width, MAX_DIMENSION / metadata.height);
      const newWidth = Math.round(metadata.width * scale);
      const newHeight = Math.round(metadata.height * scale);
      
      console.log(`  Resizing to: ${newWidth}x${newHeight}px`);
      processor = processor.resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: 'lanczos3'
      });
    } else {
      console.log(`  No resize needed (within ${MAX_DIMENSION}px limit)`);
    }
    
    // Generate WebP
    const webpPath = path.join(dir, `${basename}.webp`);
    await processor.clone()
      .webp({ quality: WEBP_QUALITY, effort: 4, nearLossless: true })
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
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'].includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return images;
}

async function main() {
  console.log('🚀 Starting Fun Sticker Image Optimization...\n');
  console.log('Target quality: WebP 84%, AVIF 78%');
  console.log('Max dimension: 1400px (preserving aspect ratio)');
  console.log('Output formats: WebP + AVIF with original fallback\n');
  
  if (!fs.existsSync(FUNSTICKERS_DIR)) {
    console.error(`Fun stickers directory not found: ${FUNSTICKERS_DIR}`);
    process.exit(1);
  }
  
  const images = await findAllImages(FUNSTICKERS_DIR);
  console.log(`Found ${images.length} sticker images to optimize\n`);
  
  if (images.length === 0) {
    console.log('No images found to process.');
    return;
  }
  
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
  console.log('\n✨ Fun sticker optimization complete!');
  console.log('\n📝 All images preserved original aspect ratios - no cropping applied.');
}

main().catch(console.error);