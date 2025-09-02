import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowRight, 
  Target, 
  Mail, 
  Settings, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  link?: string;
  icon: any;
}

interface ActionableInsightsProps {
  daysBack: number;
}

export const ActionableInsights = ({ daysBack }: ActionableInsightsProps) => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateActions();
  }, [daysBack]);

  const generateActions = async () => {
    setIsLoading(true);
    try {
      // Fetch relevant data for generating actions
      const [
        { data: funnelData },
        { data: healthData },
        { data: metricsData }
      ] = await Promise.all([
        supabase.rpc('get_funnel_analysis', { days_back: daysBack }),
        supabase.rpc('get_tracking_health_metrics', { days_back: 7 }),
        supabase.rpc('get_compact_overview_metrics', { days_back: daysBack })
      ]);

      const generatedActions: ActionItem[] = [];

      // Funnel optimization actions
      if (funnelData) {
        const visitorsStep = funnelData.find((s: any) => s.step_name === 'Visiteurs');
        if (visitorsStep && visitorsStep.conversion_rate < 15) {
          generatedActions.push({
            id: 'optimize_landing',
            title: 'Améliorer la capture sur landing',
            description: `Seulement ${visitorsStep.conversion_rate.toFixed(1)}% de conversion. Testez un nouveau titre ou value proposition.`,
            priority: 'high',
            action: 'Tester un titre A/B',
            icon: Target
          });
        }

        const quizStep = funnelData.find((s: any) => s.step_name === 'Quiz Terminé');
        if (quizStep && quizStep.drop_off_rate > 60) {
          generatedActions.push({
            id: 'improve_quiz',
            title: 'Réduire l\'abandon du quiz',
            description: `${quizStep.drop_off_rate.toFixed(0)}% d'abandon. Simplifiez les questions ou ajoutez de la motivation.`,
            priority: 'medium',
            action: 'Optimiser le quiz',
            icon: CheckCircle
          });
        }
      }

      // Lead management actions
      if (metricsData && metricsData[0]) {
        const metrics = metricsData[0];
        if (metrics.total_leads > 0 && metrics.conversion_rate < 10) {
          generatedActions.push({
            id: 'follow_up_leads',
            title: 'Relancer les leads sans RDV',
            description: `${metrics.total_leads - metrics.total_bookings} leads n'ont pas pris de rendez-vous. Relancez-les.`,
            priority: 'high',
            action: 'Voir les leads',
            link: '/leads',
            icon: Mail
          });
        }
      }

      // Data quality actions
      if (healthData) {
        const utmIssues = healthData.find((h: any) => h.metric_name.includes('UTM'));
        if (utmIssues && utmIssues.status !== 'OK') {
          generatedActions.push({
            id: 'fix_utm',
            title: 'Améliorer le tracking UTM',
            description: 'Beaucoup de leads "Direct" - ajoutez des paramètres UTM pour mieux attribuer.',
            priority: 'medium',
            action: 'Configurer UTM',
            icon: Settings
          });
        }
      }

      // Default actions if none generated
      if (generatedActions.length === 0) {
        generatedActions.push(
          {
            id: 'monitor_performance',
            title: 'Continuer le monitoring',
            description: 'Vos métriques sont stables. Surveillez les tendances et testez de nouveaux canaux.',
            priority: 'low',
            action: 'Voir analytics avancées',
            icon: TrendingUp
          },
          {
            id: 'test_content',
            title: 'Tester du nouveau contenu',
            description: 'Expérimentez avec de nouvelles créatives ou messages pour augmenter les conversions.',
            priority: 'medium',
            action: 'Créer du contenu',
            icon: Target
          }
        );
      }

      // Limit to 3 actions max
      setActions(generatedActions.slice(0, 3));
    } catch (error) {
      console.error('Erreur lors de la génération des actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'border-destructive/20 bg-destructive/5';
      case 'medium': return 'border-warning/20 bg-warning/5';
      case 'low': return 'border-primary/20 bg-primary/5';
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return { text: 'Urgent', variant: 'destructive' as const };
      case 'medium': return { text: 'Important', variant: 'secondary' as const };
      case 'low': return { text: 'À considerer', variant: 'outline' as const };
    }
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
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
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
        <CardTitle>À faire maintenant</CardTitle>
        <CardDescription>
          Actions prioritaires basées sur vos données
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => {
            const IconComponent = action.icon;
            const priorityBadge = getPriorityBadge(action.priority);
            
            return (
              <div 
                key={action.id} 
                className={`p-4 border rounded-lg ${getPriorityColor(action.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <IconComponent className="h-5 w-5 mt-0.5 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{action.title}</h4>
                        <Badge variant={priorityBadge.variant} className="text-xs">
                          {priorityBadge.text}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      <Button 
                        size="sm" 
                        variant={action.priority === 'high' ? 'default' : 'outline'}
                        className="flex items-center gap-2"
                        onClick={() => {
                          if (action.link) {
                            window.location.href = action.link;
                          }
                        }}
                      >
                        {action.action}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pro tip */}
        <div className="mt-4 p-3 bg-muted/50 border border-muted rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Conseil:</p>
              <p className="text-sm text-muted-foreground">
                Concentrez-vous sur 1 action à la fois pour des résultats mesurables.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};