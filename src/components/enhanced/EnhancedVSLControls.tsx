import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { trackVSLEvent, getABVariant, trackABConversion } from "@/lib/analytics";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";

interface EnhancedVSLControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onPlayToggle: () => void;
  onMuteToggle: () => void;
  onSeek: (time: number) => void;
  quizScore?: number;
}

export const EnhancedVSLControls = ({
  videoRef,
  isPlaying,
  isMuted,
  progress,
  currentTime,
  duration,
  onPlayToggle,
  onMuteToggle,
  onSeek,
  quizScore = 0
}: EnhancedVSLControlsProps) => {
  const { isMobile, animationClass } = useMobileOptimized();
  const [ctaVariant] = useState(() => getABVariant("vsl_cta_timing", ["early", "mid", "late"]));
  const [showCTA, setShowCTA] = useState(false);

  // Determine when to show CTA based on A/B test and quiz score
  useEffect(() => {
    const progressPercent = progress;
    let showThreshold = 70; // Default late

    if (ctaVariant === "early") {
      showThreshold = 25;
    } else if (ctaVariant === "mid") {
      showThreshold = 50;
    }

    // High scoring quiz users see CTA earlier
    if (quizScore > 15) {
      showThreshold -= 10;
    }

    if (progressPercent >= showThreshold && !showCTA) {
      setShowCTA(true);
      trackVSLEvent('cta_show', { 
        variant: ctaVariant, 
        threshold: showThreshold, 
        quiz_score: quizScore 
      });
      trackABConversion("vsl_cta_timing", ctaVariant, "cta_show");
    }
  }, [progress, ctaVariant, quizScore, showCTA]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    onSeek(newTime);
    
    trackVSLEvent('progress', { 
      action: 'seek', 
      from_time: currentTime, 
      to_time: newTime 
    });
  };

  const handleReplay = () => {
    onSeek(0);
    if (!isPlaying) {
      onPlayToggle();
    }
    trackVSLEvent('progress', { action: 'replay' });
  };

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div 
        className="relative h-2 bg-black/20 rounded-full cursor-pointer"
        onClick={handleSeekBarClick}
      >
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        {/* Progress handle */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          style={{ left: `${progress}%`, marginLeft: '-8px' }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onPlayToggle}
            className="bg-black/50 border-white/20 text-white hover:bg-black/70 btn-touch"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onMuteToggle}
            className="bg-black/50 border-white/20 text-white hover:bg-black/70 btn-touch"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleReplay}
            className="bg-black/50 border-white/20 text-white hover:bg-black/70 btn-touch"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-white text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Dynamic CTA overlay */}
      {showCTA && (
        <Card className={`p-4 sm:p-6 bg-gradient-primary text-white border-0 ${animationClass}`}>
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">
              {quizScore > 15 
                ? "🎯 Solution parfaite identifiée !" 
                : "💡 Prêt à transformer votre entreprise ?"}
            </h3>
            <p className="text-sm opacity-90 mb-4">
              {quizScore > 15
                ? "Réservez votre consultation pour une solution sur mesure"
                : "Découvrez comment économiser 15+ heures par semaine"}
            </p>
            
            <Button
              variant="secondary"
              className="w-full sm:w-auto font-semibold btn-touch"
              onClick={() => {
                trackVSLEvent('cta_click', { 
                  variant: ctaVariant, 
                  quiz_score: quizScore,
                  timing: progress 
                });
                trackABConversion("vsl_cta_timing", ctaVariant, "cta_click");
                // Navigate to booking
                window.location.href = '/book-call';
              }}
            >
              📞 Réserver ma consultation gratuite
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};