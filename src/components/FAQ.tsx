import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, Shield, Headphones, Zap, DollarSign } from "lucide-react";

export const FAQ = () => {
  const [openItem, setOpenItem] = useState<number | null>(0);

  const faqs = [
    {
      icon: Clock,
      question: "Combien de temps prend le développement de mon système sur mesure ?",
      answer: "Cela dépend de la complexité de vos besoins. Un système simple prend 4-6 semaines, un système plus complexe 8-12 semaines. Nous vous donnons une estimation précise lors du diagnostic gratuit de 30 minutes. 95% de nos clients sont opérationnels et à l'aise avec leur nouveau système en moins d'une semaine après la livraison."
    },
    {
      icon: Shield,
      question: "Comment gérez-vous mes données actuelles ?",
      answer: "Nous analysons d'abord tous vos systèmes existants pour comprendre vos données. Si nécessaire, nous créons des connecteurs personnalisés pour récupérer vos informations importantes. Toutes vos données restent sécurisées au Canada et la transition se fait sans interruption de votre activité."
    },
    {
      icon: DollarSign,
      question: "Combien coûte un système sur mesure et comment ça fonctionne ?",
      answer: "L'investissement varie selon la complexité de votre projet : de 15 000$ à 50 000$ pour le développement initial, puis un abonnement de support mensuel à partir de 297$. Beaucoup de nos clients financent le projet grâce aux économies réalisées dès les premiers mois. Consultation gratuite pour une estimation précise."
    },
    {
      icon: Headphones,
      question: "Quel support recevrai-je avec mon système personnalisé ?",
      answer: "Support technique complet par une équipe 100% québécoise, du lundi au vendredi de 9h à 17h par téléphone, email ou chat. Formation complète incluse lors de la livraison + documentation personnalisée pour votre système. Support évolutif : nous ajoutons des fonctionnalités selon vos besoins futurs."
    },
    {
      icon: Zap,
      question: "Mes données sont-elles sécurisées et est-ce que je garde le contrôle ?",
      answer: "Absolument ! Votre système sur mesure peut être hébergé où vous voulez : chez nous au Canada, sur votre serveur, ou chez un hébergeur de votre choix. Toutes les données sont chiffrées selon les standards canadiens. Vous gardez un contrôle total : c'est VOTRE système, pas le nôtre qu'on vous loue."
    }
  ];

  return (
    <section className="section-mobile bg-background">
      <div className="container mx-auto container-mobile max-w-4xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="heading-responsive font-bold mb-4">
            Les questions que vous vous posez sûrement
          </h2>
          <p className="text-responsive-base text-muted-foreground">
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
              Notre équipe québécoise répondra à toutes vos questions lors de votre consultation gratuite
            </p>
            <Button variant="outline" size="sm">
              <Headphones className="w-4 h-4 mr-2" />
              Poser ma question lors de la consultation
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};