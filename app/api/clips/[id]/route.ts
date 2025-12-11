import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/get-user"
import { prisma } from "@/lib/db/prisma"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const { startTimeSeconds, endTimeSeconds, clipOffsetSeconds, name, color } = body

    // Verify clip ownership through track->project
    const clip = await prisma.clip.findFirst({
      where: { id },
      include: {
        track: {
          include: { project: true },
        },
      },
    })

    if (!clip || clip.track.project.userId !== user.userId) {
      return NextResponse.json({ error: "Clip not found" }, { status: 404 })
    }

    const updated = await prisma.clip.update({
      where: { id },
      data: {
        startTimeSeconds,
        endTimeSeconds,
        clipOffsetSeconds,
        name,
        color,
      },
      include: {
        audioFile: true,
      },
    })

    return NextResponse.json({ clip: updated })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Update clip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Verify clip ownership through track->project
    const clip = await prisma.clip.findFirst({
      where: { id },
      include: {
        track: {
          include: { project: true },
        },
      },
    })

    if (!clip || clip.track.project.userId !== user.userId) {
      return NextResponse.json({ error: "Clip not found" }, { status: 404 })
    }

    await prisma.clip.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Delete clip error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
