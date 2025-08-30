import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

export const ROICalculator = () => {
  const [hoursPerWeek, setHoursPerWeek] = useState([10]);
  const [hourlyRate, setHourlyRate] = useState([25]);

  const monthlyLoss = hoursPerWeek[0] * 4 * hourlyRate[0];
  const subscriptionCost = 297; // Prix estimé One Système
  const monthlySavings = monthlyLoss - subscriptionCost;
  const breakEvenHours = Math.ceil(subscriptionCost / (hourlyRate[0] * 4));

  return (
    <Card className="p-8 shadow-card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Calculez vos économies personnalisées</h3>
        <p className="text-muted-foreground">Ajustez les curseurs selon votre situation</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">
            Heures perdues par semaine sur la paperasse : <strong>{hoursPerWeek[0]}h</strong>
          </label>
          <Slider
            value={hoursPerWeek}
            onValueChange={setHoursPerWeek}
            max={40}
            min={2}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>2h</span>
            <span>40h</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Votre taux horaire estimé : <strong>{hourlyRate[0]}$ CAD</strong>
          </label>
          <Slider
            value={hourlyRate}
            onValueChange={setHourlyRate}
            max={100}
            min={15}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>15$</span>
            <span>100$</span>
          </div>
        </div>

        <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg p-6 mt-6">
          <div className="text-center space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Perte mensuelle actuelle</p>
              <p className="text-2xl font-bold text-destructive">{monthlyLoss.toLocaleString('fr-CA')}$ CAD</p>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-sm text-muted-foreground">Avec One Système (297$/mois)</p>
              <p className="text-3xl font-bold text-success">
                +{monthlySavings > 0 ? monthlySavings.toLocaleString('fr-CA') : 0}$ CAD/mois
              </p>
            </div>
            
            <div className="bg-white/50 rounded p-3">
              <p className="text-sm font-medium">
                🎯 <strong>Votre abonnement est rentabilisé dès {breakEvenHours}h/semaine d'économies</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};