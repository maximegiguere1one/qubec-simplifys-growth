import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getABVariant, trackVSLEvent, trackCTAClick, trackABConversion } from '@/lib/analytics';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';

interface EnhancedVSLPlayerProps {
  onCTAClick: () => void;
  quizScore?: number;
}

export const EnhancedVSLPlayer = ({ onCTAClick, quizScore = 0 }: EnhancedVSLPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const { isMobile, mobileButtonClass, animationClass } = useMobileOptimized();
  
  // A/B test variants
  const videoVariant = getABVariant("vsl_video", ["main", "short", "personalized"]);
  const ctaVariant = getABVariant("vsl_cta", ["standard", "urgent", "personal"]);
  
  // Use the working Supabase video URL for all variants
  const getVideoSource = () => {
    return "https://lbwjesrgernvjiorktia.supabase.co/storage/v1/object/public/vsl%20et%20marketing/VSL%20V3%20.mp4";
  };

  const getCTAText = () => {
    switch (ctaVariant) {
      case "urgent":
        return "Réservez MAINTENANT - Places limitées";
      case "personal":
        return quizScore >= 16 
          ? "Parlons de votre solution personnalisée"
          : "Découvrez votre solution sur mesure";
      default:
        return "Réserver ma consultation gratuite";
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
      
      // Show CTA at 70% for main video, 50% for short
      const ctaThreshold = videoVariant === "short" ? 50 : 70;
      if (currentProgress >= ctaThreshold && !showCTA) {
        setShowCTA(true);
        trackVSLEvent('cta_show', { 
          progress: currentProgress, 
          variant: ctaVariant,
          video_variant: videoVariant 
        });
      }
      
      // Track progress milestones
      if ([25, 50, 75, 100].includes(Math.floor(currentProgress))) {
        trackVSLEvent('progress', { 
          progress: Math.floor(currentProgress),
          video_variant: videoVariant
        });
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (!hasStartedPlaying) {
        setHasStartedPlaying(true);
        trackVSLEvent('play', { video_variant: videoVariant });
        trackABConversion("vsl_video", videoVariant, "play");
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      trackVSLEvent('pause', { 
        progress, 
        video_variant: videoVariant 
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      trackVSLEvent('complete', { video_variant: videoVariant });
      trackABConversion("vsl_video", videoVariant, "complete");
    };

    const handleError = () => {
      setHasError(true);
      console.error('Video loading error');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [hasStartedPlaying, progress, showCTA, videoVariant, ctaVariant]);

  const handleCTAClick = () => {
    trackCTAClick('vsl_overlay', ctaVariant, '/book-call');
    trackABConversion("vsl_cta", ctaVariant, "click");
    onCTAClick();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <Card className="overflow-hidden shadow-strong">
      <div className="relative group" 
           onMouseEnter={() => setShowControls(true)}
           onMouseLeave={() => setShowControls(false)}
           onTouchStart={() => setShowControls(true)}>
        <video
          ref={videoRef}
          src={getVideoSource()}
          poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzAwMCIvPiA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+T25lIFN5c3TDqW1lIC0gVm90cmUgdHJhbnNmb3JtYXRpb24gY29tbWVuY2UgaWNpPC90ZXh0PiA8L3N2Zz4="
          className="w-full h-auto"
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          muted={isMuted}
        />
        
        {/* Central Play Button for initial state */}
        {!hasStartedPlaying && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors backdrop-blur-sm" onClick={togglePlay}>
                <Play className="w-10 h-10 ml-1" />
              </div>
              <h3 className="text-lg font-bold mb-2">One Système - Votre transformation commence ici</h3>
              <p className="text-sm opacity-90">Découvrez comment économiser 10-25h par semaine</p>
            </div>
          </div>
        )}
        
        {/* Mobile-friendly Controls */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 flex items-center justify-center ${
          isMobile ? (showControls ? 'opacity-100' : 'opacity-0') : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 w-12 h-12"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20 w-12 h-12"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* CTA Overlay */}
        {showCTA && (
          <div className={`absolute inset-0 flex items-end justify-center p-4 sm:p-6 pointer-events-none ${animationClass}`}>
            <div className="pointer-events-auto w-full max-w-md">
              <Button
                variant={ctaVariant === "urgent" ? "destructive" : "cta-large"}
                onClick={handleCTAClick}
                className={`${mobileButtonClass} shadow-xl`}
                size="lg"
              >
                {getCTAText()}
              </Button>
              
              {ctaVariant === "urgent" && (
                <p className="text-white text-center text-sm mt-2 font-medium">
                  ⏰ Seulement 3 places disponibles cette semaine
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};