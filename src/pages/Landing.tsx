import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, TrendingUp, Shield, Zap, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";
import { createLead, trackEvent, getABVariant, trackABConversion } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { MicroSurvey } from "@/components/MicroSurvey";
import { ABTest } from "@/components/ABTest";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";

const Landing = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, mobileButtonClass, mobileContainerClass, animationClass, imageLoadingStrategy } = useMobileOptimized();
  
  // Track page view
  usePageTracking();

  // A/B test variants
  const headlineVariant = getABVariant("landing_headline", ["control", "value_focused", "time_specific"]);
  const ctaVariant = getABVariant("landing_cta_destination", ["quiz", "direct_booking"]);

  // Show micro-survey after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSurvey(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const getHeadlineByVariant = () => {
    switch (headlineVariant) {
      case "value_focused":
        return (
          <>
            Récupérez{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              15+ heures par semaine
            </span>{" "}
            sans effort
          </>
        );
      case "time_specific":
        return (
          <>
            Arrêtez de{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              perdre 20h/semaine
            </span>{" "}
            dans la paperasse
          </>
        );
      default:
        return (
          <>
            Finies les{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              heures perdues
            </span>{" "}
            dans la paperasse
          </>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Create lead in Supabase
    const lead = await createLead(email, name, 'landing_page');
    
    // Track A/B test conversion
    await trackABConversion("landing_headline", headlineVariant, "form_submit");
    await trackABConversion("landing_cta_destination", ctaVariant, "form_submit");
    
    // Track form submission
    await trackEvent('lp_submit_optin', {
      email,
      name,
      lead_id: lead?.id,
      headline_variant: headlineVariant,
      cta_variant: ctaVariant,
    });
    
    // Store user data in localStorage
    localStorage.setItem("userData", JSON.stringify({ email, name }));
    
    toast({
      title: "Parfait !",
      description: ctaVariant === "direct_booking" 
        ? "Réservons votre consultation !" 
        : "Commençons par le quiz pour identifier vos besoins.",
    });
    
    // Navigate based on A/B test
    const destination = ctaVariant === "direct_booking" ? "/book-call" : "/quiz";
    navigate(destination);
    setIsLoading(false);
  };

  const benefits = [
    {
      icon: Clock,
      title: "Retrouvez votre temps précieux",
      description: "Des clients québécois économisent en moyenne 15h par semaine grâce à l'automatisation intelligente."
    },
    {
      icon: Shield,
      title: "Dormez sur vos deux oreilles",
      description: "Vos données sont protégées selon les standards québécois avec des sauvegardes automatiques."
    },
    {
      icon: Zap,
      title: "Un partenaire qui vous comprend",
      description: "Notre équipe locale connaît vos défis d'entrepreneur québécois et parle votre langue."
    },
    {
      icon: TrendingUp,
      title: "Faites grandir votre entreprise sereinement",
      description: "Concentrez-vous sur ce qui compte vraiment pendant que vos processus fonctionnent en autonomie."
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      company: "Garage MD, Rimouski",
      text: "Avant, je passais mes soirées à faire ma paperasse d'inventaire. Maintenant, tout se fait automatiquement. Je rentre chez nous à 5h!",
      result: "15 heures sauvées par semaine"
    },
    {
      name: "Pierre Gagnon", 
      company: "Construction Gagnon, Lévis",
      text: "J'étais sceptique au début - je pensais que c'était trop compliqué pour moi. Mais finalement, c'est plus simple que mon ancien système Excel!",
      result: "Zéro formation requise"
    }
  ];

  return (
    <div className={`min-h-[100dvh] bg-gradient-background ${mobileContainerClass}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto container-mobile section-mobile">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4">
                {/* Clear H1 headline above the fold */}
                <h1 className="heading-responsive font-bold leading-tight text-foreground">
                  {getHeadlineByVariant()}
                </h1>
                {/* Concise value proposition */}
                <p className="subheading-responsive text-muted-foreground leading-relaxed max-w-2xl">
                  Système sur mesure qui automatise votre paperasse. <strong className="text-foreground">15+ heures récupérées par semaine</strong>. Zéro formation requise.
                </p>
                
                {/* Quebec trust signals immediately visible */}
                <div className="flex flex-wrap gap-4 items-center pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Entreprise 100% québécoise</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>200+ PME nous font confiance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>(514) 555-AIDE</span>
                  </div>
                </div>
              </div>

              {/* Primary CTA above the fold with generous whitespace */}
              <Card className="p-6 sm:p-8 md:p-10 shadow-card border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
                <h2 className="text-responsive-lg font-bold mb-6 text-center text-foreground">
                  📊 Calculer votre potentiel d'économie de temps
                </h2>
                <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
                  <strong className="text-foreground">Analyse gratuite en 2 minutes</strong> • Clients récupèrent 15h/semaine • Résultats personnalisés
                </p>
                {/* Minimized form fields */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Votre prénom et nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 sm:h-14 text-base sm:text-lg btn-touch border-2 border-primary/30 focus:border-primary"
                      required
                      autoComplete="name"
                      aria-label="Votre nom complet"
                    />
                    <Input
                      type="email"
                      placeholder="Votre adresse courriel"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 sm:h-14 text-base sm:text-lg btn-touch border-2 border-primary/30 focus:border-primary"
                      required
                      autoComplete="email"
                      aria-label="Votre adresse email"
                    />
                  </div>
                  
                  {/* Large, prominent CTA button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      variant="cta-large" 
                      className={`w-full h-14 sm:h-16 ${mobileButtonClass} btn-touch text-base sm:text-lg font-semibold ${animationClass} shadow-lg hover:shadow-xl transition-all duration-300`}
                      disabled={isLoading}
                    >
                      <span className="truncate">
                        {isLoading ? "🔄 Analyse en cours..." : 
                         ctaVariant === "direct_booking" 
                           ? "📞 Réserver ma consultation gratuite"
                           : "🚀 Calculer mes heures récupérables"}
                      </span>
                    </Button>
                  </div>
                </form>
                {/* Privacy and trust indicators */}
                <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    ✓ Aucun engagement • ✓ 100% gratuit • ✓ Résultats en 2 minutes
                  </p>
                  <p className="text-xs text-muted-foreground">
                    🔒 Vos données restent confidentielles • Jamais de spam • 
                    <a href="#" className="text-primary underline ml-1">Politique de confidentialité</a>
                  </p>
                </div>
              </Card>
            </div>

            {/* Hero image with social proof overlay */}
            <div className="relative">
              {!isMobile && (
                <img 
                  src={heroImage} 
                  alt="Entrepreneurs québécois utilisant One Système pour automatiser leur gestion"
                  className={`rounded-2xl shadow-strong w-full ${animationClass}`}
                  loading={imageLoadingStrategy as any}
                  width="600"
                  height="400"
                />
              )}
              
              {/* Multiple trust badges */}
              <div className="absolute -bottom-4 -left-4 bg-success text-success-foreground p-3 rounded-lg shadow-medium">
                <div className="text-lg font-bold">95%</div>
                <div className="text-xs whitespace-nowrap">satisfaction</div>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground p-3 rounded-lg shadow-medium">
                <div className="text-lg font-bold">200+</div>
                <div className="text-xs whitespace-nowrap">PME servies</div>
              </div>
              
              {isMobile && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    💼 Déjà 200+ PME québécoises nous font confiance
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-mobile bg-secondary/50">
        <div className="container mx-auto container-mobile">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-responsive-xl font-bold mb-4">
              Pourquoi perdre du temps quand tout peut être automatisé?
            </h2>
            <p className="text-responsive-base text-muted-foreground max-w-3xl mx-auto">
              Des centaines d'entrepreneurs au Québec ont déjà repris le contrôle de leur temps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-4 sm:p-6 text-center shadow-card hover:shadow-medium transition-all duration-300 transform hover:scale-105">
                <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section-mobile">
        <div className="container mx-auto container-mobile">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-responsive-xl font-bold mb-4">
              Des entrepreneurs comme vous qui ont repris leur temps
            </h2>
            <p className="text-responsive-base text-muted-foreground">
              Ils géraient tout à la main. Maintenant, ils se concentrent sur faire grandir leur business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-4 sm:p-6 md:p-8 shadow-card">
                <div className="flex items-start space-x-4">
                  <CheckCircle2 className="w-8 h-8 text-success flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-base sm:text-lg mb-4 italic">"{testimonial.text}"</p>
                    <div className="border-t pt-4">
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-muted-foreground text-sm">{testimonial.company}</p>
                      <div className="mt-2 inline-block bg-success-light text-success px-3 py-1 rounded-full text-sm font-semibold">
                        {testimonial.result}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Repeated CTA Section (eliminating scrolling need) */}
      <section className="section-mobile bg-gradient-hero text-white">
        <div className="container mx-auto container-mobile text-center">
          <h2 className="text-responsive-xl font-bold mb-4">
            🎯 Prêt à récupérer 15+ heures par semaine?
          </h2>
          <p className="text-responsive-base mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
            <strong>Analyse gratuite et personnalisée</strong> en 2 minutes. Découvrez exactement combien d'heures vous pourriez économiser.
          </p>
          
          {/* Repeated primary CTA */}
          <div className="space-y-4">
            <Button 
              variant="cta-large"
              className="btn-touch text-base sm:text-lg px-6 sm:px-8 h-14 sm:h-16 shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => {
                trackEvent('vsl_cta_click', { cta_location: 'repeated_final', variant: 'scroll_to_form' });
                document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="truncate">🚀 Commencer mon analyse gratuite</span>
            </Button>
            
            {/* Secondary CTA - safety net */}
            <div>
              <Button 
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 btn-touch"
                onClick={() => {
                  trackEvent('vsl_cta_click', { cta_location: 'secondary_download', variant: 'brochure' });
                  // Could trigger download or modal
                }}
              >
                📄 Télécharger la brochure
              </Button>
            </div>
          </div>
          
          <p className="text-sm opacity-75 mt-6">
            ⚡ Réponse en moins de 24h • ☎️ Support local québécois
          </p>
        </div>
      </section>

      {/* Micro Survey */}
      {showSurvey && (
        <MicroSurvey
          surveyId="landing_interest"
          question="Quel est votre principal défi actuellement ?"
          options={[
            { value: 'time', label: 'Manque de temps' },
            { value: 'efficiency', label: 'Processus inefficaces' },
            { value: 'errors', label: 'Trop d\'erreurs manuelles' },
            { value: 'growth', label: 'Difficile de grandir' },
          ]}
          onComplete={() => setShowSurvey(false)}
          onDismiss={() => setShowSurvey(false)}
        />
      )}

      {/* Legal Footer */}
      <footer className="border-t border-border/50 mt-16 sm:mt-20 pt-8 sm:pt-12 bg-background">
        <div className="container mx-auto container-mobile">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-muted-foreground mb-6">
              <a href="#" className="hover:text-foreground transition-colors">Conditions d'utilisation</a>
              <a href="#" className="hover:text-foreground transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-foreground transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-foreground transition-colors">Nous contacter</a>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              © 2024 One Système. Tous droits réservés.
            </p>
            <p className="text-xs text-muted-foreground">
              Les résultats peuvent varier selon l'entreprise. Les témoignages reflètent l'expérience individuelle des clients.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;