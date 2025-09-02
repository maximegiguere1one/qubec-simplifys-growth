import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, ArrowDown, Lightbulb } from 'lucide-react';

interface FunnelStep {
  step_name: string;
  step_order: number;
  total_entries: number;
  conversions: number;
  conversion_rate: number;
  drop_off_rate: number;
  bottleneck_score: number;
}

interface SimplifiedFunnelProps {
  daysBack: number;
}

export const SimplifiedFunnel = ({ daysBack }: SimplifiedFunnelProps) => {
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, [daysBack]);

  const fetchFunnelData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_funnel_analysis', { days_back: daysBack });

      if (error) throw error;
      setFunnelData(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement du funnel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simplify to 3 main steps
  const simplifiedSteps = [
    {
      name: 'Visites',
      entries: funnelData.find(s => s.step_name === 'Visiteurs')?.total_entries || 0,
      conversions: funnelData.find(s => s.step_name === 'Capture Lead')?.total_entries || 0,
      rate: funnelData.find(s => s.step_name === 'Visiteurs')?.conversion_rate || 0,
      dropOff: funnelData.find(s => s.step_name === 'Visiteurs')?.drop_off_rate || 0
    },
    {
      name: 'Leads',
      entries: funnelData.find(s => s.step_name === 'Capture Lead')?.total_entries || 0,
      conversions: funnelData.find(s => s.step_name === 'Quiz Terminé')?.total_entries || 0,
      rate: funnelData.find(s => s.step_name === 'Capture Lead')?.conversion_rate || 0,
      dropOff: funnelData.find(s => s.step_name === 'Capture Lead')?.drop_off_rate || 0
    },
    {
      name: 'Rendez-vous',
      entries: funnelData.find(s => s.step_name === 'Quiz Terminé')?.total_entries || 0,
      conversions: funnelData.find(s => s.step_name === 'Consultation')?.total_entries || 0,
      rate: funnelData.find(s => s.step_name === 'Quiz Terminé')?.conversion_rate || 0,
      dropOff: funnelData.find(s => s.step_name === 'Quiz Terminé')?.drop_off_rate || 0
    }
  ];

  const biggestDrop = simplifiedSteps.reduce((prev, current) => 
    current.dropOff > prev.dropOff ? current : prev
  );

  const getAdvice = (stepName: string, dropOff: number) => {
    if (stepName === 'Visites' && dropOff > 70) {
      return "Testez un nouveau titre ou CTA sur la landing page";
    }
    if (stepName === 'Leads' && dropOff > 60) {
      return "Simplifiez le quiz ou ajoutez de la motivation";
    }
    if (stepName === 'Rendez-vous' && dropOff > 40) {
      return "Relancez les leads chauds sans rendez-vous";
    }
    return "Performance acceptable";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel - 3 Étapes</CardTitle>
        <CardDescription>
          Parcours de conversion simplifié
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {simplifiedSteps.map((step, index) => (
            <div key={step.name}>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{step.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {step.entries.toLocaleString()} entrées
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-lg font-bold">
                      {step.rate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.dropOff.toFixed(0)}% de perte
                    </p>
                  </div>
                  {step.name === biggestDrop.name && step.dropOff > 50 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Goulot
                    </Badge>
                  )}
                </div>
              </div>
              {index < simplifiedSteps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Biggest bottleneck advice */}
        {biggestDrop.dropOff > 50 && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium">Goulot potentiel ici:</p>
                <p className="text-sm text-muted-foreground">
                  {getAdvice(biggestDrop.name, biggestDrop.dropOff)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};