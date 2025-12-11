import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/get-user"
import { prisma } from "@/lib/db/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const UPLOADS_DIR = process.env.UPLOADS_DIR || "./uploads"
const BASE_FILE_URL = process.env.BASE_FILE_URL || "http://localhost:3000"

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await requireAuth()
    const { projectId } = await params

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.userId,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type (audio only)
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Only audio files are allowed" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split(".").pop()
    const storedFilename = `${timestamp}-${randomString}.${extension}`
    const filePath = join(UPLOADS_DIR, storedFilename)

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Create database record
    const audioFile = await prisma.audioFile.create({
      data: {
        projectId,
        userId: user.userId,
        originalFilename: file.name,
        storedFilename,
        mimeType: file.type,
        fileSizeBytes: file.size,
      },
    })

    return NextResponse.json(
      {
        audioFile: {
          ...audioFile,
          url: `${BASE_FILE_URL}/api/audio-files/${audioFile.id}/stream`,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Upload audio file error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
