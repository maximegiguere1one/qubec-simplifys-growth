import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { ControlBar } from "@/components/video/ControlBar";
import { VSLCTAOverlay } from "@/components/video/VSLCTAOverlay";
import { ANALYTICS_EVENTS, CTA_LOCATIONS } from "@/lib/constants/analytics";
import { trackEvent } from "@/lib/analytics";

interface VSLVideoProps {
  onCTAClick: () => void;
}

export const VSLVideo = ({ onCTAClick }: VSLVideoProps) => {
  const { videoRef, state, controls } = useVideoPlayer();
  const [showCTA, setShowCTA] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [hasTrackedPlay, setHasTrackedPlay] = useState(false);

  const videoUrl = "https://lbwjesrgernvjiorktia.supabase.co/storage/v1/object/public/vsl%20et%20marketing/VSL%20V3%20.mp4";

  // Track video view
  useEffect(() => {
    if (!hasTrackedView) {
      trackEvent(ANALYTICS_EVENTS.VSL.VIEW, { timestamp: Date.now() });
      setHasTrackedView(true);
    }
  }, [hasTrackedView]);

  // Show CTA at specific times and track progress
  useEffect(() => {
    const current = Math.floor(state.currentTime);
    
    // Show CTA at 60s and 90s
    if (current === 60 || current === 90) {
      setShowCTA(true);
      setTimeout(() => setShowCTA(false), 10000); // Hide after 10s
    }
    
    // Track video progress
    const progress = current / state.duration;
    if (progress >= 0.25 && progress < 0.26) trackEvent(ANALYTICS_EVENTS.VSL.PLAY, { progress: '25%' });
    if (progress >= 0.50 && progress < 0.51) trackEvent(ANALYTICS_EVENTS.VSL.PLAY, { progress: '50%' });
    if (progress >= 0.75 && progress < 0.76) trackEvent(ANALYTICS_EVENTS.VSL.PLAY, { progress: '75%' });
    if (progress >= 0.99) trackEvent(ANALYTICS_EVENTS.VSL.PLAY, { progress: '100%' });
  }, [state.currentTime, state.duration]);

  // Track playback events
  useEffect(() => {
    if (state.isPlaying && !hasTrackedPlay) {
      trackEvent(ANALYTICS_EVENTS.VSL.PLAY, { 
        action: 'start',
        timestamp: Date.now(),
        currentTime: state.currentTime 
      });
      setHasTrackedPlay(true);
    }
  }, [state.isPlaying, hasTrackedPlay, state.currentTime]);

  const handleCTAClick = () => {
    trackEvent(ANALYTICS_EVENTS.VSL.CTA_CLICK, { 
      cta_location: CTA_LOCATIONS.OVERLAY,
      video_time: state.currentTime 
    });
    onCTAClick();
  };

  return (
    <div className="max-w-4xl mx-auto section-mobile relative">
      <Card className="overflow-hidden shadow-strong">
        {/* Video Player */}
        <div className="relative bg-black aspect-video touch-manipulation">
          {/* Actual Video Element */}
          <VideoPlayer
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
          />

          {/* Play button overlay for initial state */}
          {state.currentTime === 0 && !state.isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4">
              <div className="text-center text-white max-w-lg mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 cursor-pointer hover:bg-white/30 transition-colors backdrop-blur-sm btn-touch" onClick={controls.togglePlay}>
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 ml-1" />
                </div>
                <h3 className="text-responsive-base sm:text-responsive-lg font-bold mb-3 sm:mb-4 drop-shadow-lg">
                  One Système - Votre transformation commence ici
                </h3>
                <p className="text-sm sm:text-base opacity-90 drop-shadow-md">
                  Découvrez comment économiser 10-25h par semaine et automatiser votre PME québécoise
                </p>
                <div className="mt-4">
                  <Button onClick={controls.togglePlay} variant="cta-large" className="btn-touch">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    Regarder la vidéo (4 min)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* CTA Overlay */}
          <VSLCTAOverlay
            isVisible={showCTA}
            onCTAClick={handleCTAClick}
          />

          {/* Video Controls */}
          {state.duration > 0 && (
            <ControlBar
              isPlaying={state.isPlaying}
              isMuted={state.isMuted}
              currentTime={state.currentTime}
              duration={state.duration}
              onTogglePlay={controls.togglePlay}
              onToggleMute={controls.toggleMute}
              onSeek={controls.seek}
              onToggleFullscreen={controls.toggleFullscreen}
            />
          )}
        </div>

        {/* Video Description */}
        <div className="p-4 sm:p-6 bg-secondary/30">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h4 className="text-responsive-base font-semibold mb-2">
                One Système - La transformation de votre PME québécoise
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Découvrez comment plus de 200 entreprises du Québec ont automatisé leurs opérations et économisé 10-25 heures par semaine avec notre solution 100% locale.
              </p>
            </div>
            <div className="text-left sm:text-right text-sm text-muted-foreground flex-shrink-0">
              <p>4 min</p>
              <p>Québec, 2024</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};