import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { parseVideoSource } from '@/lib/videoSource';

interface SmartVSLMediaProps {
  src: string;
  poster?: string;
  onTimeUpdate?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onLoadedMetadata?: () => void;
  onError?: () => void;
  muted?: boolean;
  autoPlay?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface SmartVSLMediaRef {
  play: () => Promise<void>;
  pause: () => void;
  currentTime: number;
  duration: number;
  paused: boolean;
  muted: boolean;
}

export const SmartVSLMedia = forwardRef<SmartVSLMediaRef, SmartVSLMediaProps>(({
  src,
  poster,
  onTimeUpdate,
  onPlay,
  onPause,
  onLoadedMetadata,
  onError,
  muted = true,
  autoPlay = false,
  className = "",
  onClick
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [videoSource, setVideoSource] = useState<ReturnType<typeof parseVideoSource> | null>(null);

  useImperativeHandle(ref, () => ({
    play: async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
        } catch (error) {
          console.error('Erreur lors de la lecture de la vidéo:', error);
          setHasError(true);
          onError?.();
          throw error;
        }
      } else {
        throw new Error('Vidéo non disponible');
      }
    },
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    get currentTime() {
      return videoRef.current?.currentTime || 0;
    },
    get duration() {
      return videoRef.current?.duration || 0;
    },
    get paused() {
      return videoRef.current?.paused ?? true;
    },
    get muted() {
      return videoRef.current?.muted ?? true;
    }
  }));

  useEffect(() => {
    try {
      const parsed = parseVideoSource(src);
      setVideoSource(parsed);
      setHasError(false);
    } catch (error) {
      console.error('Erreur lors du parsing de la source vidéo:', error);
      setHasError(true);
      onError?.();
    }
  }, [src, onError]);

  const handleVideoError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError || !videoSource) {
    return (
      <div className={`w-full h-full bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <p className="text-sm text-muted-foreground mb-2">
            Impossible de charger la vidéo
          </p>
          <p className="text-xs text-muted-foreground">
            Vérifiez que l'URL est valide (YouTube, Vimeo, ou fichier MP4)
          </p>
        </div>
      </div>
    );
  }

  // For YouTube/Vimeo, render iframe (limited control)
  if (videoSource.type === 'youtube' || videoSource.type === 'vimeo') {
    return (
      <div className={`w-full h-full ${className}`} onClick={onClick}>
        <iframe
          src={videoSource.embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="VSL Video"
        />
      </div>
    );
  }

  // For MP4, render video element with full control
  return (
    <video
      ref={videoRef}
      src={videoSource.src}
      poster={poster}
      className={`w-full h-full object-cover ${className}`}
      playsInline
      muted={muted}
      autoPlay={autoPlay}
      onTimeUpdate={onTimeUpdate}
      onPlay={onPlay}
      onPause={onPause}
      onLoadedMetadata={onLoadedMetadata}
      onError={handleVideoError}
      onClick={onClick}
      preload="metadata"
    />
  );
});