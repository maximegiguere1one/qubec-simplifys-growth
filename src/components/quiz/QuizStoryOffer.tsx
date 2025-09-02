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
            <h3 className="font-bold text-lg mb-2">Témoignage</h3>
            <p className="text-muted-foreground">
              "Avant, je passais mes nuits dans Excel et je repoussais toujours les tâches importantes. 
              Mais dès que j'ai compris que je pouvais <strong className="text-foreground">automatiser 80% de mes tâches</strong>, 
              tout a changé. Aujourd'hui, je finis mes journées à 17h…"
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