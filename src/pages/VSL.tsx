import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, CheckCircle2, Clock, TrendingUp, Shield, Calendar, MapPin, Zap } from "lucide-react";
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

  const benefits = [
    {
      icon: Clock,
      title: "Économies de temps immédiates",
      description: "Automatisation complète de vos processus répétitifs"
    },
    {
      icon: TrendingUp,
      title: "ROI mesurable",
      description: "Retour sur investissement visible dès le premier mois"
    },
    {
      icon: CheckCircle2,
      title: "Support québécois",
      description: "Équipe locale qui comprend vos défis spécifiques"
    }
  ];

  const testimonials = [
    {
      name: "Sophie Tremblay",
      company: "Boutique Mode Québec",
      text: "En 3 semaines, nous avons éliminé 80% de notre paperasserie. Notre équipe peut enfin se concentrer sur ce qui compte vraiment.",
      result: "20 heures économisées/semaine"
    },
    {
      name: "Michel Bouchard",
      company: "Services Comptables MB",
      text: "One Système a révolutionné notre façon de travailler. Nos clients sont impressionnés par notre nouvelle efficacité.",
      result: "300% d'augmentation de productivité"
    }
  ];

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
      <section className="section-mobile bg-destructive/10">
        <div className="container mx-auto container-mobile max-w-4xl text-center">
          <h2 className="heading-responsive font-bold mb-8 text-destructive">
            Si rien ne change, voici ce qui vous attend...
          </h2>
          <div className="space-y-6 text-lg">
            <p className="leading-relaxed">
              • Vous continuerez à <strong>travailler tard le soir</strong> pendant que votre famille vous attend
            </p>
            <p className="leading-relaxed">
              • Vous <strong>perdrez des ventes</strong> à cause d'erreurs administratives évitables  
            </p>
            <p className="leading-relaxed">
              • Vos <strong>concurrents prendront de l'avance</strong> pendant que vous restez coincé dans la paperasse
            </p>
            <p className="leading-relaxed">
              • Le <strong>risque de burn-out</strong> augmentera chaque mois qui passe
            </p>
            <p className="text-responsive-base font-bold mt-8 text-destructive">
              🚨 Il est URGENT d'agir maintenant !
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="section-mobile bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto container-mobile max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="heading-responsive font-bold mb-8">
              Mais imaginez maintenant que...
            </h2>
            <p className="text-responsive-base leading-relaxed mb-8">
              🌅 <strong>Vous arrivez au bureau le matin</strong>, votre café à la main, et en quelques clics vous avez une vue complète sur vos ventes, votre inventaire et vos finances
            </p>
            <p className="text-responsive-base leading-relaxed mb-8">
              ⚡ <strong>Vos factures se génèrent automatiquement</strong> avec les bonnes taxes (TPS/TVQ), vos clients reçoivent leurs documents conformes sans que vous leviez le petit doigt
            </p>
            <p className="text-responsive-base leading-relaxed mb-8">
              🏠 <strong>À 17h, vous fermez votre ordinateur</strong> sereinement car vous savez que tout est à jour, synchronisé et conforme
            </p>
            <p className="text-responsive-base leading-relaxed mb-8">
              🎯 <strong>Vous dormez tranquille</strong> car vous savez qu'en cas d'audit fiscal, tout est parfaitement en ordre
            </p>
            <div className="bg-success/20 border border-success/50 rounded-lg p-6 mt-12">
              <p className="text-2xl font-bold text-success">
                ✅ C'est exactement ça, la liberté avec votre système sur mesure !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-mobile bg-secondary/30">
        <div className="container mx-auto container-mobile">
          <h2 className="heading-responsive font-bold text-center mb-4">
            Concrètement, voici ce que nous créons pour vous
          </h2>
          <p className="text-responsive-base text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
            Chaque système est conçu 100% sur mesure pour VOS processus spécifiques – par une équipe québécoise qui comprend votre réalité
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Conçu exactement pour VOUS</h3>
              <p className="text-muted-foreground">Chaque fonction, chaque écran, chaque bouton pensé selon VOS processus uniques</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Interface conçue pour VOTRE équipe</h3>
              <p className="text-muted-foreground">Design et navigation adaptés à votre façon de travailler – pas de compromis</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Développement 100% québécois</h3>
              <p className="text-muted-foreground">Équipe locale qui comprend vos défis spécifiques et parle votre langue</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Évolutif avec votre entreprise</h3>
              <p className="text-muted-foreground">Votre système grandit avec vous – nouvelles fonctions ajoutées selon vos besoins</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <Calendar className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Vous gardez le contrôle total</h3>
              <p className="text-muted-foreground">C'est VOTRE système, hébergé comme vous voulez, avec vos données sécurisées</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <MapPin className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Livraison rapide et efficace</h3>
              <p className="text-muted-foreground">De l'idée au système fonctionnel : généralement 4 à 12 semaines selon la complexité</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Objections Section */}
      <section className="section-mobile bg-background">
        <div className="container mx-auto container-mobile max-w-4xl">
          <h2 className="heading-responsive font-bold text-center mb-16">
            "Oui mais... j'ai des inquiétudes"
          </h2>
          <div className="space-y-8">
            <Card className="p-8 shadow-card">
              <h3 className="text-2xl font-bold mb-4 text-warning">
                💭 "Je ne suis pas doué avec les ordinateurs..."
              </h3>
              <p className="text-lg leading-relaxed">
                <strong>Rassurez-vous !</strong> Chaque système que nous créons est conçu pour être intuitif. 95% de nos clients apprennent à l'utiliser en moins d'une journée. Et si vous avez la moindre question, notre équipe québécoise est là pour vous guider pas à pas.
              </p>
            </Card>
            
            <Card className="p-8 shadow-card">
              <h3 className="text-2xl font-bold mb-4 text-warning">
                💰 "Ça va sûrement me coûter cher..."
              </h3>
              <p className="text-lg leading-relaxed">
                <strong>Au contraire !</strong> Un système sur mesure coûte moins cher que vous pensez. Si on vous dit que chaque mois vous économiserez au moins 500$ en temps et erreurs évitées, et que l'investissement se paie en 6 mois maximum... c'est rentable, non ?
              </p>
            </Card>
            
            <Card className="p-8 shadow-card">
              <h3 className="text-2xl font-bold mb-4 text-warning">
                🔒 "Je vais perdre le contrôle sur mes données..."
              </h3>
              <p className="text-lg leading-relaxed">
                <strong>Tout le contraire !</strong> Avec votre système sur mesure, vous GARDEZ le contrôle total. Toutes vos infos vitales au bout des doigts, hébergé où vous voulez, avec vos règles de sécurité. Plus jamais de "le logiciel ne fait pas ce que je veux".
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section-mobile bg-secondary/20">
        <div className="container mx-auto container-mobile">
          <h2 className="heading-responsive font-bold text-center mb-4">
            Plus de 200 PME québécoises nous font déjà confiance
          </h2>
          <p className="text-center text-muted-foreground mb-16">Voici leurs résultats concrets après seulement quelques semaines</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 shadow-card border-l-4 border-success">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="w-5 h-5 bg-warning rounded-full"></div>
                  ))}
                </div>
                <p className="text-lg italic mb-4">"Martin, propriétaire d'une boutique à Québec, économisait déjà 10 heures par semaine après 15 jours avec One Système. Ses ventes ont augmenté de 15% car il peut enfin se concentrer sur ses clients plutôt que sur sa paperasse."</p>
              </div>
              <div className="border-t pt-6">
                <p className="font-bold text-lg">Martin Dubois</p>
                <p className="text-muted-foreground">Boutique Sport Plus, Québec</p>
                <div className="mt-3 inline-block bg-success/20 text-success px-4 py-2 rounded-full font-semibold">
                  10h économisées/semaine + 15% de ventes
                </div>
              </div>
            </Card>
            
            <Card className="p-8 shadow-card border-l-4 border-primary">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="w-5 h-5 bg-warning rounded-full"></div>
                  ))}
                </div>
                <p className="text-lg italic mb-4">"Julie, comptable à Sherbrooke, nous a dit : 'Je dormais mal avant chaque période de déclarations. Maintenant, avec One Système, tout est automatique et conforme. Je peux enfin profiter de mes weekends !'"</p>
              </div>
              <div className="border-t pt-6">
                <p className="font-bold text-lg">Julie Lavoie</p>
                <p className="text-muted-foreground">Services Comptables JL, Sherbrooke</p>
                <div className="mt-3 inline-block bg-primary/20 text-primary px-4 py-2 rounded-full font-semibold">
                  Stress fiscal éliminé + weekends libres
                </div>
              </div>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-gradient-primary/20 border border-primary/30 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-lg font-semibold mb-2">Note de satisfaction moyenne : 9.4/10</p>
              <p className="text-muted-foreground">Basée sur 200+ avis clients vérifiés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Chaque jour passé sans agir vous coûte du temps et de l'argent
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed">
            Pendant que vous hésitez, vos concurrents optimisent déjà leurs opérations. Pendant que vous perdez 15 heures par semaine sur de la paperasse, eux se concentrent sur la croissance. <strong>Il est temps de reprendre les rênes.</strong>
          </p>
          <div className="bg-white/10 border border-white/20 rounded-lg p-6 max-w-2xl mx-auto mb-8">
            <p className="text-lg font-semibold mb-2">🎯 Consultation 100% gratuite et sans engagement</p>
            <p className="text-base opacity-90">30 minutes qui peuvent changer la trajectoire de votre entreprise</p>
          </div>
          <Button
            variant="cta-large"
            size="xl"
            onClick={() => {
              trackEvent('vsl_cta_click', { cta_location: 'final' });
              navigate("/book-call");
            }}
            className="transform hover:scale-105 transition-all duration-300 pulse-animation"
          >
            Je réserve ma consultation MAINTENANT
          </Button>
          <p className="text-sm opacity-75 mt-6">
            ⚠️ Places limitées cette semaine - Ne laissez pas passer cette opportunité
          </p>
        </div>
      </section>

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