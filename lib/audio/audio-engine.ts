/**
 * Web Audio API based playback engine for the DAW
 * This is a basic implementation with placeholders for future enhancements
 */

interface AudioClip {
  id: string
  audioFileId: string
  startTimeSeconds: number
  endTimeSeconds: number
  clipOffsetSeconds: number
  audioBuffer?: AudioBuffer
  url: string
}

interface Track {
  id: string
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  clips: AudioClip[]
}

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private masterGainNode: GainNode | null = null
  private activeSourceNodes: Map<string, AudioBufferSourceNode> = new Map()
  private isPlaying = false
  private startTime = 0
  private currentTime = 0

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new AudioContext()
      this.masterGainNode = this.audioContext.createGain()
      this.masterGainNode.connect(this.audioContext.destination)
    }
  }

  /**
   * Load an audio file from URL and decode it to AudioBuffer
   */
  async loadAudioFile(url: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      return audioBuffer
    } catch (error) {
      console.error("[v0] Failed to load audio file:", error)
      return null
    }
  }

  /**
   * Start playback of all clips across all tracks
   * TODO: Implement precise scheduling with AudioContext.currentTime
   * TODO: Handle track mute/solo states
   * TODO: Implement looping
   */
  async play(tracks: Track[]) {
    if (!this.audioContext || !this.masterGainNode) return

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume()
    }

    this.isPlaying = true
    this.startTime = this.audioContext.currentTime - this.currentTime

    // TODO: In a real DAW, we would schedule clips more precisely
    // For now, this demonstrates the basic concept

    for (const track of tracks) {
      if (track.muted) continue

      // Create track gain node for volume control
      const trackGainNode = this.audioContext.createGain()
      trackGainNode.gain.value = track.volume
      trackGainNode.connect(this.masterGainNode)

      // TODO: Add pan node for stereo panning
      // const panNode = this.audioContext.createStereoPanner()
      // panNode.pan.value = track.pan

      for (const clip of track.clips) {
        if (!clip.audioBuffer) {
          console.error("[v0] Clip has no audio buffer loaded:", clip.id)
          continue
        }

        const source = this.audioContext.createBufferSource()
        source.buffer = clip.audioBuffer
        source.connect(trackGainNode)

        // Calculate when to start this clip
        const clipStartTime = this.startTime + clip.startTimeSeconds
        const clipDuration = clip.endTimeSeconds - clip.startTimeSeconds

        // Start playback with offset
        source.start(clipStartTime, clip.clipOffsetSeconds, clipDuration)

        this.activeSourceNodes.set(clip.id, source)

        // Clean up when finished
        source.onended = () => {
          this.activeSourceNodes.delete(clip.id)
        }
      }
    }

    console.log(`[v0] Started playback with ${this.activeSourceNodes.size} active sources`)
  }

  /**
   * Stop all audio playback
   */
  stop() {
    if (!this.audioContext) return

    this.isPlaying = false
    this.currentTime = 0

    // Stop all active source nodes
    for (const [clipId, source] of this.activeSourceNodes.entries()) {
      try {
        source.stop()
      } catch (error) {
        // Source may have already stopped
      }
    }

    this.activeSourceNodes.clear()
    console.log("[v0] Stopped playback")
  }

  /**
   * Pause playback (TODO: implement proper pause/resume)
   */
  pause() {
    if (!this.audioContext) return

    this.isPlaying = false
    this.currentTime = this.audioContext.currentTime - this.startTime

    // Stop all active sources
    for (const source of this.activeSourceNodes.values()) {
      try {
        source.stop()
      } catch (error) {
        // Source may have already stopped
      }
    }

    this.activeSourceNodes.clear()
    console.log("[v0] Paused playback at:", this.currentTime)
  }

  /**
   * Get current playback state
   */
  getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      currentTime:
        this.isPlaying && this.audioContext ? this.audioContext.currentTime - this.startTime : this.currentTime,
    }
  }

  /**
   * Update track volume in real-time
   * TODO: Connect to live gain nodes during playback
   */
  setTrackVolume(trackId: string, volume: number) {
    // TODO: Update the gain node for this track if actively playing
    console.log(`[v0] Set track ${trackId} volume to ${volume}`)
  }

  /**
   * Update track pan in real-time
   * TODO: Connect to live pan nodes during playback
   */
  setTrackPan(trackId: string, pan: number) {
    // TODO: Update the pan node for this track if actively playing
    console.log(`[v0] Set track ${trackId} pan to ${pan}`)
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine()
  }
  return audioEngineInstance
}
