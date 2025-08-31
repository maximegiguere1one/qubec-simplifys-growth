import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, TrendingUp, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";
import { createLead, trackEvent } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { MicroSurvey } from "@/components/MicroSurvey";
import { ABTest } from "@/components/ABTest";

const Landing = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Track page view
  usePageTracking();

  // Show micro-survey after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSurvey(true), 30000);
    return () => clearTimeout(timer);
  }, []);

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
    
    // Track form submission
    await trackEvent('lp_submit_optin', {
      email,
      name,
      lead_id: lead?.id,
    });
    
    // Store user data in localStorage
    localStorage.setItem("userData", JSON.stringify({ email, name }));
    
    toast({
      title: "Parfait !",
      description: "Commençons par le quiz pour identifier vos besoins.",
    });
    
    navigate("/quiz");
    setIsLoading(false);
  };

  const benefits = [
    {
      icon: Clock,
      title: "Finies les heures perdues",
      description: "Plus de paperasse, plus de calculs à la main. Votre système fait tout automatiquement."
    },
    {
      icon: Shield,
      title: "Zéro casse-tête technique",
      description: "Je m'occupe de tout l'aspect technique. Vous, vous vous concentrez sur votre business."
    },
    {
      icon: Zap,
      title: "Prêt à utiliser immédiatement",
      description: "Je configure tout, je forme votre équipe. Vous commencez à sauver du temps dès le jour 1."
    },
    {
      icon: TrendingUp,
      title: "Plus de temps = plus d'argent",
      description: "Le temps gagné, vous pouvez le réinvestir dans faire grandir votre entreprise."
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
    <div className="min-h-[100dvh] bg-gradient-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto container-mobile section-mobile">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <ABTest
                  testName="headline_variant"
                  variants={{
                    control: (
                      <h1 className="heading-responsive font-bold leading-tight">
                        Finies les{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          heures perdues
                        </span>{" "}
                        dans la paperasse
                      </h1>
                    ),
                    variant_a: (
                      <h1 className="heading-responsive font-bold leading-tight">
                        Arrêtez de{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          gérer votre business
                        </span>{" "}
                        à la main
                      </h1>
                    ),
                    variant_b: (
                      <h1 className="heading-responsive font-bold leading-tight">
                        Sauvez{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          15 heures par semaine
                        </span>{" "}
                        avec un système fait pour vous
                      </h1>
                    ),
                  }}
                />
                <p className="subheading-responsive text-muted-foreground leading-relaxed">
                  Je crée pour vous un système simple qui gère votre inventaire, vos factures, vos clients... tout ce qui vous fait perdre du temps actuellement. Vous n'avez rien à apprendre, je m'occupe de tout l'aspect technique.
                </p>
              </div>

              <Card className="p-4 sm:p-6 md:p-8 shadow-card border-2 border-primary/20">
                <h2 className="text-responsive-lg font-bold mb-4 sm:mb-6 text-center">
                  Voir combien de temps je peux vous sauver
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Votre nom complet"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 sm:h-12 text-base sm:text-lg btn-touch"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Votre adresse courriel professionnelle"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 sm:h-12 text-base sm:text-lg btn-touch"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="cta-large" 
                    className="w-full btn-touch text-sm sm:text-base px-4 sm:px-6"
                    disabled={isLoading}
                  >
                    <span className="truncate">
                      {isLoading ? "Envoi en cours..." : "Voir combien de temps je peux vous sauver"}
                    </span>
                  </Button>
                </form>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  ✓ Aucun engagement • ✓ 100% gratuit • ✓ Résultats en 2 minutes
                </p>
              </Card>
            </div>

            <div className="relative">
              <img 
                src={heroImage} 
                alt="Entrepreneurs québécois utilisant One Système"
                className="rounded-2xl shadow-strong w-full"
                loading="lazy"
              />
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-success text-success-foreground p-2 sm:p-3 rounded-lg shadow-medium max-w-[100px] sm:max-w-none">
                <div className="text-sm sm:text-lg font-bold">95%</div>
                <div className="text-xs whitespace-nowrap">satisfaction</div>
              </div>
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

      {/* Final CTA Section */}
      <section className="section-mobile bg-gradient-hero text-white">
        <div className="container mx-auto container-mobile text-center">
          <h2 className="text-responsive-xl font-bold mb-4">
            Prêt à arrêter de perdre votre temps?
          </h2>
          <p className="text-responsive-base mb-6 sm:mb-8 opacity-90">
            Découvrez exactement combien d'heures vous pourriez récupérer chaque semaine
          </p>
          <Button 
            variant="cta-large"
            className="btn-touch text-sm sm:text-base px-4 sm:px-6 max-w-full"
            onClick={() => {
              trackEvent('lp_submit_optin', { cta_location: 'final' });
              document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="truncate">Calculer mes heures perdues</span>
          </Button>
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
    </div>
  );
};

export default Landing;