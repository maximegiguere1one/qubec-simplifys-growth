import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Info,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

interface CompactMetrics {
  total_leads: number;
  total_bookings: number;
  total_quiz_completions: number;
  total_vsl_views: number;
  conversion_rate: number;
  avg_quiz_score: number;
  health_score: number;
}

interface GlobalFiltersState {
  dateRange: number;
  timezone: string;
  comparison: boolean;
  autoRefresh: boolean;
}

interface SimplifiedOverviewProps {
  globalFilters: GlobalFiltersState;
  onFiltersChange: (filters: Partial<GlobalFiltersState>) => void;
}

export const SimplifiedOverview = ({ globalFilters, onFiltersChange }: SimplifiedOverviewProps) => {
  const [metrics, setMetrics] = useState<CompactMetrics | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [focusMetric, setFocusMetric] = useState<'leads' | 'bookings' | 'conversion'>('leads');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [globalFilters.dateRange, globalFilters.comparison]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch compact overview metrics
      const { data: compactData, error: compactError } = await supabase
        .rpc('get_compact_overview_metrics', { days_back: globalFilters.dateRange });

      // Fetch trend data for the chart
      const { data: trendedData, error: trendError } = await supabase
        .rpc('get_trended_dashboard_metrics', { 
          days_back: globalFilters.dateRange,
          compare_period: globalFilters.comparison 
        });

      if (compactError) throw compactError;
      if (trendError) throw trendError;

      setMetrics(compactData?.[0] || null);
      setTrendData(trendedData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSummaryText = () => {
    if (!metrics) return "Chargement des données...";
    
    const period = globalFilters.dateRange === 7 ? "7 derniers jours" : 
                  globalFilters.dateRange === 30 ? "30 derniers jours" : "90 derniers jours";
    
    return `Sur les ${period}: ${metrics.total_leads} leads, ${metrics.total_bookings} rendez-vous, ${metrics.conversion_rate.toFixed(1)}% de conversion.`;
  };

  const formatChartData = () => {
    return trendData.map(item => ({
      date: new Date(item.date).toLocaleDateString('fr-CA', { 
        month: 'short', 
        day: 'numeric' 
      }),
      leads: item.total_leads,
      bookings: item.bookings,
      conversion: item.conversion_rate
    }));
  };

  const getHealthStatus = (score: number) => {
    if (score >= 95) return { text: "Bon", variant: "default" as const, color: "text-success" };
    if (score >= 80) return { text: "À surveiller", variant: "secondary" as const, color: "text-warning" };
    return { text: "Problème", variant: "destructive" as const, color: "text-destructive" };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-2/3 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthStatus(metrics?.health_score || 0);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Summary sentence */}
        <div className="text-lg text-foreground font-medium">
          {getSummaryText()}
        </div>

        {/* 4 Clear KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Leads Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Leads</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Contact qualifié ayant rempli le formulaire
                  </TooltipContent>
                </Tooltip>
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {metrics?.total_leads?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Contacts qualifiés
              </p>
            </CardContent>
          </Card>

          {/* Bookings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Rendez-vous</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Consultations programmées avec leads
                  </TooltipContent>
                </Tooltip>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {metrics?.total_bookings?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics?.total_bookings} rdv sur {metrics?.total_leads} leads
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Taux conv.</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    RDV / Leads — pas visites
                  </TooltipContent>
                </Tooltip>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cta">
                {metrics?.conversion_rate?.toFixed(1) || '0.0'}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Performance de conversion
              </p>
            </CardContent>
          </Card>

          {/* Health Score Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Santé</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    % de métriques trackées correctement
                  </TooltipContent>
                </Tooltip>
              </div>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {metrics?.health_score?.toFixed(0) || 0}%
                </div>
                <Badge variant={healthStatus.variant} className="text-xs">
                  {healthStatus.text}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Qualité des données
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Single Focus Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Évolution - {globalFilters.dateRange} jours</CardTitle>
                <CardDescription>
                  Tendance de la métrique sélectionnée
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={focusMetric} onValueChange={(value: 'leads' | 'bookings' | 'conversion') => setFocusMetric(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="bookings">Rendez-vous</SelectItem>
                    <SelectItem value="conversion">Taux conv.</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={fetchData} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    className="fill-muted-foreground text-xs"
                  />
                  <YAxis className="fill-muted-foreground text-xs" />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value, name) => [
                      focusMetric === 'conversion' ? `${value}%` : value,
                      focusMetric === 'leads' ? 'Leads' : 
                      focusMetric === 'bookings' ? 'Rendez-vous' : 'Taux conv.'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={focusMetric} 
                    stroke={
                      focusMetric === 'leads' ? 'hsl(var(--primary))' :
                      focusMetric === 'bookings' ? 'hsl(var(--success))' : 'hsl(var(--cta))'
                    }
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};