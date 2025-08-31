import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Mail, 
  Calendar,
  Settings,
  Download,
  Filter
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Aujourd'hui</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-success">+15% vs hier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.5%</div>
              <p className="text-xs text-success">+2.1% ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Réservées cette semaine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI Marketing</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">340%</div>
              <p className="text-xs text-success">Excellent performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics Avancées
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
            <Card>
              <CardHeader>
                <CardTitle>Campagnes Email</CardTitle>
                <CardDescription>
                  Gérez vos séquences email automatisées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Campagnes Email</h3>
                  <p className="text-muted-foreground mb-4">
                    Interface de gestion des campagnes en cours de développement
                  </p>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurer campagnes
                  </Button>
                </div>
              </CardContent>
            </Card>
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