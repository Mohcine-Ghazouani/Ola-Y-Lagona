import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"

// Cloud storage interfaces
interface CloudStorageProvider {
  upload(file: File, fileName: string): Promise<string>
  delete(fileUrl: string): Promise<boolean>
}

// Local file storage (for development)
class LocalStorageProvider implements CloudStorageProvider {
  async upload(file: File, fileName: string): Promise<string> {
    const uploadsDir = join(process.cwd(), "public", "uploads")
    
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    const filePath = join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    return `/uploads/${fileName}`
  }

  async delete(fileUrl: string): Promise<boolean> {
    try {
      const fileName = fileUrl.split('/').pop()
      if (!fileName) return false
      
      const filePath = join(process.cwd(), "public", "uploads", fileName)
      await unlink(filePath)
      return true
    } catch (error) {
      console.error("Failed to delete file:", error)
      return false
    }
  }
}

// Cloudinary storage provider
class CloudinaryProvider implements CloudStorageProvider {
  private cloudName: string
  private apiKey: string
  private apiSecret: string

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || ""
    this.apiKey = process.env.CLOUDINARY_API_KEY || ""
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || ""
  }

  async upload(file: File, fileName: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned')
    formData.append('public_id', fileName.replace(/\.[^/.]+$/, "")) // Remove extension

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Failed to upload to Cloudinary')
    }

    const data = await response.json()
    return data.secure_url
  }

  async delete(fileUrl: string): Promise<boolean> {
    try {
      const publicId = this.extractPublicId(fileUrl)
      if (!publicId) return false

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_id: publicId,
            api_key: this.apiKey,
            api_secret: this.apiSecret,
          }),
        }
      )

      return response.ok
    } catch (error) {
      console.error("Failed to delete from Cloudinary:", error)
      return false
    }
  }

  private extractPublicId(url: string): string | null {
    const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|webp)$/i)
    return match ? match[1] : null
  }
}

// AWS S3 storage provider
class S3Provider implements CloudStorageProvider {
  private bucketName: string
  private region: string

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || ""
    this.region = process.env.AWS_S3_REGION || "us-east-1"
  }

  async upload(file: File, fileName: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('key', fileName)
    formData.append('bucket', this.bucketName)
    formData.append('region', this.region)

    const response = await fetch('/api/upload/s3', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload to S3')
    }

    const data = await response.json()
    return data.url
  }

  async delete(fileUrl: string): Promise<boolean> {
    try {
      const response = await fetch('/api/upload/s3/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fileUrl }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to delete from S3:", error)
      return false
    }
  }
}

// Storage factory
function getStorageProvider(): CloudStorageProvider {
  const storageType = process.env.STORAGE_TYPE || 'local'
  
  switch (storageType) {
    case 'cloudinary':
      return new CloudinaryProvider()
    case 's3':
      return new S3Provider()
    case 'local':
    default:
      return new LocalStorageProvider()
  }
}

export async function POST(request: NextRequest) {
  try {
    // Enable authentication in production
    if (process.env.NODE_ENV === "production") {
      const token = request.cookies.get("auth-token")?.value
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const user = verifyToken(token)
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    // Upload using the configured storage provider
    const storageProvider = getStorageProvider()
    const publicUrl = await storageProvider.upload(file, fileName)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      storage: process.env.STORAGE_TYPE || 'local',
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Enable authentication in production
    if (process.env.NODE_ENV === "production") {
      const token = request.cookies.get("auth-token")?.value
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const user = verifyToken(token)
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    const storageProvider = getStorageProvider()
    const success = await storageProvider.delete(url)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
    }
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    )
  }
}