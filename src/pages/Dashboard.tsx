
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ExperimentTracker } from '@/components/ExperimentTracker';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
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
  Cog
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
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
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="experiments">
            <ExperimentTracker />
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Leads</CardTitle>
                <CardDescription>
                  Gérez et qualifiez vos leads par segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gestion des Leads</h3>
                  <p className="text-muted-foreground mb-4">
                    Interface de gestion des leads en cours de développement
                  </p>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Voir tous les leads
                  </Button>
                </div>
              </CardContent>
            </Card>
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
