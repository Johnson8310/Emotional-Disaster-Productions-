import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/get-user"
import { prisma } from "@/lib/db/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await requireAuth()
    const { projectId } = await params
    const body = await request.json()
    const { name, type, orderIndex } = body

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

    // Get next order index if not provided
    let finalOrderIndex = orderIndex
    if (finalOrderIndex === undefined) {
      const maxTrack = await prisma.track.findFirst({
        where: { projectId },
        orderBy: { orderIndex: "desc" },
      })
      finalOrderIndex = (maxTrack?.orderIndex ?? -1) + 1
    }

    const track = await prisma.track.create({
      data: {
        projectId,
        name: name || "New Track",
        type: type || "audio",
        orderIndex: finalOrderIndex,
      },
    })

    return NextResponse.json({ track }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Create track error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
