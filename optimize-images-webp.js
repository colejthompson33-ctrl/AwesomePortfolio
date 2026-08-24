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
  'images/funstickers/'
];

const WEBP_QUALITY = 75; // 75-80% quality for high compression
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
      
      // Skip if WebP already exists
      if (fs.existsSync(webpPath)) {
        console.log(`⏭️  WebP already exists: ${webpPath}`);
      } else {
        const converted = await convertToWebP(filePath, webpPath);
        if (converted) totalConverted++;
      }
      
      // Create mobile version if it doesn't exist
      if (fs.existsSync(mobileWebpPath)) {
        console.log(`⏭️  Mobile WebP already exists: ${mobileWebpPath}`);
      } else {
        const mobileCreated = await createMobileVersion(filePath, mobileWebpPath);
        if (mobileCreated) totalMobile++;
      }
    }
  }

  console.log('\n=====================================');
  console.log('🎉 Optimization Complete!');
  console.log(`📊 Total WebP conversions: ${totalConverted}`);
  console.log(`📱 Total mobile versions: ${totalMobile}`);
  console.log('\n💡 Next steps:');
  console.log('1. Update HTML to use WebP sources with <picture> tags');
  console.log('2. Test mobile performance improvements');
  console.log('3. Consider adding CDN for further optimization');
}

// Run the optimization
optimizeImages().catch(console.error);