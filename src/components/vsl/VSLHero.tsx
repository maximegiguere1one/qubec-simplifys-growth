import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { trackEvent, getABVariant, trackVSLEvent } from '@/lib/analytics';
import { getCalDataAttributes } from '@/lib/cal';
import { SmartVSLMedia, SmartVSLMediaRef } from '@/components/video/SmartVSLMedia';
import { ProgressBar } from '@/components/video/ProgressBar';
interface VSLHeroProps {
  videoSrc: string;
  posterSrc: string;
  headline: string;
  ctaText: string;
  ctaVariant: string;
  onCTAClick: (section?: string) => void;
  quizResults?: any;
  isMobile: boolean;
}
export const VSLHero = ({
  videoSrc,
  posterSrc,
  headline,
  ctaText,
  ctaVariant,
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

  // Time formatting utility
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // A/B test for CTA copy
  const ctaCopyVariant = getABVariant("vsl_hero_cta", ["standard", "urgent", "benefit"]);
  const getHeroCTAText = () => {
    switch (ctaCopyVariant) {
      case "urgent":
        return "🚀 Réserver MA place (Urgent)";
      case "benefit":
        return "💰 Économiser 15h dès maintenant";
      default:
        return "📞 Planifier mon appel gratuit";
    }
  };

  // Event handlers
  const handlePlay = async () => {
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
  const handleMute = () => {
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
          milestone: '25_percent',
          cta_variant: ctaVariant
        });
      } else if (progressPercent >= 50 && progressPercent < 55) {
        trackVSLEvent('progress', {
          milestone: '50_percent',
          cta_variant: ctaVariant
        });
        setShowStickyCTA(true);
      } else if (progressPercent >= 75 && progressPercent < 80) {
        trackVSLEvent('progress', {
          milestone: '75_percent',
          cta_variant: ctaVariant
        });
        setShowStickyDesktop(true);
      }
    }
  };
  const handleCTAClick = (section: string) => {
    trackEvent('vsl_cta_click', {
      section,
      progress,
      cta_variant: ctaCopyVariant,
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
  return <div className="relative">
      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20 bg-gradient-background">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Headline */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-foreground">
              {headline}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              👉 Découvrez en 4 min comment économiser 10–25h par semaine
            </p>
          </div>

          {/* VSL Video Container */}
          <div className="relative mb-8 animate-scale-in">
            <div className="relative w-full max-w-4xl mx-auto">
              <div 
                className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl cursor-pointer"
                onClick={handlePlay}
                onKeyDown={(e) => e.key === ' ' || e.key === 'Enter' ? handlePlay() : null}
                tabIndex={0}
                role="button"
                aria-label={isPlaying ? "Mettre en pause la vidéo" : "Lire la vidéo"}
              >
                <SmartVSLMedia 
                  ref={videoRef} 
                  src={videoSrc} 
                  poster={posterSrc} 
                  className="w-full h-full object-cover" 
                  muted={isMuted} 
                  autoPlay={!isMobile} 
                  onError={() => setHasError(true)} 
                  onTimeUpdate={handleTimeUpdate} 
                  onPlay={() => setIsPlaying(true)} 
                  onPause={() => setIsPlaying(false)} 
                />

                {/* Play Hint (before first play) */}
                {showPlayHint && !hasStartedPlaying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 transition-opacity duration-300">
                    <div className="text-center mb-4">
                      <p className="text-white text-lg sm:text-xl font-medium mb-2">
                        {isMobile ? "Touchez pour lire" : "Cliquez pour lire"}
                      </p>
                      <p className="text-white/80 text-sm">
                        👆 Vidéo de 4 minutes
                      </p>
                    </div>
                    <button 
                      onClick={handlePlay} 
                      className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 animate-pulse" 
                      aria-label="Lire la vidéo"
                    >
                      <Play className="w-10 h-10 sm:w-12 sm:h-12 text-gray-800 ml-1" />
                    </button>
                  </div>
                )}

                {/* Center Play/Pause Button (after first play) */}
                {!showPlayHint && (
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${showOverlay ? 'opacity-100' : 'opacity-0 md:hover:opacity-100'}`}>
                    <button 
                      onClick={handlePlay} 
                      className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110" 
                      aria-label={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
                    >
                      {isPlaying ? <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-gray-800 ml-1" /> : <Play className="w-8 h-8 sm:w-10 sm:h-10 text-gray-800 ml-1" />}
                    </button>
                  </div>
                )}

                {/* Floating Play/Pause Button (bottom-right) */}
                <div className="absolute bottom-20 right-4 sm:bottom-16 sm:right-6">
                  <button 
                    onClick={handlePlay} 
                    className="flex items-center justify-center w-12 h-12 bg-black/70 hover:bg-black/90 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110" 
                    aria-label={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
                    title={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>

                {/* Mobile-Friendly Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  {/* Progress Bar */}
                  <div className="flex-1 mr-4">
                    <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{
                      width: `${progress}%`
                    }} />
                    </div>
                  </div>

                  {/* Unmute Button */}
                  <button onClick={handleMute} className="flex items-center justify-center w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors" aria-label={isMuted ? "Activer le son" : "Désactiver le son"}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Captions Notice */}
                {isMuted && <div className="absolute top-4 left-4 right-4">
                    
                  </div>}
              </div>

              {/* Timeline - Progress bar with time display */}
              <div className="mt-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="min-w-[3rem] text-right">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1">
                    <ProgressBar 
                      currentTime={currentTime}
                      duration={duration}
                      onSeek={handleSeek}
                      className="h-2 sm:h-3"
                    />
                  </div>
                  <span className="min-w-[3rem]">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {hasError}

          {/* Trust Indicators & Qualification */}
          <div className="text-center mb-8 animate-fade-in">
            {quizResults?.totalScore >= 12 && <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                🎯 Vous vous qualifiez pour notre service prioritaire
              </Badge>}
            
            {/* Trust logos placeholder */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <span className="text-sm text-muted-foreground">Vu dans:</span>
              <div className="flex gap-4 opacity-60">
                <span className="text-xs bg-muted px-2 py-1 rounded">Radio-Canada</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">La Presse</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">JDM</span>
              </div>
            </div>
          </div>

          {/* Primary CTA - Always Visible */}
          <div className="text-center mb-12 animate-scale-in">
            <Button variant="cta-large" className="text-lg sm:text-xl font-bold px-8 sm:px-12 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 w-full sm:w-auto" onClick={() => handleCTAClick('hero_primary')} aria-label={`Réserver consultation - ${ctaCopyVariant} variant`} {...getCalDataAttributes()}>
              {getHeroCTAText()}
            </Button>
            
            {/* Safety & Urgency Indicators */}
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                ✅ Consultation 100% gratuite • 🕒 30 minutes • 📞 Sans engagement
              </p>
              {quizResults?.totalScore >= 12 && <p className="text-xs text-primary font-medium">
                  ⚠️ Places limitées ce mois-ci pour les profils prioritaires
                </p>}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA - Mobile (appears at 50% progress) */}
      {isMobile && showStickyCTA && <div className="fixed bottom-4 left-4 right-4 z-50 safe-area-inset-bottom">
          <Button 
            variant="cta" 
            className="w-full shadow-2xl text-base font-bold py-3" 
            onClick={() => handleCTAClick('hero_sticky_mobile')} 
            aria-label="Réserver consultation - CTA mobile"
            {...getCalDataAttributes()}
          >
            📞 Réserver maintenant (gratuit)
          </Button>
        </div>}

      {/* Sticky CTA - Desktop (appears at 75% progress) */}
      {!isMobile && showStickyDesktop && <div className="fixed bottom-8 right-8 z-50">
          <Button 
            variant="cta" 
            className="shadow-2xl text-base font-bold px-6 py-3 rounded-full" 
            onClick={() => handleCTAClick('hero_sticky_desktop')} 
            aria-label="Réserver consultation - CTA desktop"
            {...getCalDataAttributes()}
          >
            📞 Réserver
          </Button>
        </div>}
    </div>;
};