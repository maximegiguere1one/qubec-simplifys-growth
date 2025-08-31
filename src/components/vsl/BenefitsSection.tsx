import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, TrendingUp, Shield, Calendar, MapPin } from "lucide-react";

export const BenefitsSection = () => {
  return (
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
  );
};