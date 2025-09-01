
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Users, Target, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';

interface DashboardMetrics {
  total_leads: number;
  quiz_completions: number;
  vsl_views: number;
  bookings: number;
  conversion_rate: number;
  avg_quiz_score: number;
}

export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_leads: 0,
    quiz_completions: 0,
    vsl_views: 0,
    bookings: 0,
    conversion_rate: 0,
    avg_quiz_score: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    fetchMetrics();
  }, [daysBack]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_dashboard_metrics', { days_back: daysBack });

      if (error) throw error;

      if (data && data.length > 0) {
        setMetrics({
          total_leads: data[0].total_leads || 0,
          quiz_completions: data[0].quiz_completions || 0,
          vsl_views: data[0].vsl_views || 0,
          bookings: data[0].bookings || 0,
          conversion_rate: data[0].conversion_rate || 0,
          avg_quiz_score: data[0].avg_quiz_score || 0,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const metricCards = [
    {
      title: 'Total Leads',
      value: metrics.total_leads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Quiz Terminés',
      value: metrics.quiz_completions,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'VSL Vues',
      value: metrics.vsl_views,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Consultations',
      value: metrics.bookings,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Taux Conversion',
      value: `${metrics.conversion_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Score Moyen Quiz',
      value: metrics.avg_quiz_score.toFixed(1),
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vue d'ensemble Analytics</h2>
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
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Insights Funnel</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Taux Lead → Quiz:</span>
            <span className="font-medium">
              {metrics.total_leads ? ((metrics.quiz_completions / metrics.total_leads) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Taux Quiz → Consultation:</span>
            <span className="font-medium">
              {metrics.quiz_completions ? ((metrics.bookings / metrics.quiz_completions) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Conversion Globale:</span>
            <span className="font-medium text-primary">
              {metrics.conversion_rate.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Performance VSL:</span>
            <span className="font-medium">
              {metrics.total_leads ? ((metrics.vsl_views / metrics.total_leads) * 100).toFixed(1) : 0}% des leads
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
