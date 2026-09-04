#!/usr/bin/env node

/**
 * Image Optimization Script for WebP Conversion
 * 
 * This script converts PNG/JPEG images to WebP format with optimal compression
 * for mobile performance. Requires Node.js and sharp package.
 * 
 * Installation: npm install sharp
 * Usage: node optimize-images-webp.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const IMAGE_DIRECTORIES = [
  'images/',
  'images/Personal/',
  'images/BlueHouse/',
  'images/funstickers/',
  'images/Waynes Wings/',
  'images/Aggie Outdoors/'
];

const WEBP_QUALITY = 75; // 75-80% quality for high compression
const FUNSTICKERS_QUALITY = 95; // High quality for funstickers with transparency
const MOBILE_MAX_WIDTH = 800; // Max width for mobile versions

console.log('🚀 Image Optimization Script Started');
console.log('=====================================\n');

// Check if sharp is installed
try {
  require('sharp');
  console.log('✅ sharp package is installed');
} catch (e) {
  console.log('❌ sharp package not found. Installing...');
  try {
    execSync('npm install sharp', { stdio: 'inherit' });
    console.log('✅ sharp package installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install sharp. Please run: npm install sharp');
    process.exit(1);
  }
}

const sharp = require('sharp');

// Function to convert single image to WebP
async function convertToWebP(inputPath, outputPath, quality = WEBP_QUALITY) {
  try {
    await sharp(inputPath)
      .webp({ quality: quality })
      .toFile(outputPath);
    console.log(`✅ Converted: ${inputPath} → ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to convert ${inputPath}:`, error.message);
    return false;
  }
}

// Function to convert single image to high-quality WebP with transparency
async function convertToWebPTransparent(inputPath, outputPath, quality = FUNSTICKERS_QUALITY) {
  try {
    await sharp(inputPath)
      .webp({ 
        quality: quality,
        alphaQuality: 95,
        effort: 6
      })
      .toFile(outputPath);
    console.log(`✅ High-quality converted: ${inputPath} → ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to convert ${inputPath}:`, error.message);
    return false;
  }
}

// Function to create mobile-optimized version
async function createMobileVersion(inputPath, outputPath, maxWidth = MOBILE_MAX_WIDTH, quality = WEBP_QUALITY) {
  try {
    await sharp(inputPath)
      .resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: quality })
      .toFile(outputPath);
    console.log(`📱 Mobile version: ${inputPath} → ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create mobile version of ${inputPath}:`, error.message);
    return false;
  }
}

// Main optimization function
async function optimizeImages() {
  let totalConverted = 0;
  let totalMobile = 0;

  for (const dir of IMAGE_DIRECTORIES) {
    const fullPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Directory not found: ${fullPath}`);
      continue;
    }

    console.log(`\n📁 Processing directory: ${dir}`);
    
    const files = fs.readdirSync(fullPath);
    
    for (const file of files) {
      const filePath = path.join(fullPath, file);
      const stat = fs.statSync(filePath);
      
      if (!stat.isFile()) continue;
      
      const ext = path.extname(file).toLowerCase();
      
      // Skip already WebP files and non-image files
      if (ext === '.webp' || !['.png', '.jpg', '.jpeg', '.JPG', '.JPEG', '.PNG'].includes(ext)) {
        continue;
      }
      
      const baseName = path.basename(file, ext);
      const webpPath = path.join(fullPath, `${baseName}.webp`);
      const mobileWebpPath = path.join(fullPath, `${baseName}-mobile.webp`);
      
      // Use high-quality conversion for funstickers (with transparency)
      const isFunsticker = dir.includes('funstickers');
      const useHighQuality = isFunsticker;
      
      // Force reconvert funstickers with high quality
      if (isFunsticker) {
        console.log(`🔄 Reconverting funsticker with high quality: ${file}`);
        let converted;
        if (useHighQuality) {
          converted = await convertToWebPTransparent(filePath, webpPath);
        } else {
          converted = await convertToWebP(filePath, webpPath);
        }
        if (converted) totalConverted++;
      } else {
        // Skip if WebP already exists for non-funstickers
        if (fs.existsSync(webpPath)) {
          console.log(`⏭️  WebP already exists: ${webpPath}`);
        } else {
          let converted;
          if (useHighQuality) {
            converted = await convertToWebPTransparent(filePath, webpPath);
          } else {
            converted = await convertToWebP(filePath, webpPath);
          }
          if (converted) totalConverted++;
        }
      }
      
      // Create mobile version if it doesn't exist (skip for funstickers)
      if (!isFunsticker) {
        if (fs.existsSync(mobileWebpPath)) {
          console.log(`⏭️  Mobile WebP already exists: ${mobileWebpPath}`);
        } else {
          const mobileCreated = await createMobileVersion(filePath, mobileWebpPath);
          if (mobileCreated) totalMobile++;
        }
      }
    }
  }

  console.log('\n=====================================');
  console.log('🎉 Optimization Complete!');
  console.log(`📊 Total WebP conversions: ${totalConverted}`);
  console.log(`📱 Total mobile versions: ${totalMobile}`);
  console.log(`🎨 Funstickers: High-quality WebP with transparency enabled`);
  console.log('\n💡 Next steps:');
  console.log('1. Test image quality in fun.html');
  console.log('2. Verify transparency preservation in funstickers');
  console.log('3. Check aspect ratios and no clipping issues');
}

// Run the optimization
optimizeImages().catch(console.error);