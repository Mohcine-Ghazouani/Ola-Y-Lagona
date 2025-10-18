import { NextRequest, NextResponse } from "next/server"
import AWS from "aws-sdk"

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION || "us-east-1",
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const key = formData.get("key") as string
    const bucket = formData.get("bucket") as string

    if (!file || !key || !bucket) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadParams = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    }

    const result = await s3.upload(uploadParams).promise()

    return NextResponse.json({
      success: true,
      url: result.Location,
      key: result.Key,
    })
  } catch (error) {
    console.error("S3 upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload to S3" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Extract bucket and key from URL
    const urlParts = url.split('/')
    const bucket = urlParts[2].split('.')[0]
    const key = urlParts.slice(3).join('/')

    const deleteParams = {
      Bucket: bucket,
      Key: key,
    }

    await s3.deleteObject(deleteParams).promise()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("S3 delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete from S3" },
      { status: 500 }
    )
  }
}
