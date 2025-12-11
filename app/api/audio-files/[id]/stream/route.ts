import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { readFile } from "fs/promises"
import { join } from "path"

const UPLOADS_DIR = process.env.UPLOADS_DIR || "./uploads"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const audioFile = await prisma.audioFile.findUnique({
      where: { id },
    })

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file not found" }, { status: 404 })
    }

    const filePath = join(UPLOADS_DIR, audioFile.storedFilename)
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": audioFile.mimeType,
        "Content-Length": audioFile.fileSizeBytes.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Stream audio file error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
