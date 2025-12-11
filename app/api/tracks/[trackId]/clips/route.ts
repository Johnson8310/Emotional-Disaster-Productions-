import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/get-user"
import { prisma } from "@/lib/db/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ trackId: string }> }) {
  try {
    const user = await requireAuth()
    const { trackId } = await params
    const body = await request.json()
    const { audioFileId, startTimeSeconds, endTimeSeconds, clipOffsetSeconds, name, color } = body

    // Verify track ownership through project
    const track = await prisma.track.findFirst({
      where: { id: trackId },
      include: { project: true },
    })

    if (!track || track.project.userId !== user.userId) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    // Verify audio file exists and belongs to same project
    const audioFile = await prisma.audioFile.findFirst({
      where: {
        id: audioFileId,
        projectId: track.projectId,
      },
    })

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file not found" }, { status: 404 })
    }

    const clip = await prisma.clip.create({
      data: {
        trackId,
        audioFileId,
        startTimeSeconds,
        endTimeSeconds,
        clipOffsetSeconds: clipOffsetSeconds || 0,
        name,
        color,
      },
      include: {
        audioFile: true,
      },
    })

    return NextResponse.json({ clip }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Create clip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
