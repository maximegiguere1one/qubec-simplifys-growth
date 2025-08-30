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
    if (!quizResults) return "Arrêtez de perdre 10-15h par semaine sur la paperasse";
    
    const score = quizResults.totalScore;
    if (score >= 14) {
      return "Votre priorité : récupérer ces 25h perdues chaque semaine";
    } else if (score >= 10) {
      return "Votre priorité : récupérer ces 15h perdues chaque semaine";
    } else if (score >= 6) {
      return "Votre priorité : récupérer ces 10h perdues chaque semaine";
    } else {
      return "Arrêtez de perdre 5-10h par semaine sur la paperasse";
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
    <div className="min-h-screen bg-gradient-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-secondary/30 border-b">
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span className="mr-2">Étape 2/3 :</span>
            <span className="font-medium">Regardez la vidéo (4 min) puis réservez votre diagnostic</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {getPersonalizedMessage()}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              One Système automatise vos opérations (TPS/TVQ incluses) et réunit vos outils en une seule plateforme simple – <span className="font-semibold text-primary">100% québécoise</span>
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
                  Voici comment One Système résout exactement ce problème ↓
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
                  Réserver mon diagnostic gratuit (30 min)
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Calculez votre retour sur investissement
            </h2>
            <p className="text-xl text-muted-foreground">
              Découvrez en 30 secondes combien One Système vous fera économiser
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* Problem Amplification Section */}
      <section className="py-20 bg-destructive/10">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-8 text-destructive">
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
            <p className="text-xl font-bold mt-8 text-destructive">
              🚨 Il est URGENT d'agir maintenant !
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-8">
              Mais imaginez maintenant que...
            </h2>
            <p className="text-xl leading-relaxed mb-8">
              🌅 <strong>Vous arrivez au bureau le matin</strong>, votre café à la main, et en quelques clics vous avez une vue complète sur vos ventes, votre inventaire et vos finances
            </p>
            <p className="text-xl leading-relaxed mb-8">
              ⚡ <strong>Vos factures se génèrent automatiquement</strong> avec les bonnes taxes (TPS/TVQ), vos clients reçoivent leurs documents conformes sans que vous leviez le petit doigt
            </p>
            <p className="text-xl leading-relaxed mb-8">
              🏠 <strong>À 17h, vous fermez votre ordinateur</strong> sereinement car vous savez que tout est à jour, synchronisé et conforme
            </p>
            <p className="text-xl leading-relaxed mb-8">
              🎯 <strong>Vous dormez tranquille</strong> car vous savez qu'en cas d'audit fiscal, tout est parfaitement en ordre
            </p>
            <div className="bg-success/20 border border-success/50 rounded-lg p-6 mt-12">
              <p className="text-2xl font-bold text-success">
                ✅ C'est exactement ça, la liberté avec One Système !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">
            Concrètement, voici ce que One Système fait pour vous
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
            Une solution 100% québécoise qui remplace jusqu'à 5 logiciels différents par une seule plateforme intuitive
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <Clock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">15 heures économisées dès la première semaine</h3>
              <p className="text-muted-foreground">Toutes vos tâches répétitives automatisées : facturation, inventaire, relances clients...</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <CheckCircle2 className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Plus simple qu'Excel, plus puissant que tout</h3>
              <p className="text-muted-foreground">Interface pensée pour les non-experts : tout se fait en quelques clics depuis votre ordinateur ou téléphone</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Support humain 100% québécois</h3>
              <p className="text-muted-foreground">Une vraie équipe locale qui vous accompagne personnellement, formation incluse</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Conformité fiscale automatique</h3>
              <p className="text-muted-foreground">TPS/TVQ calculées automatiquement, factures conformes aux normes québécoises. Fini le stress des audits !</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <Calendar className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">ROI garanti en moins de 3 mois</h3>
              <p className="text-muted-foreground">Le temps et l'argent économisés payent l'abonnement. Après, c'est du profit pur !</p>
            </Card>
            
            <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
              <MapPin className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Solution 100% québécoise</h3>
              <p className="text-muted-foreground">Conçue par et pour des entreprises d'ici, qui comprennent votre réalité</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Objections Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-16">
            "Oui mais... j'ai des inquiétudes"
          </h2>
          <div className="space-y-8">
            <Card className="p-8 shadow-card">
              <h3 className="text-2xl font-bold mb-4 text-warning">
                💭 "Je ne suis pas doué avec les ordinateurs..."
              </h3>
              <p className="text-lg leading-relaxed">
                <strong>Rassurez-vous !</strong> One Système a été conçu spécialement pour des gens comme vous. 95% de nos clients apprennent à l'utiliser en moins d'une journée. Et si vous avez la moindre question, notre équipe québécoise est là pour vous guider pas à pas.
              </p>
            </Card>
            
            <Card className="p-8 shadow-card">
              <h3 className="text-2xl font-bold mb-4 text-warning">
                💰 "Ça va sûrement me coûter cher..."
              </h3>
              <p className="text-lg leading-relaxed">
                <strong>Au contraire !</strong> Si on vous dit que chaque mois vous économiserez au moins 500$ en temps et en erreurs évitées, et que l'abonnement coûte moins que ça... c'est un investissement qui se paie tout seul, non ?
              </p>
            </Card>
            
            <Card className="p-8 shadow-card">
              <h3 className="text-2xl font-bold mb-4 text-warning">
                🔒 "Je vais perdre le contrôle sur mes données..."
              </h3>
              <p className="text-lg leading-relaxed">
                <strong>Tout le contraire !</strong> One Système vous REND le contrôle. Toutes vos infos vitales au bout des doigts, en temps réel, depuis n'importe où. Plus jamais de "où j'ai mis ce fichier ?" ou de données perdues.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">
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