import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize2, Calendar } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface VSLVideoProps {
  onCTAClick: () => void;
}

export const VSLVideo = ({ onCTAClick }: VSLVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = "https://lbwjesrgernvjiorktia.supabase.co/storage/v1/object/public/vsl%20et%20marketing/VSL%20V3%20.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = Math.floor(video.currentTime);
      setCurrentTime(current);
      
      // Show CTA at 60s and 90s
      if (current === 60 || current === 90) {
        setShowCTA(true);
        setTimeout(() => setShowCTA(false), 10000); // Hide after 10s
      }
      
      // Track video progress
      const progress = current / video.duration;
      if (progress >= 0.25 && progress < 0.26) trackEvent('vsl_play', { progress: '25%' });
      if (progress >= 0.50 && progress < 0.51) trackEvent('vsl_play', { progress: '50%' });
      if (progress >= 0.75 && progress < 0.76) trackEvent('vsl_play', { progress: '75%' });
      if (progress >= 0.99) trackEvent('vsl_play', { progress: '100%' });
    };

    const handleLoadedMetadata = () => {
      setDuration(Math.floor(video.duration));
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (currentTime === 0) {
        trackEvent('vsl_play', { action: 'start' });
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [currentTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16 relative px-4 sm:px-0">
      <Card className="overflow-hidden shadow-strong">
        {/* Video Player */}
        <div className="relative bg-black aspect-video touch-manipulation">
          {/* Actual Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster=""
            preload="metadata"
            playsInline
            webkit-playsinline="true"
            onClick={togglePlay}
          >
            <source src={videoUrl} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>

          {/* Play button overlay for initial state */}
          {currentTime === 0 && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="text-center text-white px-4 sm:px-6 md:px-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 cursor-pointer hover:bg-white/30 transition-colors backdrop-blur-sm btn-touch" onClick={togglePlay}>
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 ml-1" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 drop-shadow-lg">
                  One Système - Votre transformation commence ici
                </h3>
                <p className="text-base sm:text-lg opacity-90 max-w-2xl drop-shadow-md">
                  Découvrez comment économiser 10-25h par semaine et automatiser votre PME québécoise
                </p>
                <div className="mt-4">
                  <Button onClick={togglePlay} variant="cta-large" className="mb-2 btn-touch">
                    <Play className="w-6 h-6 mr-2" />
                    Regarder la vidéo (4 min)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* CTA Overlay */}
          {showCTA && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center animate-in fade-in duration-500">
              <Card className="p-6 m-4 text-center">
                <h4 className="text-xl font-bold mb-4 text-foreground">
                  Prêt à transformer votre entreprise ?
                </h4>
                <Button onClick={onCTAClick} variant="cta" size="lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Réserver mon diagnostic gratuit
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  30 min • Gratuit • Sans engagement
                </p>
              </Card>
            </div>
          )}

          {/* Video Controls */}
          {duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 safe-area-inset-bottom">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 btn-touch"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <div className="flex-1">
                  <div 
                    className="flex-1 bg-white/30 rounded-full h-2 cursor-pointer mb-2"
                    onClick={handleSeek}
                  >
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-white text-xs">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 btn-touch"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 btn-touch"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Video Description */}
        <div className="p-4 sm:p-6 bg-secondary/30">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-2">
                One Système - La transformation de votre PME québécoise
              </h4>
              <p className="text-muted-foreground text-sm">
                Découvrez comment plus de 200 entreprises du Québec ont automatisé leurs opérations et économisé 10-25 heures par semaine avec notre solution 100% locale.
              </p>
            </div>
            <div className="text-left sm:text-right text-sm text-muted-foreground">
              <p>4 min</p>
              <p>Québec, 2024</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};