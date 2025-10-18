#!/usr/bin/env node

/**
 * Simple Cloudinary Upload Preset Setup
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dwcxezntv',
  api_key: '657319718144662',
  api_secret: 't21AnCoomj5_Ebg4BVEQ1a5a2Ro',
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
    console.log('🎉 Your Cloudinary setup is complete!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Make sure you have created .env.local file with the credentials');
    console.log('2. Start your development server: npm run dev');
    console.log('3. Test upload functionality in admin panel');
    
  } catch (error) {
    console.error('❌ Error creating upload preset:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('✅ Upload preset already exists! You can proceed with testing.');
    } else {
      console.log('');
      console.log('🔧 Manual setup instructions:');
      console.log('1. Go to your Cloudinary dashboard: https://cloudinary.com/console');
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
}

createUploadPreset();
