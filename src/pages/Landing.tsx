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
      title: "Économisez 10+ heures par semaine",
      description: "Automatisez vos processus répétitifs"
    },
    {
      icon: TrendingUp,
      title: "Augmentez votre productivité de 300%",
      description: "Un seul système pour tout gérer"
    },
    {
      icon: Shield,
      title: "Éliminez 95% des erreurs manuelles",
      description: "Systèmes fiables et sécurisés"
    },
    {
      icon: Zap,
      title: "Résultats immédiats garantis",
      description: "Implémentation rapide et efficace"
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      company: "Restaurant Le Québec",
      text: "Nous avons économisé 15 heures par semaine dès la première semaine !",
      result: "300% d'efficacité en plus"
    },
    {
      name: "Jean-Pierre Lavoie",
      company: "Construction Lavoie Inc.",
      text: "One Système a révolutionné notre gestion. Plus d'erreurs, plus de temps perdu.",
      result: "Zéro erreur en 6 mois"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <ABTest
                  testName="headline_variant"
                  variants={{
                    control: (
                      <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                        Un seul système pour une gestion{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          10x plus simple
                        </span>{" "}
                        et efficace
                      </h1>
                    ),
                    variant_a: (
                      <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                        Économisez{" "}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                          15+ heures par semaine
                        </span>{" "}
                        avec One Système
                      </h1>
                    ),
                  }}
                />
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Découvrez comment simplifier votre entreprise québécoise en répondant à notre quiz rapide et gratuit. Plus de 500 entreprises nous font confiance.
                </p>
              </div>

              <Card className="p-8 shadow-card border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Commencez votre transformation dès maintenant
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Votre nom complet"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Votre adresse courriel professionnelle"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="cta-large" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Chargement..." : "Commencez le quiz maintenant – c'est gratuit !"}
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
              />
              <div className="absolute -bottom-6 -left-6 bg-success text-success-foreground p-4 rounded-xl shadow-medium">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm">de satisfaction client</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Pourquoi choisir One Système ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Rejoignez les centaines d'entrepreneurs québécois qui ont déjà transformé leur entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center shadow-card hover:shadow-medium transition-all duration-300 transform hover:scale-105">
                <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-muted-foreground">
              Des résultats concrets pour des entreprises comme la vôtre
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 shadow-card">
                <div className="flex items-start space-x-4">
                  <CheckCircle2 className="w-8 h-8 text-success flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-lg mb-4 italic">"{testimonial.text}"</p>
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
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à transformer votre entreprise ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Découvrez exactement comment One Système peut vous aider en 2 minutes
          </p>
          <Button 
            variant="cta-large"
            onClick={() => {
              trackEvent('lp_submit_optin', { cta_location: 'final' });
              document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Commencer le quiz gratuit maintenant
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