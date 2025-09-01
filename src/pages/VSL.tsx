import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap } from "lucide-react";
import { trackEvent, getABVariant } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ABTest } from "@/components/ABTest";
import { MicroSurvey } from "@/components/MicroSurvey";
import { usePersonalizedMessaging } from "@/hooks/usePersonalizedMessaging";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";
import { VSLVideo } from "@/components/VSLVideo";
import { EnhancedVSLPlayer } from "@/components/enhanced/EnhancedVSLPlayer";
import { LazySection } from "@/components/LazySection";
import { lazy } from "react";
import { ProductVisuals } from "@/components/ProductVisuals";
import { ROICalculator } from "@/components/ROICalculator";
import { TrustBadges } from "@/components/TrustBadges";
import { BenefitsSection } from "@/components/vsl/BenefitsSection";
import { ProblemAmplificationSection } from "@/components/vsl/ProblemAmplificationSection";
import { SolutionSection } from "@/components/vsl/SolutionSection";
import { ObjectionsSection } from "@/components/vsl/ObjectionsSection";
import { SocialProofSection } from "@/components/vsl/SocialProofSection";
import { UrgencySection } from "@/components/vsl/UrgencySection";
import { VSLHero } from "@/components/vsl/VSLHero";
import { openCal, getCalDataAttributes } from "@/lib/cal";
const VSL = () => {
  const [quizResults, setQuizResults] = useState<any>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const navigate = useNavigate();
  const {
    getPersonalizedVSL
  } = usePersonalizedMessaging();
  const {
    isMobile
  } = useMobileOptimized();

  // Track page view
  usePageTracking();

  // A/B test for VSL layout - bias Enhanced on mobile for better UX
  const layoutVariant = getABVariant("vsl_layout", isMobile ? ["enhanced", "enhanced", "classic"] : ["classic", "enhanced"]);

  // A/B test for autoplay (mobile-sensitive)
  const autoplayVariant = getABVariant("vsl_autoplay", ["autoplay", "click_to_play"]);
  const shouldAutoplay = autoplayVariant === "autoplay" && !isMobile;

  // A/B test for primary CTA copy
  const ctaCopyVariant = getABVariant("vsl_primary_cta", ["standard", "urgent", "benefit"]);
  const getPrimaryCTAText = () => {
    switch (ctaCopyVariant) {
      case "urgent":
        return "📞 Réserver MAINTENANT (Places limitées)";
      case "benefit":
        return "📞 Économiser 15h dès le mois prochain";
      default:
        return "📞 Planifier mon appel gratuit";
    }
  };

  // Track VSL view with variant data
  useEffect(() => {
    trackEvent('vsl_view', {
      layout_variant: layoutVariant,
      autoplay_variant: autoplayVariant,
      quiz_score: quizResults?.totalScore || 0,
      mobile: isMobile
    });
  }, [layoutVariant, autoplayVariant, quizResults, isMobile]);
  useEffect(() => {
    const results = localStorage.getItem("quizResults");
    if (results) {
      setQuizResults(JSON.parse(results));
    }

    // Show survey after 60 seconds
    const timer = setTimeout(() => setShowSurvey(true), 60000);

    // Show sticky button on scroll
    const handleScroll = () => {
      if (window.scrollY > 800) {
        setShowStickyButton(true);
      } else {
        setShowStickyButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const handleCTAClick = (section = 'primary_cta') => {
    trackEvent('vsl_cta_click', {
      section,
      quiz_score: quizResults?.totalScore || 0,
      layout_variant: layoutVariant,
      cta_copy_variant: ctaCopyVariant
    });
    openCal('vsl_main');
  };
  const getPersonalizedMessage = () => {
    if (!quizResults) return "Fatigué de courir après le temps ?";
    const {
      totalScore
    } = quizResults;
    if (totalScore >= 16) {
      return "Fatigué de courir après le temps ? Découvrez comment on aide les entrepreneurs comme vous à récupérer 15h/semaine… sans changer vos habitudes.";
    } else if (totalScore >= 12) {
      return "Votre entreprise tourne déjà bien, mais imaginez avec 10h de plus par semaine ? Voici comment les PME québécoises y arrivent.";
    } else if (totalScore >= 8) {
      return "Vous gérez bien, mais on peut faire mieux. Découvrez comment automatiser intelligemment sans tout bouleverser.";
    } else {
      return "Vous êtes organisé, parfait ! Voici comment passer au niveau supérieur avec l'automatisation.";
    }
  };
  return <div className="min-h-[100dvh] bg-gradient-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-secondary/30 border-b safe-area-inset-top">
        
      </div>

      {/* Hero Section with VSL */}
      <VSLHero videoSrc="https://www.youtube.com/embed/e7Q68Z-0gao?si=vjJdB3q-rzWNhX_b" posterSrc="/images/vsl-poster.jpg" headline={getPersonalizedMessage()} ctaText={getPrimaryCTAText()} ctaVariant={ctaCopyVariant} onCTAClick={handleCTAClick} quizResults={quizResults} isMobile={isMobile} />

      {/* Product Visuals - Lazy loaded */}
      <LazySection fallback={<div className="h-96 bg-muted/20 animate-pulse" />}>
        <ProductVisuals />
      </LazySection>

      {/* ROI Calculator - Lazy loaded */}
      <LazySection fallback={<div className="h-96 bg-muted/20 animate-pulse" />}>
        <ROICalculator />
      </LazySection>

      {/* Problem Amplification Section - Lazy loaded */}
      <LazySection fallback={<div className="h-64 bg-muted/20 animate-pulse" />}>
        <ProblemAmplificationSection />
      </LazySection>

      {/* Solution Section - Lazy loaded */}
      <LazySection fallback={<div className="h-64 bg-muted/20 animate-pulse" />}>
        <SolutionSection />
      </LazySection>

      {/* Benefits Section - Lazy loaded */}
      <LazySection fallback={<div className="h-64 bg-muted/20 animate-pulse" />}>
        <BenefitsSection />
      </LazySection>

      {/* Objections Section - Lazy loaded */}
      <LazySection fallback={<div className="h-64 bg-muted/20 animate-pulse" />}>
        <ObjectionsSection />
      </LazySection>

      {/* Social Proof Section - Lazy loaded */}
      <LazySection fallback={<div className="h-64 bg-muted/20 animate-pulse" />}>
        <SocialProofSection />
      </LazySection>

      {/* Urgency Section - Lazy loaded */}
      <LazySection fallback={<div className="h-64 bg-muted/20 animate-pulse" />}>
        <UrgencySection onCTAClick={handleCTAClick} />
      </LazySection>


      {/* Sticky CTA Button - Mobile Safe Area */}
      {showStickyButton && <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 max-w-sm w-full safe-area-inset-bottom">
          <Button variant="cta-large" className="w-full shadow-2xl" onClick={() => handleCTAClick('sticky_cta')} aria-label="Réserver consultation - CTA flottant">
            📞 Réserver maintenant (gratuit)
          </Button>
        </div>}

      {/* Micro Survey */}
      {showSurvey && <MicroSurvey surveyId="vsl_decision" question="Qu'est-ce qui vous préoccupe le plus concernant une consultation ?" options={[{
      value: 'time',
      label: 'Je n\'ai pas le temps'
    }, {
      value: 'cost',
      label: 'Ça va coûter cher'
    }, {
      value: 'skeptical',
      label: 'Je suis sceptique'
    }, {
      value: 'ready',
      label: 'Je suis prêt à essayer'
    }]} onComplete={() => setShowSurvey(false)} onDismiss={() => setShowSurvey(false)} />}
    </div>;
};
export default VSL;