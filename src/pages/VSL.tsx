import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ABTest } from "@/components/ABTest";
import { MicroSurvey } from "@/components/MicroSurvey";
import { VSLVideo } from "@/components/VSLVideo";
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

const VSL = () => {
  const [quizResults, setQuizResults] = useState<any>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const navigate = useNavigate();
  
  // Track page view
  usePageTracking();

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
    trackEvent('vsl_cta_click', { cta_location: 'primary' });
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
      <section className="pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <div className="container mx-auto container-mobile max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-responsive-xl font-bold mb-4 sm:mb-6 leading-tight">
              {getPersonalizedMessage()}
            </h1>
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

          {/* VSL Video */}
          <VSLVideo onCTAClick={handleCTAClick} />

          {/* Primary CTA with Calendar */}
          <div className="text-center mb-12">
            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Main CTA */}
              <div className="lg:order-2">
                <Button
                  variant="cta-large"
                  size="xl"
                  onClick={handleCTAClick}
                  className="w-full mb-4"
                >
                  Découvrir mon système sur mesure (30 min gratuit)
                </Button>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>100% gratuit et sans engagement</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Avec un expert local qui comprend votre réalité</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Créneaux limités cette semaine</span>
                  </div>
                </div>
              </div>
              
              {/* Integrated Calendar */}
              <div className="lg:order-1">
                <BookingCalendar />
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