import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap } from "lucide-react";
import { trackEvent, getABVariant } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ABTest } from "@/components/ABTest";
import { MicroSurvey } from "@/components/MicroSurvey";
import { usePersonalizedMessaging } from "@/hooks/usePersonalizedMessaging";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";
import { CTAButton } from "@/components/CTAButton";
import { VSLVideo } from "@/components/VSLVideo";
import { EnhancedVSLPlayer } from "@/components/enhanced/EnhancedVSLPlayer";
import { ProductVisuals } from "@/components/ProductVisuals";
import { ROICalculator } from "@/components/ROICalculator";
import { BookingCalendar } from "@/components/BookingCalendar";
import { TrustBadges } from "@/components/TrustBadges";
import { FAQ } from "@/components/FAQ";
import { ProcessSteps } from "@/components/ProcessSteps";
import { BenefitsSection } from "@/components/vsl/BenefitsSection";
import { ProblemAmplificationSection } from "@/components/vsl/ProblemAmplificationSection";
import { SolutionSection } from "@/components/vsl/SolutionSection";
import { ObjectionsSection } from "@/components/vsl/ObjectionsSection";
import { SocialProofSection } from "@/components/vsl/SocialProofSection";
import { UrgencySection } from "@/components/vsl/UrgencySection";
import { EmailSequences } from "@/components/EmailSequences";

const VSL = () => {
  const [quizResults, setQuizResults] = useState<any>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const navigate = useNavigate();
  const { getPersonalizedVSL } = usePersonalizedMessaging();
  const { isMobile } = useMobileOptimized();
  
  // Track page view
  usePageTracking();
  
  // A/B test for VSL layout
  const layoutVariant = getABVariant("vsl_layout", ["classic", "enhanced"]);
  
  // A/B test for autoplay (mobile-sensitive)
  const autoplayVariant = getABVariant("vsl_autoplay", ["autoplay", "click_to_play"]);
  const shouldAutoplay = autoplayVariant === "autoplay" && !isMobile;

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

  const handleCTAClick = () => {
    trackEvent('vsl_cta_click', {
      section: 'primary_cta',
      quiz_score: quizResults?.totalScore || 0,
      layout_variant: layoutVariant,
    });
    navigate("/book-call");
  };

  const getPersonalizedMessage = () => {
    if (!quizResults) return "Arrêtez de perdre du temps avec la paperasse";
    
    const { totalScore } = quizResults;
    
    if (totalScore >= 16) {
      return "Voici comment récupérer 15+ heures par semaine (sans rien apprendre de compliqué)";
    } else if (totalScore >= 12) {
      return "Simplifiez votre gestion sans apprendre de nouvelle technologie";
    } else if (totalScore >= 8) {
      return "Automatisez votre business en gardant vos habitudes";
    } else {
      return "Gagnez du temps sans vous casser la tête";
    }
  };


  return (
    <div className="min-h-[100dvh] bg-gradient-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-secondary/30 border-b safe-area-inset-top">
        <div className="container mx-auto container-mobile py-2">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span className="mr-2">Étape 2/3 :</span>
            <span className="font-medium">Regardez la vidéo (4 min) puis réservez votre diagnostic</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-14 sm:pt-20 md:pt-24 pb-12 sm:pb-16 md:pb-20">
        <div className="container mx-auto container-mobile max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-responsive-xl font-bold mb-6 sm:mb-8 leading-tight">
              {getPersonalizedMessage()}
            </h1>
            
            {/* CTA above video */}
            <div className="mb-8">
              <CTAButton
                location="vsl_top"
                variant="primary_cta"
                destination="/book-call"
                size="cta"
                className="px-8 py-3 font-semibold"
                onClick={handleCTAClick}
              >
                📞 Planifier mon appel gratuit
              </CTAButton>
              <p className="text-sm text-muted-foreground mt-3">
                ⚠️ Calendrier limité – 4 créneaux dispo cette semaine
              </p>
            </div>
          </div>

          {/* VSL Video */}
          <div id="vsl-video" className="scroll-mt-20 mb-8">
            {layoutVariant === "enhanced" ? (
              <EnhancedVSLPlayer 
                onCTAClick={handleCTAClick} 
                quizScore={quizResults?.totalScore || 0}
              />
            ) : (
              <VSLVideo onCTAClick={handleCTAClick} />
            )}
          </div>

          <div className="text-center">
            {/* Text summary below video */}
            <div className="bg-muted/30 border border-border/50 rounded-lg p-6 max-w-4xl mx-auto mb-8">
              <h3 className="text-xl font-bold mb-4">👉 Ce que vous allez découvrir dans cette vidéo :</h3>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Pour qui est cette solution</h4>
                  <p className="text-sm text-muted-foreground">PME québécoises qui perdent 10+ heures/semaine dans la gestion</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Pourquoi c'est différent</h4>
                  <p className="text-sm text-muted-foreground">100% sur mesure, créé spécifiquement pour VOS processus</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Les bénéfices concrets</h4>
                  <p className="text-sm text-muted-foreground">
                    ✅ Économisez jusqu'à 15h/semaine<br/>
                    ✅ Automatisez sans complexité<br/>
                    ✅ 100% québécois et humain<br/>
                    ✅ Prêt en 30 jours
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-responsive-base text-muted-foreground mb-6 sm:mb-8 max-w-4xl mx-auto">
              Vous en avez assez de perdre vos soirées dans la paperasse? De chercher des documents partout? De refaire les mêmes calculs encore et encore? Je vous montre comment tout automatiser, <span className="font-semibold text-primary">sans que vous ayez à apprendre quoi que ce soit de compliqué.</span>
            </p>
            
            {/* Personalized Alert */}
            {quizResults && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 max-w-2xl mx-auto mb-8">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-warning" />
                  <p className="font-medium">
                    <strong>Votre priorité n°1 :</strong> {quizResults.mainPriority || "Automatisation des processus"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Voici comment nous créons LE système parfait pour résoudre ce problème ↓
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <TrustBadges />
          </div>

          {/* Enhanced Primary CTA with generous whitespace - Single clear action */}
          <div className="text-center py-12 sm:py-16 px-6 sm:px-8 mb-16">
            <div className="max-w-2xl mx-auto space-y-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                🎯 Prêt à récupérer 15+ heures par semaine ?
              </h3>
              
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Réservez votre consultation gratuite maintenant et découvrez exactement comment automatiser votre entreprise.
              </p>
              
              {/* Primary CTA with maximum focus */}
              <div className="space-y-6">
                <CTAButton
                  location="vsl_primary"
                  variant="main_cta"
                  destination="/book-call"
                  size="cta-large"
                  className="w-full sm:w-auto h-16 sm:h-18 text-lg sm:text-xl font-bold px-12 sm:px-16 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 pulse-animation"
                  onClick={handleCTAClick}
                >
                  📞 Obtenir ma consultation gratuite
                </CTAButton>
                
                {/* Trust indicators directly below CTA */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    100% gratuit
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Expert local québécois
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Aucun engagement
                  </span>
                </div>
              </div>
              
              {/* Safety net CTA - doesn't compete with main action */}
              <div className="pt-8 border-t border-border/30">
                <p className="text-sm text-muted-foreground mb-4">
                  Pas prêt pour un appel ? Téléchargez d'abord notre guide :
                </p>
                <CTAButton
                  location="vsl_secondary"
                  variant="brochure_download"
                  destination="#"
                  size="outline"
                  className="text-primary border-primary/30 hover:bg-primary/10 h-12 px-6"
                  onClick={() => {
                    trackEvent('vsl_cta_click', { cta_location: 'secondary_download', variant: 'brochure' });
                  }}
                >
                  📄 Guide gratuit : 10 processus à automatiser en premier
                </CTAButton>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>100% gratuit et sans engagement</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Expert local qui comprend votre réalité</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>🔒 Vos données restent confidentielles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Visuals */}
      <ProductVisuals />

      {/* ROI Calculator */}
      <section className="section-mobile bg-background">
        <div className="container mx-auto container-mobile">
          <div className="text-center mb-12">
            <h2 className="heading-responsive font-bold mb-4">
              Calculez la rentabilité de votre système sur mesure
            </h2>
            <p className="text-responsive-base text-muted-foreground">
              Découvrez en 30 secondes pourquoi investir dans du sur mesure est toujours rentable
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* Problem Amplification Section */}
      <ProblemAmplificationSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Objections Section */}
      <ObjectionsSection />

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* Urgency Section */}
      <UrgencySection onCTAClick={handleCTAClick} />

      {/* Email Sequences Section */}
      <section className="section-mobile bg-accent/30">
        <div className="container mx-auto container-mobile">
          <EmailSequences 
            leadSegment={quizResults?.totalScore >= 16 ? 'qualified' : 
                        quizResults?.totalScore >= 12 ? 'hot' : 
                        quizResults?.totalScore >= 8 ? 'warm' : 'cold'}
            leadName={quizResults?.contactInfo?.name?.split(' ')[0] || 'Marie'}
          />
        </div>
      </section>

      {/* Sticky CTA Button */}
      {showStickyButton && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 max-w-sm w-full">
          <CTAButton
            location="vsl_sticky"
            variant="sticky_cta"
            destination="/book-call"
            size="cta-large"
            className="w-full shadow-2xl animate-pulse-gentle"
            onClick={handleCTAClick}
          >
            📞 Réserver maintenant (gratuit)
          </CTAButton>
        </div>
      )}

      {/* Micro Survey */}
      {showSurvey && (
        <MicroSurvey
          surveyId="vsl_decision"
          question="Qu'est-ce qui vous préoccupe le plus concernant une consultation ?"
          options={[
            { value: 'time', label: 'Je n\'ai pas le temps' },
            { value: 'cost', label: 'Ça va coûter cher' },
            { value: 'skeptical', label: 'Je suis sceptique' },
            { value: 'ready', label: 'Je suis prêt à essayer' },
          ]}
          onComplete={() => setShowSurvey(false)}
          onDismiss={() => setShowSurvey(false)}
        />
      )}
    </div>
  );
};

export default VSL;