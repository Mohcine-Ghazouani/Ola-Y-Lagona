#!/usr/bin/env node

/**
 * Cloudinary URL Parser
 * Extracts credentials from CLOUDINARY_URL format
 */

const cloudinaryUrl = process.argv[2] || process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  console.log('❌ No Cloudinary URL provided!');
  console.log('');
  console.log('Usage: node parse-cloudinary-url.js "cloudinary://api_key:api_secret@cloud_name"');
  console.log('Or set CLOUDINARY_URL environment variable');
  process.exit(1);
}

try {
  // Parse Cloudinary URL format: cloudinary://api_key:api_secret@cloud_name
  const urlPattern = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/;
  const match = cloudinaryUrl.match(urlPattern);
  
  if (!match) {
    throw new Error('Invalid Cloudinary URL format');
  }
  
  const [, apiKey, apiSecret, cloudName] = match;
  
  console.log('🎉 Cloudinary credentials extracted successfully!');
  console.log('');
  console.log('📋 Add these to your .env.local file:');
  console.log('');
  console.log('# Image Storage Configuration');
  console.log('STORAGE_TYPE="cloudinary"');
  console.log('');
  console.log('# Cloudinary Credentials');
  console.log(`CLOUDINARY_CLOUD_NAME="${cloudName}"`);
  console.log(`CLOUDINARY_API_KEY="${apiKey}"`);
  console.log(`CLOUDINARY_API_SECRET="${apiSecret}"`);
  console.log('CLOUDINARY_UPLOAD_PRESET="ola-y-lagona-preset"');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Copy the above environment variables to your .env.local file');
  console.log('2. Run: npm run cloudinary:setup');
  console.log('3. Test upload functionality');
  
} catch (error) {
  console.error('❌ Error parsing Cloudinary URL:', error.message);
  console.log('');
  console.log('💡 Expected format: cloudinary://api_key:api_secret@cloud_name');
}
