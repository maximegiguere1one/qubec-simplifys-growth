import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Users, 
  Target, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TrendedMetrics {
  date: string;
  total_leads: number;
  quiz_completions: number;
  vsl_views: number;
  bookings: number;
  conversion_rate: number;
  avg_quiz_score: number;
  previous_period_leads: number;
  previous_period_bookings: number;
  previous_period_conversion: number;
}

interface FunnelStep {
  step_name: string;
  step_order: number;
  total_entries: number;
  conversions: number;
  conversion_rate: number;
  drop_off_rate: number;
  bottleneck_score: number;
}

interface TrackingHealth {
  metric_name: string;
  metric_value: number;
  status: string;
  recommendation: string;
}

export const EnhancedOverviewDashboard = () => {
  const [trendData, setTrendData] = useState<TrendedMetrics[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [healthData, setHealthData] = useState<TrackingHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);
  const [showComparison, setShowComparison] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [daysBack]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch trended metrics
      const { data: trendedData, error: trendError } = await supabase
        .rpc('get_trended_dashboard_metrics', { 
          days_back: daysBack, 
          compare_period: showComparison 
        });

      // Fetch funnel analysis  
      const { data: funnelAnalysis, error: funnelError } = await supabase
        .rpc('get_funnel_analysis', { days_back: daysBack });

      // Fetch tracking health
      const { data: healthMetrics, error: healthError } = await supabase
        .rpc('get_tracking_health_metrics', { days_back: 7 });

      if (trendError) throw trendError;
      if (funnelError) throw funnelError;
      if (healthError) throw healthError;

      setTrendData(trendedData || []);
      setFunnelData(funnelAnalysis || []);
      setHealthData(healthMetrics || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals and trends
  const currentPeriodTotals = trendData.reduce((acc, day) => ({
    leads: acc.leads + day.total_leads,
    bookings: acc.bookings + day.bookings,
    quiz_completions: acc.quiz_completions + day.quiz_completions,
    vsl_views: acc.vsl_views + day.vsl_views
  }), { leads: 0, bookings: 0, quiz_completions: 0, vsl_views: 0 });

  const previousPeriodTotals = trendData.reduce((acc, day) => ({
    leads: acc.leads + day.previous_period_leads,
    bookings: acc.bookings + day.previous_period_bookings
  }), { leads: 0, bookings: 0 });

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatChartData = (data: TrendedMetrics[]) => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('fr-CA', { 
        month: 'short', 
        day: 'numeric' 
      }),
      leads: item.total_leads,
      bookings: item.bookings,
      conversion: item.conversion_rate,
      quiz: item.quiz_completions,
      vsl: item.vsl_views,
      score: item.avg_quiz_score
    }));
  };

  const getHealthBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'bon': 
      case 'ok': 
        return { variant: 'default' as const, icon: CheckCircle, color: 'text-success' };
      case 'attention':
      case 'probleme':
        return { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-destructive' };
      default:
        return { variant: 'secondary' as const, icon: Activity, color: 'text-warning' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-muted rounded mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Vue d'ensemble Analytics</h2>
          <p className="text-muted-foreground">
            Métriques en temps réel avec analyse de tendances et insights prédictifs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={daysBack} 
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
          </select>
          <Button 
            onClick={fetchAllData} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPI Cards with trends */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {currentPeriodTotals.leads.toLocaleString()}
            </div>
            {showComparison && (
              <div className="flex items-center gap-2 text-xs">
                {calculateTrend(currentPeriodTotals.leads, previousPeriodTotals.leads) >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-success" />
                    <span className="text-success">
                      +{calculateTrend(currentPeriodTotals.leads, previousPeriodTotals.leads)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">
                      {calculateTrend(currentPeriodTotals.leads, previousPeriodTotals.leads)}%
                    </span>
                  </>
                )}
                <span className="text-muted-foreground">vs période précédente</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {currentPeriodTotals.bookings.toLocaleString()}
            </div>
            {showComparison && (
              <div className="flex items-center gap-2 text-xs">
                {calculateTrend(currentPeriodTotals.bookings, previousPeriodTotals.bookings) >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-success">
                      +{calculateTrend(currentPeriodTotals.bookings, previousPeriodTotals.bookings)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">
                      {calculateTrend(currentPeriodTotals.bookings, previousPeriodTotals.bookings)}%
                    </span>
                  </>
                )}
                <span className="text-muted-foreground">vs période précédente</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cta">
              {currentPeriodTotals.leads > 0 
                ? ((currentPeriodTotals.bookings / currentPeriodTotals.leads) * 100).toFixed(1)
                : '0.0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              {currentPeriodTotals.leads} leads → {currentPeriodTotals.bookings} consultations
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Santé Tracking</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {healthData.filter(h => h.status === 'OK' || h.status === 'Bon').length > 
               healthData.filter(h => h.status !== 'OK' && h.status !== 'Bon').length ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning" />
              )}
              <span className="text-lg font-semibold">
                {Math.round((healthData.filter(h => h.status === 'OK' || h.status === 'Bon').length / 
                Math.max(healthData.length, 1)) * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {healthData.filter(h => h.status === 'OK' || h.status === 'Bon').length}/{healthData.length} métriques OK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances sur {daysBack} jours</CardTitle>
          <CardDescription>
            Évolution des leads, conversions et engagement au fil du temps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatChartData(trendData)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  className="fill-muted-foreground text-xs"
                />
                <YAxis className="fill-muted-foreground text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Leads"
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Consultations"
                />
                <Line 
                  type="monotone" 
                  dataKey="conversion" 
                  stroke="hsl(var(--cta))" 
                  strokeWidth={2}
                  name="Taux Conversion (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analyse Funnel</CardTitle>
            <CardDescription>
              Identification des goulots d'étranglement dans votre parcours de conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((step, index) => (
                <div key={step.step_name} className="relative">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {step.step_order}
                      </div>
                      <div>
                        <p className="font-medium">{step.step_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {step.total_entries.toLocaleString()} entrées
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {step.conversion_rate.toFixed(1)}%
                      </p>
                      {step.bottleneck_score > 50 && (
                        <Badge variant="destructive" className="text-xs">
                          Goulot
                        </Badge>
                      )}
                    </div>
                  </div>
                  {index < funnelData.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-px h-4 bg-border"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tracking Health */}
        <Card>
          <CardHeader>
            <CardTitle>Santé du Tracking</CardTitle>
            <CardDescription>
              Qualité et fiabilité de vos données analytiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthData.map((metric) => {
                const badge = getHealthBadge(metric.status);
                const IconComponent = badge.icon;
                
                return (
                  <div key={metric.metric_name} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${badge.color}`} />
                      <div>
                        <p className="font-medium">{metric.metric_name}</p>
                        <p className="text-sm text-muted-foreground">{metric.recommendation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {metric.metric_value % 1 === 0 
                          ? metric.metric_value.toFixed(0)
                          : metric.metric_value.toFixed(1)
                        }
                        {metric.metric_name.includes('%') ? '%' : ''}
                      </p>
                      <Badge variant={badge.variant} className="text-xs">
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Intelligents</CardTitle>
          <CardDescription>
            Recommandations basées sur vos données des {daysBack} derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Dynamic insights based on data */}
            {funnelData.some(step => step.bottleneck_score > 50) && (
              <div className="flex items-start space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Goulot d'étranglement détecté</p>
                  <p className="text-sm text-muted-foreground">
                    L'étape "{funnelData.find(s => s.bottleneck_score > 50)?.step_name}" 
                    présente un taux de conversion faible. Optimisez cette partie du funnel en priorité.
                  </p>
                </div>
              </div>
            )}
            
            {currentPeriodTotals.leads > previousPeriodTotals.leads && (
              <div className="flex items-start space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-success">Croissance positive</p>
                  <p className="text-sm text-muted-foreground">
                    Vos leads ont augmenté de {calculateTrend(currentPeriodTotals.leads, previousPeriodTotals.leads)}%. 
                    Maintenez cette dynamique en doublant sur les canaux performants.
                  </p>
                </div>
              </div>
            )}

            {healthData.some(h => h.status !== 'OK' && h.status !== 'Bon') && (
              <div className="flex items-start space-x-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <Calendar className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Action requise sur le tracking</p>
                  <p className="text-sm text-muted-foreground">
                    {healthData.filter(h => h.status !== 'OK' && h.status !== 'Bon').length} métriques nécessitent votre attention 
                    pour garantir la qualité des données.
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