import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Maximize2, Calendar } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface VSLVideoProps {
  onCTAClick: () => void;
}

export const VSLVideo = ({ onCTAClick }: VSLVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 min simulation
  const [showCTA, setShowCTA] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Show CTA at 60s and 90s
          if (newTime === 60 || newTime === 90) {
            setShowCTA(true);
            setTimeout(() => setShowCTA(false), 10000); // Hide after 10s
          }
          
          // Track video progress
          if (newTime === 75) trackEvent('vsl_play', { progress: '25%' });
          if (newTime === 150) trackEvent('vsl_play', { progress: '50%' });
          if (newTime === 225) trackEvent('vsl_play', { progress: '75%' });
          if (newTime === 300) {
            trackEvent('vsl_play', { progress: '100%' });
            setIsPlaying(false);
          }
          
          return newTime >= 300 ? 300 : newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentTime === 0) {
      trackEvent('vsl_play', { action: 'start' });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className="max-w-4xl mx-auto mb-16 relative">
      <Card className="overflow-hidden shadow-strong">
        {/* Video Player */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-700 aspect-video">
          {/* Video Content Area */}
          <div className="absolute inset-0 flex items-center justify-center text-white">
            {currentTime === 0 && !isPlaying ? (
              // Thumbnail state
              <div className="text-center px-8">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors" onClick={togglePlay}>
                    <Play className="w-12 h-12 ml-2" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Comment Martin a économisé 15h/semaine en 3 semaines
                  </h3>
                  <p className="text-lg opacity-90 max-w-2xl">
                    Imaginez... Il est 22h30, vous êtes encore au bureau à essayer de boucler vos factures sur Excel. Votre famille vous attend à la maison, mais impossible de partir...
                  </p>
                </div>
                <Button onClick={togglePlay} variant="cta-large" className="mb-2">
                  <Play className="w-6 h-6 mr-2" />
                  Regarder la transformation (4 min)
                </Button>
                <p className="text-sm opacity-75">
                  👆 Vous reconnaissez cette scène ? Découvrez la solution
                </p>
              </div>
            ) : (
              // Playing state - simulate video content
              <div className="w-full h-full flex items-center justify-center relative">
                {currentTime < 60 ? (
                  <div className="text-center px-8">
                    <h3 className="text-3xl font-bold mb-4">Le problème que vous vivez</h3>
                    <p className="text-xl opacity-90">
                      Trop de temps perdu sur la paperasse, erreurs coûteuses, stress fiscal...
                    </p>
                  </div>
                ) : currentTime < 180 ? (
                  <div className="text-center px-8">
                    <h3 className="text-3xl font-bold mb-4">La solution One Système</h3>
                    <p className="text-xl opacity-90">
                      Automatisation complète, conformité TPS/TVQ, support québécois...
                    </p>
                  </div>
                ) : (
                  <div className="text-center px-8">
                    <h3 className="text-3xl font-bold mb-4">Vos résultats garantis</h3>
                    <p className="text-xl opacity-90">
                      Plus de 200 PME québécoises économisent déjà 10-25h par semaine...
                    </p>
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
              </div>
            )}
          </div>

          {/* Video Controls */}
          {(isPlaying || currentTime > 0) && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1 bg-white/30 rounded-full h-1">
                      <div
                        className="bg-white h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Video Description */}
        <div className="p-6 bg-secondary/30">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">
                One Système - La transformation de votre PME québécoise
              </h4>
              <p className="text-muted-foreground text-sm">
                Découvrez comment plus de 200 entreprises du Québec ont automatisé leurs opérations et économisé 10-25 heures par semaine avec notre solution 100% locale.
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>4 min</p>
              <p>Québec, 2024</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};