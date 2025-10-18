#!/usr/bin/env node

/**
 * Image Migration Script
 * Migrates existing local images to Cloudinary
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateImages() {
  try {
    console.log('🚀 Starting image migration to Cloudinary...');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ No uploads directory found. Nothing to migrate.');
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.log('📁 No image files found in uploads directory.');
      return;
    }

    console.log(`📸 Found ${imageFiles.length} images to migrate`);

    const migrationResults = [];

    for (const file of imageFiles) {
      try {
        console.log(`📤 Uploading ${file}...`);
        
        const filePath = path.join(uploadsDir, file);
        const publicId = `ola-y-lagona/${file.replace(/\.[^/.]+$/, '')}`;
        
        const result = await cloudinary.uploader.upload(filePath, {
          public_id: publicId,
          folder: 'ola-y-lagona',
          quality: 'auto',
          fetch_format: 'auto',
          tags: ['ola-y-lagona', 'migrated']
        });

        migrationResults.push({
          originalFile: file,
          originalPath: `/uploads/${file}`,
          cloudinaryUrl: result.secure_url,
          publicId: result.public_id
        });

        console.log(`✅ ${file} uploaded successfully`);
        console.log(`   URL: ${result.secure_url}`);
        
      } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error.message);
      }
    }

    // Save migration results
    const migrationFile = path.join(process.cwd(), 'migration-results.json');
    fs.writeFileSync(migrationFile, JSON.stringify(migrationResults, null, 2));
    
    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migrationResults.length} images`);
    console.log(`❌ Failed migrations: ${imageFiles.length - migrationResults.length} images`);
    console.log(`📄 Migration results saved to: ${migrationFile}`);
    
    console.log('');
    console.log('🔄 Next steps:');
    console.log('1. Update your database with the new Cloudinary URLs');
    console.log('2. Test the image display on your website');
    console.log('3. Once confirmed working, you can delete the local uploads folder');
    
    // Generate SQL update statements
    console.log('');
    console.log('📝 SQL Update Statements:');
    console.log('-- Update gallery images');
    migrationResults.forEach(result => {
      console.log(`UPDATE gallery SET image_url = '${result.cloudinaryUrl}' WHERE image_url = '${result.originalPath}';`);
    });
    
    console.log('');
    console.log('-- Update course images');
    migrationResults.forEach(result => {
      console.log(`UPDATE courses SET image_url = '${result.cloudinaryUrl}' WHERE image_url = '${result.originalPath}';`);
    });
    
    console.log('');
    console.log('-- Update activity images');
    migrationResults.forEach(result => {
      console.log(`UPDATE activities SET image_url = '${result.cloudinaryUrl}' WHERE image_url = '${result.originalPath}';`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Check if environment variables are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.log('❌ Missing Cloudinary credentials!');
  console.log('');
  console.log('📋 Please set these environment variables:');
  console.log('- CLOUDINARY_CLOUD_NAME');
  console.log('- CLOUDINARY_API_KEY');
  console.log('- CLOUDINARY_API_SECRET');
  console.log('');
  console.log('💡 You can get these from your Cloudinary dashboard');
  process.exit(1);
}

migrateImages();
