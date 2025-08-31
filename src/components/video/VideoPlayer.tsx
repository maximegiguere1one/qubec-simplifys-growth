import { forwardRef } from 'react';
import { VideoPlayerProps } from '@/types/video';

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, poster, onTimeUpdate, onPlay, onPause, onLoadedMetadata, className = "" }, ref) => {
    return (
      <video
        ref={ref}
        src={src}
        poster={poster}
        className={`w-full h-full object-cover ${className}`}
        playsInline
        webkit-playsinline="true"
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onLoadedMetadata={onLoadedMetadata}
        preload="metadata"
      />
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";