import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Activity,
  TrendingUp,
  Database
} from 'lucide-react';

interface HealthMetric {
  metric_name: string;
  metric_value: number;
  status: string;
  recommendation: string;
}

interface PipelineHealth {
  total_events_7d: number;
  failed_analytics_batches: number;
  invalid_sessions_percent: number;
  leads_without_utm_percent: number;
  duplicate_leads: number;
  health_score: number;
}

export const PipelineHealthPanel = () => {
  const [healthData, setHealthData] = useState<HealthMetric[]>([]);
  const [pipelineHealth, setPipelineHealth] = useState<PipelineHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    setIsLoading(true);
    try {
      // Get tracking health metrics
      const { data: healthMetrics, error: healthError } = await supabase
        .rpc('get_tracking_health_metrics', { days_back: 7 });

      // Get compact overview for health score
      const { data: overviewData, error: overviewError } = await supabase
        .rpc('get_compact_overview_metrics', { days_back: 7 });

      if (healthError) throw healthError;
      if (overviewError) throw overviewError;

      setHealthData(healthMetrics || []);
      
      // Calculate pipeline health summary
      const healthScore = overviewData?.[0]?.health_score || 0;
      const totalEvents = await getTotalEvents7d();
      
      setPipelineHealth({
        total_events_7d: totalEvents,
        failed_analytics_batches: 0, // TODO: Track this from logs
        invalid_sessions_percent: healthScore < 95 ? 100 - healthScore : 0,
        leads_without_utm_percent: getMetricValue(healthMetrics, 'Leads sans UTM (%)'),
        duplicate_leads: getMetricValue(healthMetrics, 'Leads Dupliques'),
        health_score: healthScore
      });
    } catch (error) {
      console.error('Erreur lors du chargement de la santé du pipeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalEvents7d = async (): Promise<number> => {
    try {
      const { count } = await supabase
        .from('funnel_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      return count || 0;
    } catch {
      return 0;
    }
  };

  const getMetricValue = (metrics: HealthMetric[], name: string): number => {
    const metric = metrics.find(m => m.metric_name === name);
    return metric?.metric_value || 0;
  };

  const getHealthBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'bon': 
      case 'ok': 
        return { variant: 'default' as const, color: 'text-success' };
      case 'attention':
      case 'probleme':
        return { variant: 'destructive' as const, color: 'text-destructive' };
      default:
        return { variant: 'secondary' as const, color: 'text-warning' };
    }
  };

  const getOverallHealthStatus = () => {
    if (!pipelineHealth) return { status: 'Chargement...', color: 'text-muted-foreground', icon: RefreshCw };
    
    if (pipelineHealth.health_score >= 95) {
      return { status: 'Excellent', color: 'text-success', icon: CheckCircle };
    } else if (pipelineHealth.health_score >= 80) {
      return { status: 'Bon', color: 'text-warning', icon: Activity };
    } else {
      return { status: 'Critique', color: 'text-destructive', icon: AlertTriangle };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Santé du Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthStatus = getOverallHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Santé du Pipeline
          </div>
          <Button 
            onClick={fetchHealthData} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </CardTitle>
        <CardDescription>
          Monitoring en temps réel de la qualité des données et des processus
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall Health Score */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <HealthIcon className={`h-6 w-6 ${healthStatus.color}`} />
            <div>
              <p className="font-semibold">État Global</p>
              <p className="text-sm text-muted-foreground">
                Score de santé: {pipelineHealth?.health_score?.toFixed(1) || '0'}%
              </p>
            </div>
          </div>
          <Badge variant={pipelineHealth?.health_score && pipelineHealth.health_score >= 95 ? 'default' : 'destructive'}>
            {healthStatus.status}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span>Événements (7j)</span>
            <span className="font-mono">{pipelineHealth?.total_events_7d?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Sessions invalides</span>
            <span className="font-mono">{pipelineHealth?.invalid_sessions_percent?.toFixed(1) || '0'}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Leads sans UTM</span>
            <span className="font-mono">{pipelineHealth?.leads_without_utm_percent?.toFixed(1) || '0'}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Leads dupliqués</span>
            <span className="font-mono">{pipelineHealth?.duplicate_leads || '0'}</span>
          </div>
        </div>

        {/* Detailed Health Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Métriques Détaillées</h4>
          {healthData.map((metric) => {
            const badge = getHealthBadge(metric.status);
            return (
              <div key={metric.metric_name} className="flex items-center justify-between text-xs p-2 border rounded">
                <span>{metric.metric_name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">
                    {metric.metric_value % 1 === 0 
                      ? metric.metric_value.toFixed(0)
                      : metric.metric_value.toFixed(1)
                    }
                    {metric.metric_name.includes('%') ? '%' : ''}
                  </span>
                  <Badge variant={badge.variant} className="text-xs">
                    {metric.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        {pipelineHealth && pipelineHealth.health_score < 95 && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Améliorations Recommandées</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  {pipelineHealth.invalid_sessions_percent > 5 && (
                    <li>• Vérifier l'implémentation des sessions ID</li>
                  )}
                  {pipelineHealth.leads_without_utm_percent > 10 && (
                    <li>• Ajouter le tracking UTM sur toutes les sources</li>
                  )}
                  {pipelineHealth.duplicate_leads > 0 && (
                    <li>• Nettoyer les leads dupliqués</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};