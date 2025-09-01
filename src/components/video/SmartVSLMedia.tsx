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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasError, setHasError] = useState(false);
  const [videoSource, setVideoSource] = useState<ReturnType<typeof parseVideoSource> | null>(null);
  const [iframePlaying, setIframePlaying] = useState(false);
  const [iframeMuted, setIframeMuted] = useState(true);
  const [youtubeReady, setYoutubeReady] = useState(false);

  // Helper function to send commands to iframe players
  const sendIframeCommand = (command: string, args?: any) => {
    if (!iframeRef.current) return;
    
    if (videoSource?.type === 'youtube') {
      if (youtubeReady) {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: command, args: args || [] }),
          'https://www.youtube.com'
        );
      }
    } else if (videoSource?.type === 'vimeo') {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ method: command }),
        'https://player.vimeo.com'
      );
    }
  };

  // YouTube API setup
  useEffect(() => {
    if (videoSource?.type === 'youtube') {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://www.youtube.com') return;
        
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'onReady') {
            setYoutubeReady(true);
            // Request state updates
            sendIframeCommand('addEventListener', ['onStateChange']);
          } else if (data.event === 'onStateChange') {
            // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            const state = data.info;
            setIframePlaying(state === 1);
            if (state === 1) onPlay?.();
            if (state === 2) onPause?.();
          }
        } catch (e) {
          // Ignore invalid JSON
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Send listening event to initialize YouTube API
      if (iframeRef.current) {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({ event: 'listening' }),
          'https://www.youtube.com'
        );
      }

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [videoSource, onPlay, onPause]);

  useImperativeHandle(ref, () => ({
    play: async () => {
      // If it's an MP4, control the HTML5 video
      if (videoSource?.type === 'mp4') {
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
      } else {
        // For YouTube/Vimeo iframes, send play command
        if (videoSource?.type === 'youtube') {
          sendIframeCommand('playVideo');
          // Don't manually set state, let the API event handler do it
        } else if (videoSource?.type === 'vimeo') {
          sendIframeCommand('play');
          setIframePlaying(true);
          onPlay?.();
        }
        return Promise.resolve();
      }
    },
    pause: () => {
      if (videoSource?.type === 'mp4' && videoRef.current) {
        videoRef.current.pause();
      } else {
        // For YouTube/Vimeo iframes, send pause command
        if (videoSource?.type === 'youtube') {
          sendIframeCommand('pauseVideo');
          // Don't manually set state, let the API event handler do it
        } else if (videoSource?.type === 'vimeo') {
          sendIframeCommand('pause');
          setIframePlaying(false);
          onPause?.();
        }
      }
    },
    get currentTime() {
      if (videoSource?.type === 'mp4') {
        return videoRef.current?.currentTime || 0;
      }
      // For iframes, we can't get real-time data without full API integration
      return 0;
    },
    get duration() {
      if (videoSource?.type === 'mp4') {
        return videoRef.current?.duration || 0;
      }
      // For iframes, we can't get duration without full API integration
      return 100; // Fake duration for progress bar
    },
    get paused() {
      if (videoSource?.type === 'mp4') {
        return videoRef.current?.paused ?? true;
      }
      return !iframePlaying;
    },
    get muted() {
      if (videoSource?.type === 'mp4') {
        return videoRef.current?.muted ?? true;
      }
      return iframeMuted;
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

  // For YouTube/Vimeo, render iframe with ref for control
  if (videoSource.type === 'youtube' || videoSource.type === 'vimeo') {
    return (
      <div className={`w-full h-full ${className}`} onClick={onClick}>
        <iframe
          ref={iframeRef}
          src={videoSource.embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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