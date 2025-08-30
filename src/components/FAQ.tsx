import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, Shield, Headphones, Zap, DollarSign } from "lucide-react";

export const FAQ = () => {
  const [openItem, setOpenItem] = useState<number | null>(0);

  const faqs = [
    {
      icon: Clock,
      question: "Combien de temps prend l'implantation de One Système ?",
      answer: "La plupart de nos clients sont opérationnels en 1 à 2 semaines. Nous commençons par un diagnostic gratuit de 30 minutes, puis notre équipe configure votre système et forme votre équipe. 95% de nos clients maîtrisent One Système en moins d'une journée."
    },
    {
      icon: Shield,
      question: "Comment se passe la migration de mes données actuelles ?",
      answer: "Nous nous occupons de tout ! Notre équipe technique migre vos données existantes (clients, produits, factures) de vos systèmes actuels vers One Système. Toutes vos données restent sécurisées au Canada et la migration se fait sans interruption de service."
    },
    {
      icon: DollarSign,
      question: "Quel est le coût d'One Système et y a-t-il des frais cachés ?",
      answer: "L'abonnement démarre à 297$/mois pour une PME standard, tout inclus : logiciel, support, mises à jour et conformité TPS/TVQ. Pas de frais cachés. L'implantation initiale et la formation sont incluses. La plupart de nos clients économisent plus que le coût de l'abonnement dès le premier mois."
    },
    {
      icon: Headphones,
      question: "Quel type de support recevrai-je ?",
      answer: "Support technique complet par une équipe 100% québécoise, du lundi au vendredi de 9h à 17h par téléphone, email ou chat. Formation initiale incluse + ressources d'aide en ligne. Nous restons avec vous jusqu'à ce que vous soyez autonome et à l'aise."
    },
    {
      icon: Zap,
      question: "Mes données sont-elles sécurisées et hébergées au Canada ?",
      answer: "Absolument ! Toutes vos données sont chiffrées et hébergées sur des serveurs canadiens certifiés. Nous respectons les lois québécoises et canadiennes sur la protection des données. Sauvegardes automatiques quotidiennes. Vous gardez le contrôle total de vos informations."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Les questions que vous vous posez sûrement
          </h2>
          <p className="text-xl text-muted-foreground">
            Nos réponses claires pour vous aider à prendre votre décision en toute confiance
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="shadow-card overflow-hidden">
              <Button
                variant="ghost"
                onClick={() => setOpenItem(openItem === index ? null : index)}
                className="w-full p-6 justify-between text-left h-auto"
              >
                <div className="flex items-center gap-4">
                  <faq.icon className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="text-lg font-semibold">{faq.question}</span>
                </div>
                {openItem === index ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </Button>
              
              {openItem === index && (
                <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="pl-10">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="p-6 bg-secondary/30 border-primary/20">
            <p className="text-lg mb-4">
              <strong>Vous avez d'autres questions ?</strong>
            </p>
            <p className="text-muted-foreground mb-4">
              Notre équipe québécoise est là pour vous répondre directement lors de votre diagnostic gratuit
            </p>
            <Button variant="outline" size="sm">
              <Headphones className="w-4 h-4 mr-2" />
              Poser ma question lors du diagnostic
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};