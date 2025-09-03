import { Card } from "@/components/ui/card";
import { Clock, Target, Gift } from "lucide-react";

export const QuizStoryOffer = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8 sm:mb-12">
      {/* Hook */}
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-start gap-4">
          <Clock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">Tu travailles trop ?</h3>
            <p className="text-muted-foreground">
              Si tu travailles 50h/semaine et que tu passes tes soirées à gérer de la paperasse… 
              <strong className="text-foreground">ce quiz est fait pour toi.</strong>
            </p>
          </div>
        </div>
      </Card>

      {/* Story */}
      <Card className="p-6 border-2 border-accent/40 bg-gradient-to-br from-accent/5 to-accent/10">
        <div className="flex items-start gap-4">
          <Target className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">Inventaire optimisé • Gain de temps</h3>
            <p className="text-muted-foreground">
              "Le système de gestion d'inventaire pour nos thermopompes a completement transformé nos opérations en back-end. 
              On gagne un temps fou, c'est structuré, puis ça nous permet de mieux servir nos clients. 
              Je recommande <strong className="text-foreground">ONE. Système</strong>."
            </p>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              — Karl Thivierge, Climat Distinction
            </p>
          </div>
        </div>
      </Card>

      {/* Offer */}
      <Card className="p-6 border-2 border-secondary/40 bg-gradient-to-br from-secondary/5 to-secondary/10">
        <div className="flex items-start gap-4">
          <Gift className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">Cadeau gratuit</h3>
            <p className="text-muted-foreground">
              Fais ce quiz gratuit maintenant et découvre <strong className="text-foreground">ta stratégie personnalisée</strong> 
              pour arrêter de te faire chier avec l'administratif – <strong className="text-primary">en moins de 2 minutes</strong>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};