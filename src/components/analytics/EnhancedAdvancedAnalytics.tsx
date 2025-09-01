import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Users, 
  Target, 
  TrendingUp, 
  Clock,
  Globe,
  Play,
  MousePointer,
  RefreshCw,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface AttributionData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  visitors: number;
  leads: number;
  quiz_completions: number;
  bookings: number;
  conversion_rate: number;
  cost_per_lead: number;
  roi_score: number;
}

interface VSLEngagement {
  time_bucket: string;
  play_events: number;
  pause_events: number;
  completion_events: number;
  avg_watch_duration: number;
  engagement_rate: number;
  cta_clicks: number;
  cta_conversion_rate: number;
}

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

export const EnhancedAdvancedAnalytics = () => {
  const [attributionData, setAttributionData] = useState<AttributionData[]>([]);
  const [vslEngagement, setVslEngagement] = useState<VSLEngagement[]>([]);
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics>({
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
  const [activeTab, setActiveTab] = useState('attribution');

  useEffect(() => {
    fetchAllData();
  }, [daysBack]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch attribution analysis
      const { data: attribution, error: attrError } = await supabase
        .rpc('get_attribution_analysis', { days_back: daysBack });

      // Fetch VSL engagement  
      const { data: vslData, error: vslError } = await supabase
        .rpc('get_vsl_engagement_analysis', { days_back: daysBack });

      // Fetch advanced metrics
      const { data: advancedData, error: advError } = await supabase
        .rpc('get_advanced_metrics', { days_back: daysBack });

      if (attrError) throw attrError;
      if (vslError) throw vslError;
      if (advError) throw advError;

      setAttributionData(attribution || []);
      setVslEngagement(vslData || []);
      if (advancedData && advancedData.length > 0) {
        setAdvancedMetrics(advancedData[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics avancées:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAttributionChart = () => {
    return attributionData.map(item => ({
      source: item.utm_source === 'direct' ? 'Direct' : item.utm_source,
      leads: item.leads,
      bookings: item.bookings,
      conversion: item.conversion_rate,
      roi: item.roi_score
    }));
  };

  const formatVSLChart = () => {
    return vslEngagement.map(item => ({
      period: item.time_bucket,
      engagement: item.engagement_rate,
      plays: item.play_events,
      completions: item.completion_events,
      cta_rate: item.cta_conversion_rate,
      duration: Math.round(item.avg_watch_duration / 60) // Convert to minutes
    }));
  };

  const formatLeadSegmentation = () => {
    const segments = [
      { name: 'Leads Chauds', value: advancedMetrics.hot_leads_count, color: 'hsl(var(--destructive))' },
      { name: 'Leads Tièdes', value: advancedMetrics.warm_leads_count, color: 'hsl(var(--warning))' },
      { name: 'Leads Froids', value: advancedMetrics.cold_leads_count, color: 'hsl(var(--primary))' },
      { name: 'Qualifiés', value: advancedMetrics.qualified_leads_count, color: 'hsl(var(--success))' }
    ];
    return segments.filter(s => s.value > 0);
  };

  const getRateColor = (rate: number) => {
    if (rate >= 20) return 'text-success';
    if (rate >= 10) return 'text-warning';
    return 'text-destructive';
  };

  const getRateBadge = (rate: number) => {
    if (rate >= 20) return { variant: 'default' as const, text: 'Excellent' };
    if (rate >= 10) return { variant: 'secondary' as const, text: 'Bon' };
    return { variant: 'destructive' as const, text: 'À améliorer' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics Avancées</h2>
          <p className="text-muted-foreground">
            Analyse approfondie des performances, attribution et comportements utilisateurs
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

      {/* Performance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs Uniques</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {advancedMetrics.total_visitors.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Capture: {advancedMetrics.lead_capture_rate.toFixed(1)}%
              </p>
              <Badge variant={getRateBadge(advancedMetrics.lead_capture_rate).variant}>
                {getRateBadge(advancedMetrics.lead_capture_rate).text}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Quiz</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {advancedMetrics.quiz_completion_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Score moyen: {advancedMetrics.average_lead_score.toFixed(1)}/10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultation</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cta">
              {advancedMetrics.consultation_booking_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Leads qualifiés: {advancedMetrics.qualified_leads_count}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attribution" className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            Attribution
          </TabsTrigger>
          <TabsTrigger value="vsl" className="flex items-center">
            <Play className="h-4 w-4 mr-2" />
            Engagement VSL
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Segmentation
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Cohortes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attribution" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attribution Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance par Source</CardTitle>
                <CardDescription>
                  Leads et conversions par canal d'acquisition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatAttributionChart()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="source" 
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
                      <Bar dataKey="leads" fill="hsl(var(--primary))" name="Leads" />
                      <Bar dataKey="bookings" fill="hsl(var(--success))" name="Consultations" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Attribution Table */}
            <Card>
              <CardHeader>
                <CardTitle>Détails Attribution</CardTitle>
                <CardDescription>
                  Analyse détaillée par source/campagne
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {attributionData.slice(0, 8).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">
                          {item.utm_source} / {item.utm_medium}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.leads} leads → {item.bookings} consultations
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">
                          {item.conversion_rate.toFixed(1)}%
                        </p>
                        <Badge variant="outline" className="text-xs">
                          ROI: {item.roi_score.toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vsl" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* VSL Engagement by Time */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement VSL par Période</CardTitle>
                <CardDescription>
                  Taux d'engagement et de complétion selon l'heure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatVSLChart()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="period" 
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
                      <Area 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="hsl(var(--cta))" 
                        fill="hsl(var(--cta))" 
                        fillOpacity={0.2}
                        name="Engagement (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* VSL Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métriques VSL Détaillées</CardTitle>
                <CardDescription>
                  Performance par tranche horaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vslEngagement.map((period) => (
                    <div key={period.time_bucket} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{period.time_bucket}</h4>
                        <Badge variant="outline">
                          {period.engagement_rate.toFixed(1)}% engagement
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Lectures</p>
                          <p className="font-semibold">{period.play_events}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Complétions</p>
                          <p className="font-semibold">{period.completion_events}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Durée moy.</p>
                          <p className="font-semibold">{Math.round(period.avg_watch_duration / 60)}min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CTA clicks</p>
                          <p className="font-semibold text-cta">{period.cta_clicks}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Lead Segmentation Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Leads</CardTitle>
                <CardDescription>
                  Distribution par niveau de qualification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={formatLeadSegmentation()}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {formatLeadSegmentation().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Segmentation Details */}
            <Card>
              <CardHeader>
                <CardTitle>Détails Segmentation</CardTitle>
                <CardDescription>
                  Analyse des leads par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-destructive/5">
                      <div className="text-2xl font-bold text-destructive">
                        {advancedMetrics.hot_leads_count}
                      </div>
                      <div className="text-sm font-medium text-destructive">Leads Chauds</div>
                      <div className="text-xs text-muted-foreground">Score 8-10</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg bg-warning/5">
                      <div className="text-2xl font-bold text-warning">
                        {advancedMetrics.warm_leads_count}
                      </div>
                      <div className="text-sm font-medium text-warning">Leads Tièdes</div>
                      <div className="text-xs text-muted-foreground">Score 5-7</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg bg-primary/5">
                      <div className="text-2xl font-bold text-primary">
                        {advancedMetrics.cold_leads_count}
                      </div>
                      <div className="text-sm font-medium text-primary">Leads Froids</div>
                      <div className="text-xs text-muted-foreground">Score 0-4</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg bg-success/5">
                      <div className="text-2xl font-bold text-success">
                        {advancedMetrics.qualified_leads_count}
                      </div>
                      <div className="text-sm font-medium text-success">Qualifiés</div>
                      <div className="text-xs text-muted-foreground">Prêts consultation</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Insights Segmentation:</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive"></div>
                        {Math.round((advancedMetrics.hot_leads_count / (advancedMetrics.hot_leads_count + advancedMetrics.warm_leads_count + advancedMetrics.cold_leads_count + advancedMetrics.qualified_leads_count)) * 100)}% des leads sont chauds
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success"></div>
                        Taux de qualification: {Math.round((advancedMetrics.qualified_leads_count / Math.max((advancedMetrics.hot_leads_count + advancedMetrics.warm_leads_count + advancedMetrics.cold_leads_count + advancedMetrics.qualified_leads_count), 1)) * 100)}%
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse de Cohortes</CardTitle>
              <CardDescription>
                Suivi de la rétention et progression des leads dans le temps (Fonctionnalité à venir)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analyse de Cohortes</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Cette fonctionnalité permettra de suivre la progression des leads par cohortes mensuelles, 
                  analyser les patterns de conversion et identifier les optimisations temporelles.
                </p>
                <Badge variant="outline">
                  Disponible prochainement
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};