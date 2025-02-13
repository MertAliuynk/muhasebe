import { NextResponse } from "next/server"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import sharp from "sharp"

import { slugify } from "@/lib/utils"

const s3Client = new S3Client({
  endpoint: process.env.MINIO_URL,
  region: "auto",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
})

interface UploadResult {
  url: string
}

async function uploadToMinio(file: File): Promise<UploadResult> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const slug = slugify(file.name.split(".")[0] ?? "")
    const fileName = `${slug}.webp`

    const webpBuffer: Buffer = await sharp(buffer)
      .webp({ quality: 100, effort: 6 })
      .toBuffer()

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: fileName,
        Body: webpBuffer,
        ContentType: "image/webp",
      })
    )

    return {
      url: `/${process.env.MINIO_BUCKET}/${fileName}`,
    }
  } catch (error: unknown) {
    console.log("Yükleme hatası:", error)
    throw new Error(error instanceof Error ? error.message : "Bilinmeyen hata")
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const uploadResult = await uploadToMinio(file)

    return NextResponse.json(
      {
        url: uploadResult.url,
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Yükleme hatası:", error)
    return NextResponse.json(
      { error: "Yükleme hatası" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
