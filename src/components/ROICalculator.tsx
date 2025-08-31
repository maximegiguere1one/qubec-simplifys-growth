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
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 bg-muted/30 border-border/50">
        <div className="text-center mb-8">
          <Calculator className="mx-auto mb-4 text-primary" size={48} />
          <h3 className="text-2xl font-bold mb-2">Calculateur de ROI</h3>
          <p className="text-muted-foreground">
            Ajustez les curseurs pour voir vos économies potentielles
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">
                Heures perdues par semaine : {hoursPerWeek[0]}h
              </label>
              <Slider
                value={hoursPerWeek}
                onValueChange={setHoursPerWeek}
                max={40}
                min={5}
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3">
                Taux horaire estimé : {hourlyRate[0]}$/h
              </label>
              <Slider
                value={hourlyRate}
                onValueChange={setHourlyRate}
                max={100}
                min={15}
                step={5}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="bg-background rounded-lg p-6 border">
            <h4 className="text-lg font-semibold mb-4">Votre situation actuelle :</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Perte mensuelle :</span>
                <span className="font-bold text-destructive">{monthlyLoss.toLocaleString()}$</span>
              </div>
              <div className="flex justify-between">
                <span>Coût One Système :</span>
                <span className="font-bold">{subscriptionCost}$</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Économie mensuelle :</span>
                  <span className="font-bold text-success">+{monthlySavings.toLocaleString()}$</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Rentabilisé en {breakEvenHours}h de travail économisées
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            💡 Ces calculs sont basés sur les économies moyennes de nos clients québécois
          </p>
        </div>
      </Card>
    </div>
  );
};