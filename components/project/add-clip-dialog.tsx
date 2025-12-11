"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useProject } from "@/lib/project/project-context"

interface AddClipDialogProps {
  trackId: string
}

export function AddClipDialog({ trackId }: AddClipDialogProps) {
  const { project, refreshProject } = useProject()
  const [open, setOpen] = useState(false)
  const [audioFileId, setAudioFileId] = useState("")
  const [startTime, setStartTime] = useState("0")
  const [endTime, setEndTime] = useState("4")
  const [loading, setLoading] = useState(false)
  const [audioFiles, setAudioFiles] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      // Get all audio files for this project
      const files = project.tracks.flatMap((t: any) =>
        t.clips.map((c: any) => ({
          id: c.audioFile.id,
          name: c.audioFile.originalFilename,
          duration: c.audioFile.durationSeconds,
        })),
      )

      // Deduplicate by id
      const uniqueFiles = Array.from(new Map(files.map((f: any) => [f.id, f])).values())
      setAudioFiles(uniqueFiles)
    }
  }, [open, project.tracks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!audioFileId) {
      toast.error("Please select an audio file")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/tracks/${trackId}/clips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioFileId,
          startTimeSeconds: Number.parseFloat(startTime),
          endTimeSeconds: Number.parseFloat(endTime),
          clipOffsetSeconds: 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to create clip")
        return
      }

      toast.success("Clip added!")
      setOpen(false)
      setAudioFileId("")
      setStartTime("0")
      setEndTime("4")
      refreshProject()
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="h-3 w-3 mr-1" />
          Add Clip
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Clip to Track</DialogTitle>
          <DialogDescription>Place an audio file on the timeline</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio-file-select">Audio File</Label>
            <Select value={audioFileId} onValueChange={setAudioFileId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an audio file" />
              </SelectTrigger>
              <SelectContent>
                {audioFiles.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No audio files uploaded yet</div>
                ) : (
                  audioFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.name}
                      {file.duration && ` (${file.duration.toFixed(2)}s)`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time (s)</Label>
              <Input
                id="start-time"
                type="number"
                step="0.1"
                min="0"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time (s)</Label>
              <Input
                id="end-time"
                type="number"
                step="0.1"
                min="0"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !audioFileId}>
              {loading ? "Adding..." : "Add Clip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
