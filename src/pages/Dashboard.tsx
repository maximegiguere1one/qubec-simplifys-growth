
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimplifiedOverview } from '@/components/dashboard/SimplifiedOverview';
import { SimplifiedFunnel } from '@/components/dashboard/SimplifiedFunnel';
import { TopSources } from '@/components/dashboard/TopSources';
import { ActionableInsights } from '@/components/dashboard/ActionableInsights';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';

import { ExperimentTracker } from '@/components/ExperimentTracker';
import { LeadsManagement } from '@/components/admin/LeadsManagement';
import { GlobalFilters, GlobalFiltersState } from '@/components/dashboard/GlobalFilters';
import { PipelineHealthPanel } from '@/components/dashboard/PipelineHealthPanel';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Mail, 
  Calendar,
  Settings,
  Download,
  Filter,
  Cog,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Global filters state
  const [globalFilters, setGlobalFilters] = useState<GlobalFiltersState>({
    dateRange: 30,
    timezone: 'America/Toronto',
    comparison: true,
    autoRefresh: false
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFiltersChange = (filters: Partial<GlobalFiltersState>) => {
    setGlobalFilters(prev => ({ ...prev, ...filters }));
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const exportCSV = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_trended_dashboard_metrics', { 
          days_back: globalFilters.dateRange,
          compare_period: globalFilters.comparison 
        });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Date', 'Leads', 'Quiz Completions', 'VSL Views', 'Bookings', 'Taux Conversion %', 'Score Quiz Moyen'];
      const csvContent = [
        headers.join(','),
        ...(data || []).map((row: any) => [
          new Date(row.date).toLocaleDateString('fr-CA'),
          row.total_leads,
          row.quiz_completions,
          row.vsl_views,
          row.bookings,
          row.conversion_rate,
          row.avg_quiz_score
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!globalFilters.autoRefresh) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [globalFilters.autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminAuth onAuthSuccess={(user) => setUser(user)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-background">
      <div className="container mx-auto container-mobile py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-responsive-lg font-bold">One Système Analytics</h1>
              <p className="text-muted-foreground mt-2">
                Tableau de bord complet pour optimiser votre funnel de conversion
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="outline" className="text-success border-success">
                🟢 Live
              </Badge>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
              <Link to="/email-settings">
                <Button variant="outline" size="sm">
                  <Cog className="h-4 w-4 mr-2" />
                  Config Email
                </Button>
              </Link>
              <Link to="/email-diagnostic">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Diagnostic
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        {/* Global Filters */}
        <GlobalFilters 
          filters={globalFilters}
          onFiltersChange={setGlobalFilters}
          onRefresh={handleRefresh}
          isLoading={loading}
        />

        {/* Pipeline Health Panel (visible on all tabs) */}
        <div className="mb-6">
          <PipelineHealthPanel key={refreshTrigger} />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics Avancées
            </TabsTrigger>
            <TabsTrigger value="experiments" className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Tests A/B
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Gestion Leads
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Campagnes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Simplified 10x clearer overview */}
            <SimplifiedOverview 
              globalFilters={globalFilters}
              onFiltersChange={handleFiltersChange}
              refreshTrigger={refreshTrigger}
            />
            
            <div className="grid gap-6 lg:grid-cols-2 mt-6">
              <SimplifiedFunnel 
                daysBack={globalFilters.dateRange} 
                refreshTrigger={refreshTrigger}
              />
              <TopSources 
                daysBack={globalFilters.dateRange}
                refreshTrigger={refreshTrigger}
              />
            </div>
            
            <div className="mt-6">
              <ActionableInsights 
                daysBack={globalFilters.dateRange}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="experiments">
            <ExperimentTracker />
          </TabsContent>

          <TabsContent value="leads">
            <LeadsManagement />
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Campagnes Email</h2>
                  <p className="text-muted-foreground">
                    Gérez vos séquences email automatisées
                  </p>
                </div>
                <Link to="/email-settings">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuration
                  </Button>
                </Link>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Séquences Email Automatisées</CardTitle>
                  <CardDescription>
                    Suivi et performance de vos campagnes email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Campagnes Email</h3>
                    <p className="text-muted-foreground mb-4">
                      Système de campagnes email prêt à être configuré
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Link to="/email-settings">
                        <Button>
                          <Settings className="h-4 w-4 mr-2" />
                          Configurer
                        </Button>
                      </Link>
                      <Link to="/email-diagnostic">
                        <Button variant="outline">
                          <Mail className="h-4 w-4 mr-2" />
                          Tester
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quebec Business Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              🏢 Insights Marché Québécois
            </CardTitle>
            <CardDescription>
              Analyse spécifique au marché des PME québécoises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">73%</div>
                <div className="text-sm text-muted-foreground">PME intéressées par l'automatisation</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-success">15h/sem</div>
                <div className="text-sm text-muted-foreground">Temps économisé moyen</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-cta">4-6 mois</div>
                <div className="text-sm text-muted-foreground">ROI récupération moyenne</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
