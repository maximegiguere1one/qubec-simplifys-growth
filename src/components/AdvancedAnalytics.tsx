
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Activity,
  Filter,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AdvancedMetrics {
  total_visitors: number;
  lead_capture_rate: number;
  quiz_start_rate: number;
  quiz_completion_rate: number;
  average_lead_score: number;
  qualified_leads_count: number;
  hot_leads_count: number;
  warm_leads_count: number;
  cold_leads_count: number;
  consultation_booking_rate: number;
}

export const AdvancedAnalytics = () => {
  const [metrics, setMetrics] = useState<AdvancedMetrics>({
    total_visitors: 0,
    lead_capture_rate: 0,
    quiz_start_rate: 0,
    quiz_completion_rate: 0,
    average_lead_score: 0,
    qualified_leads_count: 0,
    hot_leads_count: 0,
    warm_leads_count: 0,
    cold_leads_count: 0,
    consultation_booking_rate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    fetchAdvancedMetrics();
  }, [daysBack]);

  const fetchAdvancedMetrics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_advanced_metrics', { days_back: daysBack });

      if (error) throw error;

      if (data && data.length > 0) {
        setMetrics({
          total_visitors: data[0].total_visitors || 0,
          lead_capture_rate: data[0].lead_capture_rate || 0,
          quiz_start_rate: data[0].quiz_start_rate || 0,
          quiz_completion_rate: data[0].quiz_completion_rate || 0,
          average_lead_score: data[0].average_lead_score || 0,
          qualified_leads_count: data[0].qualified_leads_count || 0,
          hot_leads_count: data[0].hot_leads_count || 0,
          warm_leads_count: data[0].warm_leads_count || 0,
          cold_leads_count: data[0].cold_leads_count || 0,
          consultation_booking_rate: data[0].consultation_booking_rate || 0,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métriques avancées:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRateColor = (rate: number) => {
    if (rate >= 15) return 'text-success';
    if (rate >= 10) return 'text-warning';
    return 'text-destructive';
  };

  const getRateBadge = (rate: number) => {
    if (rate >= 15) return { variant: 'default', text: 'Excellent' };
    if (rate >= 10) return { variant: 'secondary', text: 'Bon' };
    return { variant: 'destructive', text: 'À améliorer' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avancées</h2>
          <p className="text-muted-foreground">
            Analyse détaillée du comportement des visiteurs et performance du funnel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={daysBack} 
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
          </select>
          <Button onClick={fetchAdvancedMetrics} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques de Performance */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs Uniques</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_visitors}</div>
            <p className="text-xs text-muted-foreground">
              Basé sur les vues de landing page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capture de Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getRateColor(metrics.lead_capture_rate)}`}>
                {metrics.lead_capture_rate.toFixed(1)}%
              </div>
              <Badge variant={getRateBadge(metrics.lead_capture_rate).variant as any}>
                {getRateBadge(metrics.lead_capture_rate).text}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Visiteurs → Leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Démarrage Quiz</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.quiz_start_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Visiteurs qui commencent le quiz
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Quiz</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.quiz_completion_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Quiz démarrés → Terminés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.average_lead_score.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Points sur le quiz de qualification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Consultation</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.consultation_booking_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Leads → Consultations réservées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segmentation des Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Segmentation des Leads</CardTitle>
          <CardDescription>
            Répartition des leads par niveau de qualification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-600">{metrics.hot_leads_count}</div>
              <div className="text-sm font-medium text-red-700">Leads Chauds</div>
              <div className="text-xs text-red-600">Score 8-10</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-orange-50">
              <div className="text-2xl font-bold text-orange-600">{metrics.warm_leads_count}</div>
              <div className="text-sm font-medium text-orange-700">Leads Tièdes</div>
              <div className="text-xs text-orange-600">Score 5-7</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">{metrics.cold_leads_count}</div>
              <div className="text-sm font-medium text-blue-700">Leads Froids</div>
              <div className="text-xs text-blue-600">Score 0-4</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{metrics.qualified_leads_count}</div>
              <div className="text-sm font-medium text-green-700">Leads Qualifiés</div>
              <div className="text-xs text-green-600">Prêts pour consultation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations d'Optimisation</CardTitle>
          <CardDescription>
            Actions suggérées basées sur vos métriques actuelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.lead_capture_rate < 10 && (
              <div className="flex items-start space-x-3 p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                <ArrowUp className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">Améliorer la capture de leads</p>
                  <p className="text-sm text-orange-700">
                    Votre taux de conversion visiteur→lead est de {metrics.lead_capture_rate.toFixed(1)}%. 
                    Testez de nouveaux titres ou offres sur votre landing page.
                  </p>
                </div>
              </div>
            )}
            
            {metrics.quiz_completion_rate < 60 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <ArrowUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Optimiser le quiz</p>
                  <p className="text-sm text-blue-700">
                    {metrics.quiz_completion_rate.toFixed(1)}% des visiteurs terminent le quiz. 
                    Raccourcissez les questions ou ajoutez une barre de progression.
                  </p>
                </div>
              </div>
            )}
            
            {metrics.consultation_booking_rate < 15 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <ArrowDown className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Améliorer la conversion consultation</p>
                  <p className="text-sm text-red-700">
                    Seulement {metrics.consultation_booking_rate.toFixed(1)}% des leads réservent une consultation. 
                    Révisez votre VSL ou ajoutez de l'urgence.
                  </p>
                </div>
              </div>
            )}
            
            {metrics.lead_capture_rate >= 15 && metrics.quiz_completion_rate >= 70 && metrics.consultation_booking_rate >= 20 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Excellente performance !</p>
                  <p className="text-sm text-green-700">
                    Vos métriques sont au-dessus des benchmarks. Continuez sur cette voie et pensez à tester de nouveaux canaux d'acquisition.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
