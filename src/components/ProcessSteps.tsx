import { Card } from "@/components/ui/card";
import { Calendar, Settings, TrendingUp, CheckCircle2 } from "lucide-react";

export const ProcessSteps = () => {
  const steps = [
    {
      number: 1,
      icon: Calendar,
      title: "Diagnostic personnalisé (30 min)",
      description: "Analyse gratuite de vos besoins et conception du système idéal pour vous",
      details: ["Audit de vos processus actuels", "Définition de votre système sur mesure", "Estimation des délais et investissement"],
      timing: "Cette semaine"
    },
    {
      number: 2,
      icon: Settings,
      title: "Développement & livraison",
      description: "Notre équipe développe votre système sur mesure et vous accompagne au lancement",
      details: ["Développement selon vos spécifications", "Tests et ajustements", "Formation personnalisée de votre équipe"],
      timing: "4-12 semaines"
    },
    {
      number: 3,
      icon: TrendingUp,
      title: "Support continu & évolutions",
      description: "Votre système évolue avec votre entreprise grâce à notre support dédié",
      details: ["Support technique illimité", "Ajout de nouvelles fonctionnalités", "Optimisations continues"],
      timing: "Dès le 1er mois"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Voici exactement comment nous procédons
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Un processus éprouvé pour créer LE système parfait pour votre entreprise
          </p>
        </div>

        <div className="relative">
          {/* Ligne de connexion */}
          <div className="hidden lg:block absolute left-1/2 top-24 bottom-24 w-1 bg-gradient-primary transform -translate-x-1/2"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className={`flex items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Numéro de l'étape */}
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-strong relative lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                  {step.number}
                </div>

                {/* Contenu de l'étape */}
                <Card className={`flex-1 p-8 shadow-card hover:shadow-medium transition-all duration-300 ${index % 2 === 1 ? 'lg:mr-auto lg:ml-8 lg:max-w-lg' : 'lg:ml-auto lg:mr-8 lg:max-w-lg'}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{step.title}</h3>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                          {step.timing}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Garantie */}
        <div className="mt-16 text-center">
          <Card className="p-8 shadow-card max-w-2xl mx-auto bg-success/10 border-success/30">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <h3 className="text-2xl font-bold text-success">Satisfaction garantie</h3>
            </div>
            <p className="text-lg">
              Si votre système sur mesure ne vous fait pas gagner au moins <strong>10 heures par semaine</strong> 
              après 30 jours d'utilisation, nous le reprenons et vous remboursons intégralement.
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              * Conditions détaillées disponibles lors de l'appel diagnostic
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};