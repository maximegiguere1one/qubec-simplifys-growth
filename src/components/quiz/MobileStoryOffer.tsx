import { Card } from "@/components/ui/card";
import { Clock, Target, Gift } from "lucide-react";

export const MobileStoryOffer = () => {
  return (
    <div className="space-y-4">
      <Card className="p-4 border-accent/20 bg-gradient-subtle">
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Tu travailles trop ?</h3>
            <p className="text-sm text-muted-foreground">
              Les dirigeants québécois perdent 15h/semaine sur des tâches répétitives.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-accent/20 bg-gradient-subtle">
        <div className="flex items-start gap-3">
          <Target className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Témoignage</h3>
            <p className="text-sm text-muted-foreground">
              "J'ai récupéré 12h/semaine grâce à One Système" - Marie, Directrice PME
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-accent/20 bg-gradient-subtle">
        <div className="flex items-start gap-3">
          <Gift className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Cadeau gratuit</h3>
            <p className="text-sm text-muted-foreground">
              Découvre ton diagnostic personnalisé à la fin de ce quiz.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};