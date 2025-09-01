import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send } from 'lucide-react';

const QuickEmailTest = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    leadName: 'Jean Tremblay',
    leadEmail: '',
    segment: 'qualified',
    score: 85
  });

  const handleQuickTest = async () => {
    if (!testData.leadEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir un email pour le test",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Trigger email sequence via edge function
      const { data, error } = await supabase.functions.invoke('enqueue-email-sequence', {
        body: {
          leadId: `test_${Date.now()}`,
          leadName: testData.leadName,
          leadEmail: testData.leadEmail,
          segment: testData.segment,
          quizScore: testData.score
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "✅ Séquence déclenchée !",
          description: `${data.emailsEnqueued} emails programmés pour ${testData.segment} segment`,
        });
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }

    } catch (error) {
      console.error('Erreur lors du test:', error);
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Échec du test email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Test Rapide des Séquences
        </CardTitle>
        <CardDescription>
          Déclenchez une séquence d'emails de conversion pour tester le système
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leadName">Nom du prospect</Label>
            <Input
              id="leadName"
              value={testData.leadName}
              onChange={(e) => setTestData(prev => ({ ...prev, leadName: e.target.value }))}
              placeholder="Jean Tremblay"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadEmail">Email de test</Label>
            <Input
              id="leadEmail"
              type="email"
              value={testData.leadEmail}
              onChange={(e) => setTestData(prev => ({ ...prev, leadEmail: e.target.value }))}
              placeholder="jean@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="segment">Segment de lead</Label>
            <Select value={testData.segment} onValueChange={(value) => setTestData(prev => ({ ...prev, segment: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qualified">🎯 Qualified (Score élevé)</SelectItem>
                <SelectItem value="hot">🔥 Hot (Score moyen-élevé)</SelectItem>
                <SelectItem value="warm">⭐ Warm (Score moyen)</SelectItem>
                <SelectItem value="cold">❄️ Cold (Score bas)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Score du quiz</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={testData.score}
              onChange={(e) => setTestData(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <Button 
          onClick={handleQuickTest} 
          disabled={isLoading || !testData.leadEmail}
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Envoi en cours...' : 'Déclencher la séquence email'}
        </Button>

        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p><strong>💡 Ce test va :</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Créer un lead de test avec les données fournies</li>
            <li>Déclencher la séquence d'emails appropriée au segment</li>
            <li>Envoyer le premier email immédiatement</li>
            <li>Programmer les emails de suivi selon les délais configurés</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickEmailTest;