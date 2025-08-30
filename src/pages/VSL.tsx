import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, CheckCircle2, Clock, TrendingUp } from "lucide-react";

const VSL = () => {
  const [quizResults, setQuizResults] = useState<any>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const results = localStorage.getItem("quizResults");
    if (results) {
      setQuizResults(JSON.parse(results));
    }
  }, []);

  const getPersonalizedMessage = () => {
    if (!quizResults) return "Vous pourriez";
    
    const score = quizResults.totalScore;
    if (score >= 14) {
      return "Votre entreprise pourrait économiser jusqu'à 25 heures par semaine";
    } else if (score >= 10) {
      return "Votre entreprise pourrait économiser jusqu'à 15 heures par semaine";
    } else if (score >= 6) {
      return "Votre entreprise pourrait économiser jusqu'à 10 heures par semaine";
    } else {
      return "Votre entreprise pourrait économiser jusqu'à 5 heures par semaine";
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
      {/* Hero Section with Personalized Message */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              {getPersonalizedMessage()}{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                avec One Système
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez comment nous transformons les entreprises québécoises comme la vôtre en seulement quelques semaines
            </p>
          </div>

          {/* Video Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="overflow-hidden shadow-strong">
              <div className="relative bg-gradient-hero aspect-video flex items-center justify-center">
                {!isVideoPlaying ? (
                  <div className="text-center text-white">
                    <Button
                      variant="cta-large"
                      onClick={() => setIsVideoPlaying(true)}
                      className="mb-4"
                    >
                      <Play className="w-8 h-8 mr-3" />
                      Regarder la vidéo explicative (4 min)
                    </Button>
                    <p className="text-lg opacity-90">
                      Découvrez la méthode exacte que nous utilisons pour transformer les entreprises
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-xl">Chargement de la vidéo...</p>
                      <p className="text-sm opacity-75 mt-2">
                        (Dans une vraie application, votre vidéo serait ici)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="text-center mb-20">
            <Button
              variant="cta-large"
              size="xl"
              onClick={() => navigate("/book-call")}
              className="pulse-animation"
            >
              Réservez votre consultation gratuite maintenant
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ Consultation 100% gratuite • ✓ Aucun engagement • ✓ Analyse personnalisée
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            Ce que vous obtenez avec One Système
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 text-center shadow-card hover:shadow-medium transition-all duration-300">
                <benefit.icon className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-muted-foreground text-lg">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            Résultats réels d'entreprises québécoises
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 shadow-card">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="w-5 h-5 bg-warning rounded-full"></div>
                    ))}
                  </div>
                  <p className="text-lg italic mb-4">"{testimonial.text}"</p>
                </div>
                <div className="border-t pt-6">
                  <p className="font-bold text-lg">{testimonial.name}</p>
                  <p className="text-muted-foreground">{testimonial.company}</p>
                  <div className="mt-3 inline-block bg-success-light text-success px-4 py-2 rounded-full font-semibold">
                    {testimonial.result}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à transformer votre entreprise ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Réservez votre consultation gratuite de 30 minutes et découvrez exactement comment One Système peut révolutionner votre façon de travailler
          </p>
          <Button
            variant="cta-large"
            size="xl"
            onClick={() => navigate("/book-call")}
            className="transform hover:scale-105 transition-all duration-300"
          >
            Oui, je veux ma consultation gratuite !
          </Button>
          <p className="text-sm opacity-75 mt-6">
            Plus de 500 entreprises québécoises nous font confiance
          </p>
        </div>
      </section>
    </div>
  );
};

export default VSL;