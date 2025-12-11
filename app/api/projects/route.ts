import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/get-user"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const user = await requireAuth()

    const projects = await prisma.project.findMany({
      where: { userId: user.userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { tracks: true },
        },
      },
    })

    return NextResponse.json({ projects })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name, description, bpm, timeSignature } = body

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        userId: user.userId,
        name,
        description,
        bpm: bpm || 120,
        timeSignature: timeSignature || "4/4",
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error("Create project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
