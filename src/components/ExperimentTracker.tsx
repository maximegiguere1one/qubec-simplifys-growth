
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, 
  TrendingUp, 
  Activity,
  BarChart3,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';

interface ExperimentResult {
  test_name: string;
  variant: string;
  total_views: number;
  conversions: number;
  conversion_rate: number;
}

export const ExperimentTracker = () => {
  const [experiments, setExperiments] = useState<ExperimentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    fetchExperiments();
  }, [daysBack]);

  const fetchExperiments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_experiment_results', { days_back: daysBack });

      if (error) throw error;

      setExperiments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des expériences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Grouper par test_name
  const groupedExperiments = experiments.reduce((acc, exp) => {
    if (!acc[exp.test_name]) {
      acc[exp.test_name] = [];
    }
    acc[exp.test_name].push(exp);
    return acc;
  }, {} as Record<string, ExperimentResult[]>);

  const getTestDescription = (testName: string) => {
    const descriptions: Record<string, string> = {
      'landing_cta': 'Test du bouton principal sur la landing page',
      'headline_variant': 'Test des variantes du titre principal',
      'quiz_progress_motivation': 'Test de motivation sur la progression du quiz',
      'vsl_cta_overlay': 'Test de l\'overlay CTA sur la VSL',
      'booking_urgency': 'Test d\'urgence sur la page de réservation'
    };
    return descriptions[testName] || 'Test A/B personnalisé';
  };

  const getWinningVariant = (variants: ExperimentResult[]) => {
    if (variants.length < 2) return null;
    return variants.reduce((winner, current) => 
      current.conversion_rate > winner.conversion_rate ? current : winner
    );
  };

  const getStatisticalSignificance = (variantA: ExperimentResult, variantB: ExperimentResult) => {
    // Calcul simple de significativité (pour demo, dans la réalité utiliser un vrai test statistique)
    const totalViews = variantA.total_views + variantB.total_views;
    if (totalViews < 100) return 'Données insuffisantes';
    
    const diff = Math.abs(variantA.conversion_rate - variantB.conversion_rate);
    if (diff > 2) return 'Significatif';
    if (diff > 1) return 'Tendance';
    return 'Non significatif';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tests A/B</h2>
          <p className="text-muted-foreground">
            Suivi des expériences en cours et résultats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={daysBack} 
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
          </select>
          <Button onClick={fetchExperiments} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {Object.keys(groupedExperiments).length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Aucun test A/B actif
            </CardTitle>
            <CardDescription>
              Lancez vos premiers tests pour optimiser vos conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Commencer les tests A/B</h3>
              <p className="text-muted-foreground mb-4">
                Les tests A/B vous aident à optimiser chaque étape de votre funnel de conversion
              </p>
              <div className="grid gap-2 text-sm text-left max-w-md mx-auto">
                <p>• Test de titres et messages</p>
                <p>• Optimisation des boutons CTA</p>
                <p>• Amélioration du parcours utilisateur</p>
                <p>• Validation statistique des changements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExperiments).map(([testName, variants]) => {
            const winner = getWinningVariant(variants);
            const hasMultipleVariants = variants.length >= 2;
            const significance = hasMultipleVariants ? 
              getStatisticalSignificance(variants[0], variants[1]) : 'N/A';
            
            return (
              <Card key={testName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        {testName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </CardTitle>
                      <CardDescription>
                        {getTestDescription(testName)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hasMultipleVariants ? "default" : "secondary"}>
                        {hasMultipleVariants ? "Actif" : "En préparation"}
                      </Badge>
                      {winner && (
                        <Badge variant="outline" className="text-success border-success">
                          {significance}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div 
                        key={variant.variant}
                        className={`p-4 border rounded-lg ${
                          winner?.variant === variant.variant ? 'bg-green-50 border-green-200' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Variante {variant.variant.toUpperCase()}
                            </span>
                            {winner?.variant === variant.variant && (
                              <Badge variant="default" className="bg-success text-white">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Gagnant
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {variant.total_views} vues
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Conversions</div>
                            <div className="font-semibold">{variant.conversions}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Taux de conversion</div>
                            <div className={`font-semibold ${
                              winner?.variant === variant.variant ? 'text-success' : ''
                            }`}>
                              {variant.conversion_rate.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Amélioration</div>
                            <div className="font-semibold">
                              {hasMultipleVariants && variants[0] ? 
                                `${((variant.conversion_rate - variants[0].conversion_rate) / variants[0].conversion_rate * 100).toFixed(1)}%` 
                                : 'Baseline'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations de Tests</CardTitle>
          <CardDescription>
            Prochains tests A/B suggérés pour optimiser vos conversions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Play className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">Landing Page Headline</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Testez différents messages de valeur pour améliorer la capture de leads
              </p>
              <Button size="sm" variant="outline">
                Configurer le test
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Play className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">VSL Call-to-Action</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Optimisez le placement et le texte du CTA sur votre VSL
              </p>
              <Button size="sm" variant="outline">
                Configurer le test
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Pause className="h-4 w-4 mr-2 text-orange-600" />
                <span className="font-medium">Quiz Flow</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Testez l'ordre des questions pour améliorer le taux de completion
              </p>
              <Button size="sm" variant="outline">
                Configurer le test
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                <span className="font-medium">Booking Page</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Ajoutez de l'urgence ou des témoignages sur la page de réservation
              </p>
              <Button size="sm" variant="outline">
                Configurer le test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
