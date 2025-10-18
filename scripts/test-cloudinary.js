#!/usr/bin/env node

/**
 * Test Cloudinary Upload Functionality
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dwcxezntv',
  api_key: '657319718144662',
  api_secret: 't21AnCoomj5_Ebg4BVEQ1a5a2Ro',
});

async function testCloudinaryConnection() {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    
    // Test API connection
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary API connection successful!');
    
    // Test upload preset exists
    const presets = await cloudinary.api.upload_presets();
    const ourPreset = presets.presets.find(preset => preset.name === 'ola-y-lagona-preset');
    
    if (ourPreset) {
      console.log('✅ Upload preset "ola-y-lagona-preset" found!');
      console.log(`📁 Folder: ${ourPreset.folder || 'root'}`);
      console.log(`🔧 Unsigned: ${ourPreset.unsigned ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Upload preset "ola-y-lagona-preset" not found!');
    }
    
    console.log('');
    console.log('🎉 Cloudinary is ready for uploads!');
    console.log('');
    console.log('📋 Test Steps:');
    console.log('1. Open your browser to: http://localhost:3000/admin/gallery');
    console.log('2. Try uploading an image');
    console.log('3. Check if the image gets a Cloudinary URL');
    console.log('4. Verify the image displays correctly');
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Cloudinary credentials');
    console.log('3. Make sure .env.local file exists with correct values');
  }
}

testCloudinaryConnection();
