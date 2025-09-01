import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { trackEvent, getABVariant, trackVSLEvent } from '@/lib/analytics';
import { getCalDataAttributes } from '@/lib/cal';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showStickyDesktop, setShowStickyDesktop] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

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

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      const progressPercent = (currentTime / duration) * 100;
      setProgress(progressPercent);

      // Track video engagement milestones
      if (progressPercent >= 25 && progressPercent < 30) {
        trackVSLEvent('progress', { milestone: '25_percent', cta_variant: ctaVariant });
      } else if (progressPercent >= 50 && progressPercent < 55) {
        trackVSLEvent('progress', { milestone: '50_percent', cta_variant: ctaVariant });
        setShowStickyCTA(true); // Show sticky CTA at 50%
      } else if (progressPercent >= 75 && progressPercent < 80) {
        trackVSLEvent('progress', { milestone: '75_percent', cta_variant: ctaVariant });
        setShowStickyDesktop(true); // Show desktop sticky at 75%
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (!hasStartedPlaying) {
        setHasStartedPlaying(true);
        trackVSLEvent('play', { first_play: true, cta_variant: ctaVariant });
      }
      trackVSLEvent('play', { progress, cta_variant: ctaVariant });
    };

    const handlePause = () => {
      setIsPlaying(false);
      trackVSLEvent('pause', { progress, cta_variant: ctaVariant });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      trackVSLEvent('complete', { cta_variant: ctaVariant });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [progress, hasStartedPlaying, ctaVariant]);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      trackVSLEvent('progress', { action: 'unmute', progress, cta_variant: ctaVariant });
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

  return (
    <div className="relative">
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
            {/* Desktop: 75% width, Mobile: 100% width */}
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={posterSrc}
                  preload="metadata"
                  playsInline
                  webkit-playsinline="true"
                  muted={isMuted}
                  onLoadedMetadata={() => {
                    // Auto-play muted on desktop only
                    if (!isMobile && videoRef.current) {
                      videoRef.current.play().catch(() => {
                        // Autoplay failed - user interaction required
                      });
                    }
                  }}
                >
                  <source src={videoSrc} type="video/mp4" />
                  <track
                    kind="captions"
                    src="/captions/vsl-fr.vtt"
                    srcLang="fr"
                    label="Français"
                    default
                  />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  {/* Central Play/Pause Button */}
                  <button
                    onClick={handlePlay}
                    className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    aria-label={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-gray-800 ml-1" />
                    ) : (
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-gray-800 ml-1" />
                    )}
                  </button>
                </div>

                {/* Mobile-Friendly Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  {/* Progress Bar */}
                  <div className="flex-1 mr-4">
                    <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Unmute Button */}
                  <button
                    onClick={handleMute}
                    className="flex items-center justify-center w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                    aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Captions Notice */}
                {isMuted && (
                  <div className="absolute top-4 left-4 right-4">
                    <Badge variant="secondary" className="bg-black/60 text-white border-0">
                      🔇 Cliquez pour activer le son ou lisez les sous-titres
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trust Indicators & Qualification */}
          <div className="text-center mb-8 animate-fade-in">
            {quizResults?.totalScore >= 12 && (
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                🎯 Vous vous qualifiez pour notre service prioritaire
              </Badge>
            )}
            
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
            <Button
              variant="cta-large"
              className="text-lg sm:text-xl font-bold px-8 sm:px-12 py-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              onClick={() => handleCTAClick('hero_primary')}
              aria-label={`Réserver consultation - ${ctaCopyVariant} variant`}
              {...getCalDataAttributes()}
            >
              {getHeroCTAText()}
            </Button>
            
            {/* Safety & Urgency Indicators */}
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                ✅ Consultation 100% gratuite • 🕒 30 minutes • 📞 Sans engagement
              </p>
              {quizResults?.totalScore >= 12 && (
                <p className="text-xs text-primary font-medium">
                  ⚠️ Places limitées ce mois-ci pour les profils prioritaires
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA - Mobile (appears at 50% progress) */}
      {isMobile && showStickyCTA && (
        <div className="fixed bottom-4 left-4 right-4 z-50 safe-area-inset-bottom">
          <Button
            variant="cta"
            className="w-full shadow-2xl text-base font-bold py-3"
            onClick={() => handleCTAClick('hero_sticky_mobile')}
            aria-label="Réserver consultation - CTA mobile"
          >
            📞 Réserver maintenant (gratuit)
          </Button>
        </div>
      )}

      {/* Sticky CTA - Desktop (appears at 75% progress) */}
      {!isMobile && showStickyDesktop && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            variant="cta"
            className="shadow-2xl text-base font-bold px-6 py-3 rounded-full"
            onClick={() => handleCTAClick('hero_sticky_desktop')}
            aria-label="Réserver consultation - CTA desktop"
          >
            📞 Réserver
          </Button>
        </div>
      )}
    </div>
  );
};