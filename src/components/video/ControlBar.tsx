import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { ControlBarProps } from '@/types/video';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';

export const ControlBar = ({
  isPlaying,
  isMuted,
  currentTime,
  duration,
  onTogglePlay,
  onToggleMute,
  onSeek,
  onToggleFullscreen,
  className = ""
}: ControlBarProps) => {
  const { formatTime } = useVideoPlayer();

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onTogglePlay}
          className="text-white hover:bg-white/10 p-2 btn-touch"
        >
          {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
        </Button>

        {/* Progress Bar */}
        <div className="flex-1 min-w-0">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
          />
        </div>

        {/* Time Display - Hidden on very small screens */}
        <span className="hidden xs:inline-block text-white text-xs sm:text-sm font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Volume Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMute}
          className="text-white hover:bg-white/10 p-2 btn-touch"
        >
          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        </Button>

        {/* Fullscreen Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFullscreen}
          className="text-white hover:bg-white/10 p-2 btn-touch"
        >
          <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  );
};