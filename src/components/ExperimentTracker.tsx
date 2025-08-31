import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';

interface ExperimentResult {
  testName: string;
  variant: string;
  conversions: number;
  totalViews: number;
  conversionRate: number;
}

interface ExperimentTrackerProps {
  onRunExperiment?: (testName: string, variants: string[]) => void;
}

export const ExperimentTracker = ({ onRunExperiment }: ExperimentTrackerProps) => {
  const [experiments, setExperiments] = useState<ExperimentResult[]>([]);
  const [activeTests, setActiveTests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const predefinedTests = [
    {
      name: 'landing_cta',
      description: 'Landing page primary CTA button text',
      variants: ['control', 'variant_a', 'variant_b'],
      status: 'active'
    },
    {
      name: 'headline_variant', 
      description: 'Landing page main headline',
      variants: ['control', 'variant_a', 'variant_b'],
      status: 'active'
    },
    {
      name: 'vsl_cta_overlay',
      description: 'VSL video CTA overlay button',
      variants: ['control', 'variant_a', 'variant_b', 'variant_c'],
      status: 'active'
    },
    {
      name: 'quiz_progress_motivation',
      description: 'Quiz question subtitles for completion motivation',
      variants: ['control', 'variant_a'],
      status: 'planned'
    },
    {
      name: 'booking_urgency',
      description: 'Booking page urgency indicators',
      variants: ['control', 'variant_a'],
      status: 'planned'
    }
  ];

  useEffect(() => {
    fetchExperimentData();
  }, []);

  const fetchExperimentData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch A/B test assignments and conversion events
      const { data: events, error } = await supabase
        .from('funnel_events')
        .select('event_type, event_data, created_at')
        .in('event_type', ['quiz_question_answer', 'lp_submit_optin', 'quiz_complete', 'vsl_cta_click', 'bookcall_submit'])
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching experiment data:', error);
        return;
      }

      // Process experiment results
      const testResults = processExperimentResults(events || []);
      setExperiments(testResults);
      
      // Get active test names
      const active = predefinedTests.filter(test => test.status === 'active').map(test => test.name);
      setActiveTests(active);
      
    } catch (error) {
      console.error('Error in fetchExperimentData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processExperimentResults = (events: any[]): ExperimentResult[] => {
    const testAssignments = new Map<string, Map<string, Set<string>>>();
    const conversions = new Map<string, Map<string, number>>();

    // Process events
    events.forEach(event => {
      if (event.event_type === 'quiz_question_answer' && event.event_data?.event_type === 'ab_test_assignment') {
        const { test_name, variant } = event.event_data;
        const session_id = event.event_data?.session_id || 'unknown';
        if (!testAssignments.has(test_name)) {
          testAssignments.set(test_name, new Map());
        }
        if (!testAssignments.get(test_name)!.has(variant)) {
          testAssignments.get(test_name)!.set(variant, new Set());
        }
        testAssignments.get(test_name)!.get(variant)!.add(session_id);
      }
      
      // Track conversions based on test context
      if (['lp_submit_optin', 'quiz_complete', 'vsl_cta_click', 'bookcall_submit'].includes(event.event_type)) {
        const sessionId = event.event_data.session_id;
        if (sessionId) {
          // Map conversion events to relevant tests
          const relevantTests = getRelevantTestsForEvent(event.event_type);
          relevantTests.forEach(testName => {
            if (testAssignments.has(testName)) {
              testAssignments.get(testName)!.forEach((sessions, variant) => {
                if (sessions.has(sessionId)) {
                  if (!conversions.has(testName)) {
                    conversions.set(testName, new Map());
                  }
                  const currentCount = conversions.get(testName)!.get(variant) || 0;
                  conversions.get(testName)!.set(variant, currentCount + 1);
                }
              });
            }
          });
        }
      }
    });

    // Calculate results
    const results: ExperimentResult[] = [];
    testAssignments.forEach((variants, testName) => {
      variants.forEach((sessions, variant) => {
        const totalViews = sessions.size;
        const conversionCount = conversions.get(testName)?.get(variant) || 0;
        const conversionRate = totalViews > 0 ? (conversionCount / totalViews) * 100 : 0;

        results.push({
          testName,
          variant,
          conversions: conversionCount,
          totalViews,
          conversionRate
        });
      });
    });

    return results;
  };

  const getRelevantTestsForEvent = (eventType: string): string[] => {
    const mapping: Record<string, string[]> = {
      'lp_submit_optin': ['landing_cta', 'headline_variant'],
      'quiz_complete': ['quiz_progress_motivation'],
      'vsl_cta_click': ['vsl_cta_overlay'],
      'bookcall_submit': ['booking_urgency']
    };
    return mapping[eventType] || [];
  };

  const getTestData = (testName: string) => {
    return experiments.filter(exp => exp.testName === testName);
  };

  const getBestPerformingVariant = (testName: string) => {
    const testData = getTestData(testName);
    if (testData.length === 0) return null;
    
    return testData.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );
  };

  const runNewExperiment = (testName: string) => {
    const test = predefinedTests.find(t => t.name === testName);
    if (test && onRunExperiment) {
      onRunExperiment(testName, test.variants);
      // Track experiment start as a quiz event for now
      trackEvent('quiz_question_answer', { 
        event_type: 'experiment_started', 
        test_name: testName, 
        variants: test.variants 
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Suivi des Expériences A/B</h3>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Tests Actifs</TabsTrigger>
            <TabsTrigger value="results">Résultats</TabsTrigger>
            <TabsTrigger value="planned">À Venir</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {predefinedTests.filter(test => test.status === 'active').map(test => {
              const testData = getTestData(test.name);
              const bestVariant = getBestPerformingVariant(test.name);
              
              return (
                <Card key={test.name} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{test.description}</h4>
                      <p className="text-sm text-muted-foreground">{test.name}</p>
                    </div>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                  
                  {testData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {testData.map(result => (
                        <div key={result.variant} className="text-center p-3 bg-muted/50 rounded">
                          <div className="font-medium capitalize">{result.variant}</div>
                          <div className="text-2xl font-bold text-primary">
                            {result.conversionRate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.conversions}/{result.totalViews} conversions
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {bestVariant && (
                    <div className="mt-3 p-3 bg-success/10 rounded">
                      <p className="text-sm">
                        🏆 Meilleure performance: <strong>{bestVariant.variant}</strong> ({bestVariant.conversionRate.toFixed(1)}%)
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {activeTests.map(testName => {
              const testData = getTestData(testName);
              if (testData.length === 0) return null;
              
              return (
                <Card key={testName} className="p-4">
                  <h4 className="font-medium mb-4 capitalize">{testName.replace(/_/g, ' ')}</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={testData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="variant" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any, name: string) => [
                            name === 'conversionRate' ? `${value}%` : value,
                            name === 'conversionRate' ? 'Taux de conversion' : 'Vues totales'
                          ]}
                        />
                        <Bar dataKey="conversionRate" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
          
          <TabsContent value="planned" className="space-y-4">
            {predefinedTests.filter(test => test.status === 'planned').map(test => (
              <Card key={test.name} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{test.description}</h4>
                    <p className="text-sm text-muted-foreground">{test.name}</p>
                    <div className="flex gap-2 mt-2">
                      {test.variants.map(variant => (
                        <Badge key={variant} variant="outline" className="text-xs">
                          {variant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => runNewExperiment(test.name)}
                  >
                    Lancer
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};