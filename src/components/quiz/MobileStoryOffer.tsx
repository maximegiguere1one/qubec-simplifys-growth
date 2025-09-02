import { Card } from "@/components/ui/card";
import { Clock, Target, Gift } from "lucide-react";

export const MobileStoryOffer = () => {
  return (
    <Card className="p-4 mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="text-center space-y-3">
        <div className="flex justify-center gap-4 mb-3">
          <Clock className="w-5 h-5 text-primary" />
          <Target className="w-5 h-5 text-accent" />
          <Gift className="w-5 h-5 text-secondary" />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">+3200 dirigeants québécois</strong> ont utilisé ce quiz pour 
            <span className="text-primary font-semibold"> automatiser 80% de leurs tâches</span> et 
            <strong className="text-foreground">finir à 17h</strong>.
          </p>
          
          <p className="text-xs text-muted-foreground">
            ✨ <strong className="text-primary">Gratuit</strong> • 
            ⏱️ <strong>60 secondes</strong> • 
            🎯 <strong>Stratégie personnalisée</strong>
          </p>
        </div>
      </div>
    </Card>
  );
};