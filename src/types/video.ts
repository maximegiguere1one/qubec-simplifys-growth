export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  volume: number;
  isLoaded: boolean;
}

export interface VideoPlayerControls {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleFullscreen: () => void;
}

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onLoadedMetadata?: () => void;
  className?: string;
}

export interface CTAOverlayProps {
  isVisible: boolean;
  onCTAClick: () => void;
  className?: string;
}

export interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

export interface ControlBarProps {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSeek: (time: number) => void;
  onToggleFullscreen: () => void;
  className?: string;
}