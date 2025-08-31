import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { ControlBarProps } from '@/types/video';

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
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 safe-area-inset-bottom ${className}`}>
      <ProgressBar 
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        className="mb-3"
      />
      
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 btn-touch"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <span className="text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMute}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 btn-touch"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 btn-touch"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};