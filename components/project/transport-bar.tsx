"use client"

import { Play, Pause, Square, ArrowLeft, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useProject } from "@/lib/project/project-context"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { getAudioEngine } from "@/lib/audio/audio-engine"
import { AudioUploadDialog } from "./audio-upload-dialog"

export function TransportBar() {
  const router = useRouter()
  const { project, isPlaying, setIsPlaying, updateProject } = useProject()
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(project.name)
  const [audioEngine] = useState(() => getAudioEngine())
  const [audioLoaded, setAudioLoaded] = useState(false)

  useEffect(() => {
    const loadAudio = async () => {
      for (const track of project.tracks) {
        for (const clip of track.clips) {
          if (!clip.audioBuffer && clip.audioFile) {
            const url = `/api/audio-files/${clip.audioFile.id}/stream`
            const buffer = await audioEngine.loadAudioFile(url)
            if (buffer) {
              clip.audioBuffer = buffer
            }
          }
        }
      }
      setAudioLoaded(true)
    }

    loadAudio()
  }, [project.tracks, audioEngine])

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioEngine.pause()
      setIsPlaying(false)
    } else {
      if (!audioLoaded) {
        toast.error("Audio files are still loading...")
        return
      }

      try {
        await audioEngine.play(project.tracks)
        setIsPlaying(true)
      } catch (error) {
        console.error("[v0] Playback error:", error)
        toast.error("Failed to start playback")
      }
    }
  }

  const handleStop = () => {
    audioEngine.stop()
    setIsPlaying(false)
  }

  const handleSaveName = async () => {
    if (name === project.name) {
      setEditingName(false)
      return
    }

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        updateProject({ name })
        toast.success("Project name updated")
      } else {
        toast.error("Failed to update name")
        setName(project.name)
      }
    } catch (error) {
      toast.error("An error occurred")
      setName(project.name)
    }

    setEditingName(false)
  }

  return (
    <div className="h-16 border-b border-border bg-card flex items-center px-6 gap-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex items-center gap-2 flex-1">
        <Music className="h-5 w-5 text-primary" />
        {editingName ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName()
              if (e.key === "Escape") {
                setName(project.name)
                setEditingName(false)
              }
            }}
            className="w-64 h-8"
            autoFocus
          />
        ) : (
          <h1 className="text-lg font-semibold cursor-pointer hover:text-primary" onClick={() => setEditingName(true)}>
            {project.name}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">BPM:</span>
          <span className="font-mono font-semibold">{project.bpm}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Time:</span>
          <span className="font-mono font-semibold">{project.timeSignature}</span>
        </div>
      </div>

      <AudioUploadDialog />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePlayPause}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={handleStop}>
          <Square className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
