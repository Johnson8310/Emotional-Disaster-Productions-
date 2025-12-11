"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { useProject } from "@/lib/project/project-context"
import { cn } from "@/lib/utils"

interface TimelineProps {
  onSelectClip: (clipId: string | null) => void
  selectedClipId: string | null
  onSelectTrack: (trackId: string) => void
}

export function Timeline({ onSelectClip, selectedClipId, onSelectTrack }: TimelineProps) {
  const { project } = useProject()

  // Generate time markers (every 4 seconds for now)
  const timeMarkers = Array.from({ length: 25 }, (_, i) => i * 4)
  const pixelsPerSecond = 40

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Time ruler */}
      <div className="h-10 border-b border-border bg-secondary/30 overflow-hidden">
        <ScrollArea orientation="horizontal" className="h-full">
          <div className="flex items-end h-full px-4 relative" style={{ width: `${timeMarkers.length * 160}px` }}>
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute flex flex-col items-center"
                style={{ left: `${time * pixelsPerSecond}px` }}
              >
                <span className="text-xs text-muted-foreground font-mono mb-1">{time}s</span>
                <div className="w-px h-2 bg-border" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Track lanes */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {project.tracks.map((track: any, index: number) => (
            <div
              key={track.id}
              className="relative h-20 bg-secondary/20 border border-border rounded-md overflow-hidden"
              onClick={() => onSelectTrack(track.id)}
            >
              {/* Track background grid */}
              <div className="absolute inset-0 flex">
                {timeMarkers.map((time) => (
                  <div key={time} className="border-r border-border/30" style={{ width: `${160}px` }} />
                ))}
              </div>

              {/* Clips */}
              <div className="relative h-full">
                {track.clips.map((clip: any) => {
                  const startX = clip.startTimeSeconds * pixelsPerSecond
                  const width = (clip.endTimeSeconds - clip.startTimeSeconds) * pixelsPerSecond

                  return (
                    <div
                      key={clip.id}
                      className={cn(
                        "absolute top-1 h-[calc(100%-8px)] rounded cursor-pointer border-2 transition-colors",
                        "hover:border-primary/70",
                        selectedClipId === clip.id ? "border-primary bg-primary/20" : "border-accent/50 bg-accent/10",
                      )}
                      style={{
                        left: `${startX}px`,
                        width: `${width}px`,
                        backgroundColor: clip.color ? `${clip.color}40` : undefined,
                        borderColor: clip.color || undefined,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectClip(clip.id)
                      }}
                    >
                      <div className="p-2 truncate text-xs font-medium">
                        {clip.name || clip.audioFile.originalFilename}
                      </div>
                      <div className="absolute bottom-1 right-1 text-[10px] text-muted-foreground font-mono">
                        {clip.startTimeSeconds.toFixed(1)}s
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {project.tracks.length === 0 && (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              <p>Add tracks to start arranging clips</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
