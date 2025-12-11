import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/get-user"
import { prisma } from "@/lib/db/prisma"
import { ProjectWorkspace } from "@/components/project/project-workspace"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user) {
    redirect("/auth/login")
  }

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: user.userId,
    },
    include: {
      tracks: {
        orderBy: { orderIndex: "asc" },
        include: {
          clips: {
            include: {
              audioFile: true,
            },
          },
        },
      },
    },
  })

  if (!project) {
    redirect("/dashboard")
  }

  return <ProjectWorkspace project={project} />
}
