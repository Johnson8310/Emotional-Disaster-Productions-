"use client"

import { useState } from "react"
import { TransportBar } from "./transport-bar"
import { TrackList } from "./track-list"
import { Timeline } from "./timeline"
import { MixerPanel } from "./mixer-panel"
import { Inspector } from "./inspector"
import { ProjectProvider } from "@/lib/project/project-context"

interface ProjectWorkspaceProps {
  project: any
}

export function ProjectWorkspace({ project }: ProjectWorkspaceProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)

  return (
    <ProjectProvider initialProject={project}>
      <div className="h-screen flex flex-col bg-background">
        <TransportBar />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Track List */}
          <div className="w-64 border-r border-border bg-card overflow-y-auto">
            <TrackList onSelectTrack={setSelectedTrackId} selectedTrackId={selectedTrackId} />
          </div>

          {/* Center - Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Timeline
              onSelectClip={setSelectedClipId}
              selectedClipId={selectedClipId}
              onSelectTrack={setSelectedTrackId}
            />

            {/* Bottom - Mixer */}
            <div className="h-48 border-t border-border bg-card overflow-x-auto">
              <MixerPanel onSelectTrack={setSelectedTrackId} />
            </div>
          </div>

          {/* Right Sidebar - Inspector */}
          <div className="w-80 border-l border-border bg-card overflow-y-auto">
            <Inspector selectedTrackId={selectedTrackId} selectedClipId={selectedClipId} />
          </div>
        </div>
      </div>
    </ProjectProvider>
  )
}
