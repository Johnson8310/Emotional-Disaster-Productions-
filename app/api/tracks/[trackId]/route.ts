import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/get-user"
import { prisma } from "@/lib/db/prisma"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const { name, volume, pan, muted, solo, orderIndex, color } = body

    // Verify track ownership through project
    const track = await prisma.track.findFirst({
      where: { id },
      include: { project: true },
    })

    if (!track || track.project.userId !== user.userId) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    const updated = await prisma.track.update({
      where: { id },
      data: {
        name,
        volume,
        pan,
        muted,
        solo,
        orderIndex,
        color,
      },
    })

    return NextResponse.json({ track: updated })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Update track error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Verify track ownership through project
    const track = await prisma.track.findFirst({
      where: { id },
      include: { project: true },
    })

    if (!track || track.project.userId !== user.userId) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    await prisma.track.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Delete track error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
