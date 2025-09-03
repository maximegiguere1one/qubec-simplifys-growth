import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Play, Pause, Maximize } from 'lucide-react';
import { trackEvent, getABVariant, trackVSLEvent } from '@/lib/analytics';
import { getCalDataAttributes } from '@/lib/cal';
import { SmartVSLMedia, SmartVSLMediaRef } from '@/components/video/SmartVSLMedia';
import { ProgressBar } from '@/components/video/ProgressBar';
interface VSLHeroProps {
  videoSrc: string;
  fallbackSrc?: string;
  posterSrc: string;
  onCTAClick: (section?: string) => void;
  quizResults?: any;
  isMobile: boolean;
}
export const VSLHero = ({
  videoSrc,
  fallbackSrc,
  posterSrc,
  onCTAClick,
  quizResults,
  isMobile
}: VSLHeroProps) => {
  const videoRef = useRef<SmartVSLMediaRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showStickyDesktop, setShowStickyDesktop] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showPlayHint, setShowPlayHint] = useState(true);
  const [showCenterButton, setShowCenterButton] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(videoSrc);
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse activity tracking
  const handleMouseMove = () => {
    setShowControls(true);
    if (mouseTimeoutRef.current) {
      clearTimeout(mouseTimeoutRef.current);
    }
    mouseTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000); // Hide after 3 seconds of inactivity
  };

  useEffect(() => {
    return () => {
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  // Time formatting utility
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle video error with fallback
  const handleVideoError = () => {
    if (fallbackSrc && currentVideoSrc !== fallbackSrc) {
      console.log('Switching to fallback video source:', fallbackSrc);
      setCurrentVideoSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  // Event handlers
  const handlePlay = async () => {
    // Add performance mark
    if ('performance' in window) {
      performance.mark('vsl_play');
    }
    
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        trackVSLEvent('pause', {
          currentTime,
          progress
        });
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
        setHasStartedPlaying(true);
        setShowOverlay(false); // Hide overlay after first play for better UX
        setShowPlayHint(false); // Hide play hint after first interaction
        setShowCenterButton(false); // Hide center button after first click
        trackVSLEvent('play', {
          currentTime,
          progress
        });

        // Track first play (use 'play' event with metadata)
        if (!hasStartedPlaying) {
          trackEvent('vsl_play', {
            first_play: true,
            quizScore: quizResults?.total_score
          });
        }
      }
    } catch (error) {
      console.error('Video play error:', error);
      setHasError(true);
    }
  };
  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video pause when clicking sound button
    if (!videoRef.current) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRef.current.setMuted(newMutedState);
    // Use a custom event for volume toggle since it's not in standard funnel events
    console.log('Volume toggled:', {
      muted: newMutedState
    });
  };
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    setDuration(total);
    if (total > 0) {
      const progressPercent = current / total * 100;
      setProgress(progressPercent);

      // Track video engagement milestones
      if (progressPercent >= 25 && progressPercent < 30) {
        trackVSLEvent('progress', {
          milestone: '25_percent'
        });
      } else if (progressPercent >= 50 && progressPercent < 55) {
        trackVSLEvent('progress', {
          milestone: '50_percent'
        });
        setShowStickyCTA(true);
      } else if (progressPercent >= 75 && progressPercent < 80) {
        trackVSLEvent('progress', {
          milestone: '75_percent'
        });
        setShowStickyDesktop(true);
      }
    }
  };
  const handleCTAClick = (section: string) => {
    trackEvent('vsl_cta_click', {
      section,
      progress,
      quiz_score: quizResults?.totalScore || 0
    });
    onCTAClick(section);
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.seekTo(time);
    trackVSLEvent('progress', {
      action: 'seek',
      from: currentTime,
      to: time,
      progress
    });
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video pause when clicking fullscreen button
    if (!videoRef.current) return;
    
    // For iframe videos (YouTube/Vimeo), try to make the iframe fullscreen
    const videoElement = document.querySelector('.aspect-video') as HTMLElement;
    if (videoElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoElement.requestFullscreen().catch(err => {
          console.error('Fullscreen error:', err);
        });
      }
    }
  };
  return <div className="relative">
      {/* Hero Section */}
      <section className="pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-12 md:pb-16 bg-gradient-background">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Headline - Updated for conversion focus */}
          <div className="text-center mb-6 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-foreground">
              Deviens 4x plus profitable en éliminant 80 % de tes tâches répétitives
              <span className="block text-primary">(sans être techno)</span>
            </h1>
          </div>

          {/* VSL Video Container */}
          <div className="relative mb-6 animate-scale-in">
            <div className="relative w-full max-w-4xl mx-auto">
              <div 
                className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-elegant cursor-pointer"
                onClick={handlePlay}
                onMouseMove={handleMouseMove}
                onKeyDown={(e) => e.key === ' ' || e.key === 'Enter' ? handlePlay() : null}
                tabIndex={0}
                role="button"
                aria-label={isPlaying ? "Mettre en pause la vidéo" : "Lire la vidéo"}
              >
                <SmartVSLMedia 
                  ref={videoRef} 
                  src={currentVideoSrc} 
                  poster={posterSrc} 
                  className="w-full h-full object-cover" 
                  muted={isMuted} 
                  autoPlay={!isMobile} 
                  onError={handleVideoError} 
                  onTimeUpdate={handleTimeUpdate} 
                  onPlay={() => setIsPlaying(true)} 
                  onPause={() => setIsPlaying(false)} 
                />

                {/* Play Hint (before first play) */}
                {showPlayHint && !hasStartedPlaying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 transition-opacity duration-300">
                    <div className="text-center mb-6">
                      <p className="text-white text-xl sm:text-2xl font-semibold mb-3">
                        {isMobile ? "▶ Touche pour voir ta solution" : "▶ Clique pour voir ta solution"}
                      </p>
                      <p className="text-white/90 text-base font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        ⏱️ 4 min seulement
                      </p>
                    </div>
                    <button 
                      onClick={handlePlay} 
                      className="flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 bg-primary hover:bg-primary/90 rounded-full shadow-glow transition-all duration-300 hover:scale-110 animate-pulse" 
                      aria-label="Lire la vidéo"
                    >
                      <Play className="w-12 h-12 sm:w-14 sm:h-14 text-white ml-1" />
                    </button>
                  </div>
                )}

                {/* Center Play/Pause Button (after first play) */}
                {!showPlayHint && showCenterButton && showControls && (
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0 md:hover:opacity-100'}`}>
                    <button 
                      onClick={handlePlay} 
                      className="flex items-center justify-center w-18 h-18 sm:w-22 sm:h-22 bg-primary/95 hover:bg-primary rounded-full shadow-glow transition-all duration-200 hover:scale-110" 
                      aria-label={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
                    >
                      {isPlaying ? <Pause className="w-9 h-9 sm:w-11 sm:h-11 text-white" /> : <Play className="w-9 h-9 sm:w-11 sm:h-11 text-white ml-1" />}
                    </button>
                  </div>
                )}

                {/* Floating Controls (bottom-right) */}
                <div className="absolute bottom-20 right-4 sm:bottom-16 sm:right-6 flex flex-col gap-2">
                  <button 
                    onClick={handlePlay} 
                    className="flex items-center justify-center w-11 h-11 bg-black/80 hover:bg-black/95 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110" 
                    aria-label={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
                    title={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>

                {/* Bottom Controls */}
                {showControls && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between transition-opacity duration-300">
                    {/* Progress Indicator */}
                    <div className="flex-1 mr-4">
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="h-full bg-gradient-primary transition-all duration-300 ease-out" style={{
                        width: `${progress}%`
                      }} />
                      </div>
                      {progress > 0 && (
                        <div className="mt-1 text-white/90 text-xs font-medium">
                          {Math.round(progress)}% complété
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2">
                      <button 
                        onClick={handleMute} 
                        className="flex items-center justify-center w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all duration-200 hover:scale-105" 
                        aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
                        title={isMuted ? "Activer le son (recommandé)" : "Désactiver le son"}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      
                      <button 
                        onClick={handleFullscreen} 
                        className="flex items-center justify-center w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all duration-200 hover:scale-105" 
                        aria-label="Plein écran"
                        title="Plein écran"
                      >
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Captions Notice */}
                {isMuted && <div className="absolute top-4 left-4 right-4">
                    
                  </div>}
              </div>

              {/* Subtitle below video */}
              <div className="text-center mt-4 animate-fade-in">
                <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-4xl mx-auto">
                  Regarde cette courte vidéo et découvre comment <span className="text-primary font-semibold">+3200 dirigeants québécois</span> sauvent du temps chaque semaine.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">de nos clients<br/>sont satisfaits</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">15h</div>
                <div className="text-sm text-muted-foreground">économisées par<br/>semaine en moyenne</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">72h</div>
                <div className="text-sm text-muted-foreground">pour voir les<br/>premiers résultats</div>
              </div>
            </div>
            
            {quizResults?.totalScore >= 12 && (
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                🎯 Ton profil se qualifie pour un accompagnement prioritaire
              </Badge>
            )}
          </div>

          {/* Main CTA Section */}
          <div className="text-center mb-12 animate-scale-in">
            <Button 
              variant="cta-large" 
              className="text-lg sm:text-xl font-bold px-8 sm:px-16 py-6 shadow-glow hover:shadow-glow transition-all duration-300 hover:scale-105 w-full sm:w-auto mb-6 leading-tight" 
              onClick={() => handleCTAClick('hero_primary')} 
              aria-label="Réserver consultation gratuite"
              {...getCalDataAttributes()}
            >
              <span className="block sm:hidden">🚀 Réserver mon appel gratuit</span>
              <span className="hidden sm:block">🚀 Oui, je veux sauver +10h/semaine – Réserver mon appel gratuit</span>
            </Button>
            
            {/* Trust & Reassurance Points */}
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-base">Gratuit & sans engagement</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-base">Support 100 % local en français</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-base">Résultats visibles dès les premières semaines</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA - Mobile (appears at 50% progress) */}
      {isMobile && showStickyCTA && (
        <div className="fixed bottom-4 left-4 right-4 z-50 safe-area-inset-bottom">
          <Button 
            variant="cta" 
            className="w-full shadow-glow text-lg font-bold py-4 animate-pulse" 
            onClick={() => handleCTAClick('hero_sticky_mobile')} 
            aria-label="Réserver consultation - CTA mobile"
            {...getCalDataAttributes()}
          >
            🚀 Réserver maintenant (gratuit)
          </Button>
        </div>
      )}

      {/* Sticky CTA - Desktop (appears at 75% progress) */}
      {!isMobile && showStickyDesktop && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            variant="cta" 
            className="shadow-glow text-lg font-bold px-8 py-4 rounded-full animate-pulse" 
            onClick={() => handleCTAClick('hero_sticky_desktop')} 
            aria-label="Réserver consultation - CTA desktop"
            {...getCalDataAttributes()}
          >
            🚀 Réserver
          </Button>
        </div>
      )}
    </div>;
};