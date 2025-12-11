import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/get-user"
import { prisma } from "@/lib/db/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProjectList } from "@/components/dashboard/project-list"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { tracks: true },
      },
    },
  })

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { name: true, email: true },
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={dbUser?.name || dbUser?.email || "User"} />

      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-balance">Your Projects</h2>
            <p className="text-muted-foreground">Manage and create your music projects</p>
          </div>
          <CreateProjectDialog />
        </div>

        <ProjectList projects={projects} />
      </main>
    </div>
  )
}
