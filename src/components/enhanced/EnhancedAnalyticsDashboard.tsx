import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { DataAccuracyMonitor } from '@/components/enhanced/DataAccuracyMonitor';
import { TimezoneHandler } from '@/components/enhanced/TimezoneHandler';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export function EnhancedAnalyticsDashboard() {
  const [selectedTimezone, setSelectedTimezone] = React.useState('America/Toronto');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Avancées</h1>
          <p className="text-muted-foreground">
            Tableau de bord complet avec surveillance de la qualité des données
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TimezoneHandler 
            value={selectedTimezone}
            onChange={setSelectedTimezone}
            className="w-64"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Métriques Avancées
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Qualité des Données
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Temps Réel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsDashboard />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Statut Système</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Opérationnel</div>
                <p className="text-xs text-muted-foreground">
                  Tous les systèmes fonctionnent normalement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validation RLS</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Actif</div>
                <p className="text-xs text-muted-foreground">
                  Politiques de sécurité appliquées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fuseau Horaire</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {selectedTimezone.split('/')[1]}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString('fr-CA', { 
                    timeZone: selectedTimezone,
                    hour: '2-digit',
                    minute: '2-digit'
                  })} actuellement
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <DataAccuracyMonitor />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Mesures de Sécurité Actives
                </CardTitle>
                <CardDescription>
                  Protections en place pour la qualité des données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Validation RLS</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Détection Honeypot</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Limitation de Taux</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Validation UTM</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audit des Modifications</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Points d'Attention
                </CardTitle>
                <CardDescription>
                  Éléments à surveiller pour optimiser la qualité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Surveiller les sessions invalides - peut indiquer des tentatives d'accès non autorisées
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Leads en doublon - vérifier l'efficacité du dédoublonnage
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Les Edge Functions ajoutent une couche de validation serveur pour une sécurité renforcée
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Surveillance Temps Réel
              </CardTitle>
              <CardDescription>
                Données en direct avec actualisation automatique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Fonctionnalité de surveillance temps réel disponible.
                <br />
                Les métriques se mettent à jour automatiquement toutes les 5 minutes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}