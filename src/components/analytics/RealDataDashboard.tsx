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
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardMetrics {
  total_leads: number;
  quiz_completions: number;
  vsl_views: number;
  bookings: number;
  conversion_rate: number;
  avg_quiz_score: number;
}

interface LeadAnalysis {
  date_bucket: string;
  total_leads: number;
  avg_score: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  utm_facebook: number;
  utm_instagram: number;
  utm_direct: number;
}

export const RealDataDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leadAnalysis, setLeadAnalysis] = useState<LeadAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    fetchRealData();
  }, [daysBack]);

  const fetchRealData = async () => {
    setIsLoading(true);
    try {
      // Fetch real dashboard metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_real_dashboard_metrics', { days_back: daysBack });

      // Fetch real leads analysis
      const { data: analysisData, error: analysisError } = await supabase
        .rpc('get_real_leads_analysis', { days_back: daysBack });

      if (metricsError) throw metricsError;
      if (analysisError) throw analysisError;

      setMetrics(metricsData?.[0] || null);
      setLeadAnalysis(analysisData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des vraies données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatChartData = (data: LeadAnalysis[]) => {
    return data.map(item => ({
      date: new Date(item.date_bucket).toLocaleDateString('fr-CA', { 
        month: 'short', 
        day: 'numeric' 
      }),
      leads: item.total_leads,
      score: item.avg_score || 0,
      hot: item.hot_leads,
      warm: item.warm_leads,
      cold: item.cold_leads
    }));
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Données Réelles - Vue Analytics</h2>
          <p className="text-muted-foreground">
            Données vérifiées et cohérentes basées sur les vraies entrées de leads
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
            onClick={fetchRealData} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Real KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads (Réel)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metrics?.total_leads || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Données vérifiées de la table leads
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Terminés</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {metrics?.quiz_completions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions quiz avec statut "completed"
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Conversion Réel</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cta">
              {metrics?.conversion_rate?.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.total_leads || 0} leads → {metrics?.bookings || 0} bookings
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-lg font-semibold">
                {metrics?.avg_quiz_score?.toFixed(1) || '0.0'}/100
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Qualité moyenne des leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real Data Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution Réelle sur {daysBack} jours</CardTitle>
          <CardDescription>
            Basée sur les vraies données de la table leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatChartData(leadAnalysis)}>
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
                  name="Leads Totaux"
                />
                <Line 
                  type="monotone" 
                  dataKey="hot" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Leads Chauds"
                />
                <Line 
                  type="monotone" 
                  dataKey="warm" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  name="Leads Tièdes"
                />
                <Line 
                  type="monotone" 
                  dataKey="cold" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  name="Leads Froids"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Alert */}
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Diagnostic des Données
          </CardTitle>
          <CardDescription>
            Analyse de la qualité et cohérence des données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={metrics?.total_leads && metrics.total_leads > 0 ? "default" : "destructive"}>
                {metrics?.total_leads && metrics.total_leads > 0 ? "✅ OK" : "❌ Problème"}
              </Badge>
              <span className="text-sm">
                Total des leads: {metrics?.total_leads || 0} (Table leads)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={metrics?.quiz_completions === 0 ? "destructive" : "default"}>
                {metrics?.quiz_completions === 0 ? "❌ Aucun quiz terminé" : "✅ Quiz OK"}
              </Badge>
              <span className="text-sm">
                Quiz terminés: {metrics?.quiz_completions || 0}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={metrics?.bookings === 0 ? "destructive" : "default"}>
                {metrics?.bookings === 0 ? "❌ Aucune réservation" : "✅ Bookings OK"}
              </Badge>
              <span className="text-sm">
                Réservations: {metrics?.bookings || 0}
              </span>
            </div>

            {metrics?.total_leads === 0 && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Aucun lead trouvé dans la période sélectionnée. 
                  Vérifiez que des leads ont été créés récemment.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};