# Image Storage & Upload Guide

## Overview

Your application now supports multiple image storage options for different deployment scenarios. This guide covers setup and configuration for each storage type.

## Storage Options

### 1. Local Storage (Development/Simple Deployments)

**Best for:** Development, single-server deployments, small applications

**Pros:**
- No external dependencies
- Easy to set up
- No additional costs
- Fast access

**Cons:**
- Files lost on server restart/redeployment
- Not suitable for multiple server instances
- No automatic backups
- Limited scalability

**Setup:**
```env
STORAGE_TYPE="local"
```

**How it works:**
- Images stored in `public/uploads/` directory
- Files served directly by Next.js
- URLs format: `/uploads/filename.jpg`

### 2. Cloudinary (Recommended for Production)

**Best for:** Production applications, image optimization, CDN delivery

**Pros:**
- Automatic image optimization
- CDN delivery worldwide
- Image transformations
- Automatic backups
- Generous free tier
- Easy setup

**Cons:**
- External dependency
- Costs for high usage
- Requires account setup

**Setup:**

1. **Create Cloudinary Account:**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account
   - Get your cloud name, API key, and secret

2. **Configure Environment Variables:**
   ```env
   STORAGE_TYPE="cloudinary"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
   ```

3. **Create Upload Preset:**
   - Go to Cloudinary Dashboard > Settings > Upload
   - Create new unsigned upload preset
   - Set folder: `ola-y-lagona`
   - Enable: Auto-upload, Eager transformations

**How it works:**
- Images uploaded to Cloudinary cloud
- Automatic optimization and CDN delivery
- URLs format: `https://res.cloudinary.com/your-cloud/image/upload/v1234567890/filename.jpg`

### 3. AWS S3 (Enterprise Production)

**Best for:** Large-scale applications, enterprise deployments

**Pros:**
- Highly scalable
- Enterprise-grade reliability
- Full control over storage
- Integration with AWS ecosystem
- Cost-effective for large volumes

**Cons:**
- Complex setup
- Requires AWS account
- Additional configuration needed
- Higher learning curve

**Setup:**

1. **Create AWS Account:**
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Create account and S3 bucket
   - Create IAM user with S3 permissions

2. **Configure Environment Variables:**
   ```env
   STORAGE_TYPE="s3"
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_S3_BUCKET_NAME="your-bucket-name"
   AWS_S3_REGION="us-east-1"
   ```

3. **S3 Bucket Configuration:**
   - Enable public read access
   - Configure CORS policy
   - Set up lifecycle policies

**How it works:**
- Images uploaded to S3 bucket
- Served via CloudFront CDN (optional)
- URLs format: `https://your-bucket.s3.amazonaws.com/filename.jpg`

## Migration Guide

### From Local to Cloud Storage

1. **Backup existing images:**
   ```bash
   # Create backup of current uploads
   cp -r public/uploads/ backup/uploads-$(date +%Y%m%d)/
   ```

2. **Update environment variables:**
   ```env
   STORAGE_TYPE="cloudinary"  # or "s3"
   # Add cloud storage credentials
   ```

3. **Migrate existing images:**
   ```bash
   # Run migration script (create this)
   npm run migrate-images
   ```

4. **Update database URLs:**
   ```sql
   -- Update image URLs in database
   UPDATE gallery SET image_url = REPLACE(image_url, '/uploads/', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/');
   UPDATE courses SET image_url = REPLACE(image_url, '/uploads/', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/');
   UPDATE activities SET image_url = REPLACE(image_url, '/uploads/', 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/');
   ```

## Image Optimization

### Cloudinary Optimization

Cloudinary automatically provides:
- **Format optimization:** WebP, AVIF for supported browsers
- **Size optimization:** Multiple sizes for different devices
- **Quality optimization:** Automatic quality adjustment
- **Lazy loading:** Built-in lazy loading support

**Example optimized URLs:**
```
Original: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/filename.jpg
Optimized: https://res.cloudinary.com/your-cloud/image/upload/f_auto,q_auto,w_800/v1234567890/filename.jpg
```

### Manual Optimization

For local storage, consider:
- **Image compression:** Use tools like ImageOptim, TinyPNG
- **Format conversion:** Convert to WebP for better compression
- **Size resizing:** Create multiple sizes for responsive images

## Security Considerations

### File Upload Security

1. **File Type Validation:**
   ```typescript
   const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
   ```

2. **File Size Limits:**
   ```typescript
   const maxSize = 10 * 1024 * 1024 // 10MB
   ```

3. **Authentication Required:**
   ```typescript
   // Only admin users can upload
   if (user.role !== "admin") {
     return NextResponse.json({ error: "Forbidden" }, { status: 403 })
   }
   ```

### Storage Security

1. **Environment Variables:** Never commit credentials to version control
2. **Access Control:** Use least privilege principle for cloud storage
3. **HTTPS Only:** Ensure all image URLs use HTTPS
4. **CORS Configuration:** Properly configure CORS for S3 buckets

## Performance Optimization

### CDN Configuration

1. **Cloudinary CDN:**
   - Automatically enabled
   - Global edge locations
   - Automatic format selection

2. **AWS CloudFront:**
   - Configure CloudFront distribution
   - Set up custom domain
   - Enable compression

### Caching Strategy

1. **Browser Caching:**
   ```typescript
   // Set cache headers for images
   res.setHeader('Cache-Control', 'public, max-age=31536000')
   ```

2. **CDN Caching:**
   - Configure appropriate TTL
   - Use cache invalidation when needed

## Monitoring & Maintenance

### Health Checks

Monitor image upload functionality:
```typescript
// Add to health check endpoint
const testUpload = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

### Backup Strategy

1. **Cloudinary:** Automatic backups included
2. **S3:** Enable versioning and cross-region replication
3. **Local:** Regular file system backups

### Cleanup

Implement cleanup for:
- Orphaned files (not referenced in database)
- Old temporary files
- Failed uploads

## Troubleshooting

### Common Issues

1. **Upload Failures:**
   - Check file size limits
   - Verify file type restrictions
   - Check authentication

2. **Image Not Displaying:**
   - Verify URL format
   - Check CORS configuration
   - Verify file permissions

3. **Slow Loading:**
   - Enable CDN
   - Optimize image sizes
   - Use lazy loading

### Debug Tools

1. **Upload Test:**
   ```bash
   curl -X POST -F "file=@test.jpg" http://localhost:3000/api/upload
   ```

2. **Storage Test:**
   ```bash
   # Test Cloudinary connection
   curl "https://api.cloudinary.com/v1_1/your-cloud/resources/image"
   ```

## Cost Optimization

### Cloudinary Pricing
- **Free tier:** 25GB storage, 25GB bandwidth/month
- **Paid plans:** Start at $89/month for higher limits

### S3 Pricing
- **Storage:** ~$0.023/GB/month
- **Requests:** ~$0.0004/1000 requests
- **Data transfer:** Varies by region

### Optimization Tips
1. **Compress images** before upload
2. **Use appropriate formats** (WebP, AVIF)
3. **Implement lazy loading**
4. **Monitor usage** regularly

## Next Steps

1. **Choose storage type** based on your needs
2. **Set up credentials** and environment variables
3. **Test upload functionality**
4. **Migrate existing images** if needed
5. **Monitor performance** and costs
6. **Implement backup strategy**

## Support

For issues with image uploads:
1. Check the health endpoint: `/api/health`
2. Review error logs
3. Test with different file types/sizes
4. Verify environment configuration
5. Check storage provider status
