"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { useProject } from "@/lib/project/project-context"

interface MixerPanelProps {
  onSelectTrack: (trackId: string) => void
}

export function MixerPanel({ onSelectTrack }: MixerPanelProps) {
  const { project, refreshProject } = useProject()

  const handleVolumeChange = async (trackId: string, volume: number) => {
    try {
      await fetch(`/api/tracks/${trackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volume }),
      })
      refreshProject()
    } catch (error) {
      console.error("Failed to update volume:", error)
    }
  }

  const handlePanChange = async (trackId: string, pan: number) => {
    try {
      await fetch(`/api/tracks/${trackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pan }),
      })
      refreshProject()
    } catch (error) {
      console.error("Failed to update pan:", error)
    }
  }

  return (
    <ScrollArea orientation="horizontal" className="h-full">
      <div className="flex h-full p-4 gap-3">
        {project.tracks.map((track: any) => (
          <div
            key={track.id}
            className="w-24 flex flex-col items-center gap-2 cursor-pointer hover:bg-secondary/30 p-2 rounded-md transition-colors"
            onClick={() => onSelectTrack(track.id)}
          >
            <span className="text-xs font-medium truncate w-full text-center">{track.name}</span>

            <div className="flex-1 flex flex-col items-center justify-end gap-2">
              <Slider
                orientation="vertical"
                value={[track.volume * 100]}
                onValueChange={([value]) => handleVolumeChange(track.id, value / 100)}
                max={100}
                step={1}
                className="h-20"
              />
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {track.muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground font-mono">{Math.round(track.volume * 100)}%</div>
          </div>
        ))}

        {/* Master Channel */}
        <div className="w-24 flex flex-col items-center gap-2 bg-primary/5 p-2 rounded-md border border-primary/20">
          <span className="text-xs font-bold">MASTER</span>
          <div className="flex-1 flex flex-col items-center justify-end gap-2">
            <Slider orientation="vertical" value={[75]} max={100} step={1} className="h-20" />
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Volume2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground font-mono">75%</div>
        </div>
      </div>
    </ScrollArea>
  )
}
