#!/usr/bin/env node

/**
 * Migrate Existing Images to Cloudinary
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dwcxezntv',
  api_key: '657319718144662',
  api_secret: 't21AnCoomj5_Ebg4BVEQ1a5a2Ro',
});

async function migrateImages() {
  try {
    console.log('🚀 Starting image migration to Cloudinary...');
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
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

    console.log(`📸 Found ${imageFiles.length} images to migrate:`);
    imageFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');

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

migrateImages();
