import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Shield, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/constants/analytics";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";

import { cn } from "@/lib/utils";

interface GuaranteeBlockProps {
  location: string;
  variant?: string;
  destination?: string;
  onCTAClick?: () => void;
  className?: string;
  ctaText?: string;
  showCTA?: boolean;
}

export const GuaranteeBlock = ({ 
  location, 
  variant = "primary", 
  destination = "cal_booking",
  onCTAClick,
  className,
  ctaText = "Réserver mon appel",
  showCTA = true
}: GuaranteeBlockProps) => {
  const { isMobile, mobileButtonClass, animationClass } = useMobileOptimized();

  const handleCTAClick = () => {
    trackEvent(ANALYTICS_EVENTS.GUARANTEE.CTA_CLICK, {
      location,
      variant,
      destination
    });
    onCTAClick?.();
  };

  const handleGuaranteeView = () => {
    trackEvent(ANALYTICS_EVENTS.GUARANTEE.VIEW, {
      location,
      variant
    });
  };

  return (
    <div 
      className={cn("py-8 sm:py-12", className)}
      onLoad={handleGuaranteeView}
    >
      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 shadow-xl">
        <div className="p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Badge className="mb-4 bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
              🔐 GARANTIE ULTRA-MESURABLE
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-foreground leading-tight">
              Je te garantis que tu vas gagner au moins 10 heures par mois, sinon je te rembourse + je te vire 1 000 $
            </h2>
            <p className="text-lg sm:text-xl text-primary font-semibold">
              🔐 Tu gagnes du temps, ou tu gagnes de l'argent.
            </p>
          </div>

          {/* Main Promise */}
          <div className="bg-background/80 rounded-lg p-6 mb-6 border border-border/50">
            <p className="text-base sm:text-lg text-foreground mb-4 leading-relaxed">
              Je te garantis que tu ne te sentiras plus jamais mêlé, désorganisé ou dépassé.
              <br />
              <strong className="text-primary">Et en plus, tu vas gagner au moins 10 heures par mois, dès le premier mois.</strong>
            </p>
          </div>

          {/* Guarantee Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <div className="flex items-start mb-2">
                <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-destructive font-bold text-lg">❌</span>
                </div>
                <div>
                  <h3 className="font-bold text-destructive mb-2">Sinon ?</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Je te rembourse chaque dollar</li>
                    <li><strong>Et je te vire 1 000 $ cash, pour t'avoir fait perdre ton temps</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-success/10 border border-success/30 rounded-lg p-4">
              <div className="flex items-start mb-2">
                <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center mr-3 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <h3 className="font-bold text-success mb-2">Aucun risque. Que du concret.</h3>
                  <p className="text-sm text-muted-foreground">
                    Paiement basé uniquement sur les économies réelles mesurées
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-border/30">
              <TrendingUp className="w-6 h-6 text-primary" />
              <div>
                <div className="text-sm font-medium">📉 Paiement basé uniquement sur les économies réelles mesurées</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-border/30">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <div className="text-sm font-medium">📈 Suivi inclus dans votre tableau de bord</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-border/30">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <div className="text-sm font-medium">🤝 Accompagnement 100 % humain, local, garanti</div>
              </div>
            </div>
          </div>

          {/* Final Message */}
          <div className="text-center bg-primary/10 border border-primary/30 rounded-lg p-6 mb-6">
            <p className="text-lg font-bold text-primary mb-2">
              👉 Tu gagnes du temps ou tu repars payé.
            </p>
            <p className="text-base text-muted-foreground">
              Clique ci-dessous pour voir ce que ça peut changer dans ta business.
            </p>
          </div>

          {/* CTA Button */}
          {showCTA && (
            <div className="text-center">
              <Button
                variant="cta-large"
                onClick={handleCTAClick}
                className={cn(
                  "px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300",
                  mobileButtonClass,
                  animationClass
                )}
              >
                {ctaText}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};