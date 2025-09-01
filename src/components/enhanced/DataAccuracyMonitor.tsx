import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity,
  BarChart3,
  Shield
} from 'lucide-react';

interface DataQualityMetrics {
  totalEvents: number;
  validationFailures: number;
  honeypotDetections: number;
  rateLimitHits: number;
  duplicateLeads: number;
  invalidSessions: number;
  dataAccuracyScore: number;
}

export function DataAccuracyMonitor() {
  const [metrics, setMetrics] = React.useState<DataQualityMetrics>({
    totalEvents: 0,
    validationFailures: 0,
    honeypotDetections: 0,
    rateLimitHits: 0,
    duplicateLeads: 0,
    invalidSessions: 0,
    dataAccuracyScore: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [lastCheck, setLastCheck] = React.useState<Date>();

  const fetchDataQualityMetrics = async () => {
    setIsLoading(true);
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Get funnel events with validation info
      const { data: events } = await supabase
        .from('funnel_events')
        .select('*')
        .gte('created_at', oneDayAgo);

      // Get duplicate leads
      const { data: leads } = await supabase
        .from('leads')
        .select('email, created_at')
        .gte('created_at', oneDayAgo);

      // Calculate metrics from available data
      const totalEvents = events?.length || 0;
      
      const honeypotDetections = events?.filter(event => 
        event.event_data && 
        typeof event.event_data === 'object' &&
        (
          ('honeypot_detected' in event.event_data) ||
          ('validated' in event.event_data && event.event_data.validated === false)
        )
      ).length || 0;

      const invalidSessions = events?.filter(event => 
        !event.session_id || !/^sess_\d+_[a-zA-Z0-9]{9}$/.test(event.session_id)
      ).length || 0;

      // Check for missing required data
      const eventsWithMissingData = events?.filter(event => 
        !event.session_id || 
        !event.event_type || 
        !event.event_data ||
        (event.event_data && typeof event.event_data === 'object' && !('timestamp' in event.event_data))
      ).length || 0;

      // Calculate duplicate leads
      const emailCounts = leads?.reduce((acc: Record<string, number>, lead) => {
        acc[lead.email] = (acc[lead.email] || 0) + 1;
        return acc;
      }, {}) || {};
      
      const duplicateLeads = Object.values(emailCounts).filter(count => count > 1).length;

      // Calculate data accuracy score
      const qualityEvents = totalEvents - honeypotDetections - invalidSessions - eventsWithMissingData;
      const dataAccuracyScore = totalEvents > 0 ? Math.round((qualityEvents / totalEvents) * 100) : 100;

      setMetrics({
        totalEvents,
        validationFailures: eventsWithMissingData,
        honeypotDetections,
        rateLimitHits: 0, // Would need to track this in edge functions
        duplicateLeads,
        invalidSessions,
        dataAccuracyScore
      });

      setLastCheck(new Date());
    } catch (error) {
      console.error('Error fetching data quality metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDataQualityMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDataQualityMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getScoreBadge = (score: number) => {
    if (score >= 95) return { variant: 'default' as const, text: 'Excellent', color: 'text-green-600' };
    if (score >= 85) return { variant: 'secondary' as const, text: 'Bon', color: 'text-yellow-600' };
    return { variant: 'destructive' as const, text: 'À améliorer', color: 'text-red-600' };
  };

  const qualityItems = [
    {
      label: 'Événements Valides',
      value: metrics.totalEvents - metrics.validationFailures,
      total: metrics.totalEvents,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      label: 'Échecs de Validation',
      value: metrics.validationFailures,
      total: metrics.totalEvents,
      icon: XCircle,
      color: 'text-red-600'
    },
    {
      label: 'Détections Honeypot',
      value: metrics.honeypotDetections,
      total: metrics.totalEvents,
      icon: Shield,
      color: 'text-orange-600'
    },
    {
      label: 'Sessions Invalides',
      value: metrics.invalidSessions,
      total: metrics.totalEvents,
      icon: AlertTriangle,
      color: 'text-yellow-600'
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Moniteur de Qualité des Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Moniteur de Qualité des Données
            </CardTitle>
            <CardDescription>
              Surveillance en temps réel de l'intégrité des données
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreBadge(metrics.dataAccuracyScore).color}`}>
              {metrics.dataAccuracyScore}%
            </div>
            <Badge variant={getScoreBadge(metrics.dataAccuracyScore).variant}>
              {getScoreBadge(metrics.dataAccuracyScore).text}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {qualityItems.map((item) => (
            <div key={item.label} className="text-center p-3 border rounded-lg">
              <item.icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
              <div className="text-lg font-semibold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
              {item.total > 0 && (
                <div className="text-xs text-muted-foreground">
                  {Math.round((item.value / item.total) * 100)}% du total
                </div>
              )}
            </div>
          ))}
        </div>

        {metrics.duplicateLeads > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                {metrics.duplicateLeads} leads en doublon détectés
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Dernière vérification: {lastCheck?.toLocaleTimeString('fr-CA')}
          </span>
          <Button variant="outline" size="sm" onClick={fetchDataQualityMetrics}>
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}