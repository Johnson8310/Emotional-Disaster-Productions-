"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music2, Trash2, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

interface Project {
  id: string
  name: string
  description: string | null
  bpm: number
  timeSignature: string
  updatedAt: Date
  _count: {
    tracks: number
  }
}

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleOpen = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"?`)) {
      return
    }

    setDeletingId(projectId)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        toast.error("Failed to delete project")
        return
      }

      toast.success("Project deleted")
      router.refresh()
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setDeletingId(null)
    }
  }

  if (projects.length === 0) {
    return (
      <Card className="border-border bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Music2 className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No projects yet</p>
          <p className="text-sm text-muted-foreground">Create your first project to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description || "No description"}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(project.id, project.name)
                }}
                disabled={deletingId === project.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">{project.bpm}</span> BPM
              </div>
              <div>
                <span className="font-medium text-foreground">{project.timeSignature}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">{project._count.tracks}</span> tracks
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </div>

            <Button onClick={() => handleOpen(project.id)} className="w-full">
              Open Project
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
