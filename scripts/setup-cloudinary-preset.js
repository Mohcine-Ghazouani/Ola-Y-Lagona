#!/usr/bin/env node

/**
 * Cloudinary Upload Preset Setup Script
 * This script helps you create an unsigned upload preset for Cloudinary
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function createUploadPreset() {
  try {
    console.log('🚀 Creating Cloudinary upload preset...');
    
    const preset = await cloudinary.api.create_upload_preset({
      name: 'ola-y-lagona-preset',
      unsigned: true,
      folder: 'ola-y-lagona',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' },
        { width: 1200, height: 1200, crop: 'limit' }
      ],
      eager: [
        { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
        { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
      ],
      eager_async: true,
      tags: ['ola-y-lagona', 'kite-sports']
    });

    console.log('✅ Upload preset created successfully!');
    console.log(`📝 Preset name: ${preset.name}`);
    console.log(`🔗 Preset ID: ${preset.name}`);
    console.log('');
    console.log('📋 Add this to your .env.local file:');
    console.log(`CLOUDINARY_UPLOAD_PRESET="${preset.name}"`);
    
  } catch (error) {
    console.error('❌ Error creating upload preset:', error.message);
    console.log('');
    console.log('🔧 Manual setup instructions:');
    console.log('1. Go to your Cloudinary dashboard');
    console.log('2. Navigate to Settings > Upload');
    console.log('3. Click "Add upload preset"');
    console.log('4. Set the following:');
    console.log('   - Name: ola-y-lagona-preset');
    console.log('   - Signing Mode: Unsigned');
    console.log('   - Folder: ola-y-lagona');
    console.log('   - Transformations: Quality auto, Format auto');
    console.log('5. Save the preset');
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

createUploadPreset();
