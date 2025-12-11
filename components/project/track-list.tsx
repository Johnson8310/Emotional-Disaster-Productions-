"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Volume2, VolumeX, Circle } from "lucide-react"
import { useProject } from "@/lib/project/project-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AddClipDialog } from "./add-clip-dialog"

interface TrackListProps {
  onSelectTrack: (trackId: string) => void
  selectedTrackId: string | null
}

export function TrackList({ onSelectTrack, selectedTrackId }: TrackListProps) {
  const { project, refreshProject } = useProject()

  const handleAddTrack = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Track ${project.tracks.length + 1}` }),
      })

      if (!response.ok) {
        toast.error("Failed to create track")
        return
      }

      toast.success("Track created")
      refreshProject()
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleToggleMute = async (trackId: string, currentMuted: boolean) => {
    try {
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muted: !currentMuted }),
      })

      if (response.ok) {
        refreshProject()
      }
    } catch (error) {
      console.error("Failed to toggle mute:", error)
    }
  }

  const handleToggleSolo = async (trackId: string, currentSolo: boolean) => {
    try {
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solo: !currentSolo }),
      })

      if (response.ok) {
        refreshProject()
      }
    } catch (error) {
      console.error("Failed to toggle solo:", error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button onClick={handleAddTrack} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Track
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {project.tracks.map((track: any) => (
            <div key={track.id} className="space-y-1">
              <div
                className={cn(
                  "p-3 rounded-md border border-border cursor-pointer transition-colors hover:bg-secondary/50",
                  selectedTrackId === track.id && "bg-secondary border-primary",
                )}
                onClick={() => onSelectTrack(track.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: track.color || "#3b82f6" }}
                    />
                    <span className="font-medium text-sm truncate">{track.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6", track.muted && "text-accent")}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleMute(track.id, track.muted)
                    }}
                  >
                    {track.muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6", track.solo && "text-primary")}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleSolo(track.id, track.solo)
                    }}
                  >
                    <Circle className="h-3 w-3" fill={track.solo ? "currentColor" : "none"} />
                  </Button>
                </div>
              </div>
              <div className="px-2">
                <AddClipDialog trackId={track.id} />
              </div>
            </div>
          ))}

          {project.tracks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <p>No tracks yet</p>
              <p className="text-xs mt-1">Click above to add a track</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
