"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Project {
  id: string
  name: string
  bpm: number
  timeSignature: string
  tracks: any[]
}

interface ProjectContextType {
  project: Project
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  updateProject: (updates: Partial<Project>) => void
  refreshProject: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | null>(null)

export function ProjectProvider({ children, initialProject }: { children: ReactNode; initialProject: Project }) {
  const [project, setProject] = useState<Project>(initialProject)
  const [isPlaying, setIsPlaying] = useState(false)

  const updateProject = (updates: Partial<Project>) => {
    setProject((prev) => ({ ...prev, ...updates }))
  }

  const refreshProject = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`)
      const data = await response.json()
      if (data.project) {
        setProject(data.project)
      }
    } catch (error) {
      console.error("Failed to refresh project:", error)
    }
  }

  return (
    <ProjectContext.Provider value={{ project, isPlaying, setIsPlaying, updateProject, refreshProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider")
  }
  return context
}
