"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useProject } from "@/lib/project/project-context"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface InspectorProps {
  selectedTrackId: string | null
  selectedClipId: string | null
}

export function Inspector({ selectedTrackId, selectedClipId }: InspectorProps) {
  const { project, refreshProject } = useProject()
  const [trackData, setTrackData] = useState<any>(null)
  const [clipData, setClipData] = useState<any>(null)

  useEffect(() => {
    if (selectedClipId) {
      const track = project.tracks.find((t: any) => t.clips.some((c: any) => c.id === selectedClipId))
      const clip = track?.clips.find((c: any) => c.id === selectedClipId)
      setClipData(clip)
      setTrackData(null)
    } else if (selectedTrackId) {
      const track = project.tracks.find((t: any) => t.id === selectedTrackId)
      setTrackData(track)
      setClipData(null)
    } else {
      setTrackData(null)
      setClipData(null)
    }
  }, [selectedTrackId, selectedClipId, project.tracks])

  const handleUpdateTrack = async (updates: any) => {
    if (!trackData) return

    try {
      const response = await fetch(`/api/tracks/${trackData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await refreshProject()
        toast.success("Track updated")
      } else {
        toast.error("Failed to update track")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleDeleteTrack = async () => {
    if (!trackData) return

    if (!confirm(`Delete track "${trackData.name}"?`)) return

    try {
      const response = await fetch(`/api/tracks/${trackData.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await refreshProject()
        toast.success("Track deleted")
      } else {
        toast.error("Failed to delete track")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleUpdateClip = async (updates: any) => {
    if (!clipData) return

    try {
      const response = await fetch(`/api/clips/${clipData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await refreshProject()
        toast.success("Clip updated")
      } else {
        toast.error("Failed to update clip")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleDeleteClip = async () => {
    if (!clipData) return

    if (!confirm("Delete clip?")) return

    try {
      const response = await fetch(`/api/clips/${clipData.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await refreshProject()
        toast.success("Clip deleted")
      } else {
        toast.error("Failed to delete clip")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  if (clipData) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Clip Properties</h3>
            <Button variant="ghost" size="icon" onClick={handleDeleteClip}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={clipData.name || clipData.audioFile.originalFilename}
                onChange={(e) => handleUpdateClip({ name: e.target.value })}
                onBlur={() => {}}
              />
            </div>

            <div className="space-y-2">
              <Label>Start Time (seconds)</Label>
              <Input
                type="number"
                step="0.1"
                value={clipData.startTimeSeconds}
                onChange={(e) => handleUpdateClip({ startTimeSeconds: Number.parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Time (seconds)</Label>
              <Input
                type="number"
                step="0.1"
                value={clipData.endTimeSeconds}
                onChange={(e) => handleUpdateClip({ endTimeSeconds: Number.parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Clip Offset (seconds)</Label>
              <Input
                type="number"
                step="0.1"
                value={clipData.clipOffsetSeconds}
                onChange={(e) => handleUpdateClip({ clipOffsetSeconds: Number.parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={clipData.color || "#3b82f6"}
                onChange={(e) => handleUpdateClip({ color: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-2">Audio File</h4>
              <p className="text-xs text-muted-foreground">{clipData.audioFile.originalFilename}</p>
              {clipData.audioFile.durationSeconds && (
                <p className="text-xs text-muted-foreground mt-1">
                  Duration: {clipData.audioFile.durationSeconds.toFixed(2)}s
                </p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (trackData) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Track Properties</h3>
            <Button variant="ghost" size="icon" onClick={handleDeleteTrack}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Track Name</Label>
              <Input
                value={trackData.name}
                onChange={(e) => setTrackData({ ...trackData, name: e.target.value })}
                onBlur={() => handleUpdateTrack({ name: trackData.name })}
              />
            </div>

            <div className="space-y-2">
              <Label>Volume: {Math.round(trackData.volume * 100)}%</Label>
              <Slider
                value={[trackData.volume * 100]}
                onValueChange={([value]) => setTrackData({ ...trackData, volume: value / 100 })}
                onValueCommit={([value]) => handleUpdateTrack({ volume: value / 100 })}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Pan: {trackData.pan > 0 ? "R" : trackData.pan < 0 ? "L" : "C"}</Label>
              <Slider
                value={[trackData.pan * 100]}
                onValueChange={([value]) => setTrackData({ ...trackData, pan: value / 100 })}
                onValueCommit={([value]) => handleUpdateTrack({ pan: value / 100 })}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={trackData.color || "#3b82f6"}
                onChange={(e) => handleUpdateTrack({ color: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-2">Stats</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Clips:</span>
                  <span>{trackData.clips.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="uppercase">{trackData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Muted:</span>
                  <span>{trackData.muted ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Solo:</span>
                  <span>{trackData.solo ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        <p>Select a track or clip to view properties</p>
      </div>
    </div>
  )
}
