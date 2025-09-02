import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { enqueueEmailSequence, getEmailQueueStatus, type LeadData } from '@/lib/emailQueue';
import { Mail, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const EmailSystemDemo = () => {
  const { toast } = useToast();
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueueStatus = async () => {
    const status = await getEmailQueueStatus();
    setQueueStatus(status);
  };

  const handleTestSequence = async () => {
    setIsLoading(true);
    
    // Demo lead data
    const testLead: LeadData = {
      id: 'demo-lead-' + Date.now(),
      name: 'Demo User',
      email: 'demo@example.com', // In production, use real email
      segment: 'warm',
      score: 75,
      industry: 'Technology',
      business_size: 'PME',
      company: 'Demo Company'
    };

    try {
      const success = await enqueueEmailSequence(testLead, 'quiz_complete');
      
      if (success) {
        toast({
          title: "Séquence déclenchée",
          description: `Séquence d'emails mise en file pour ${testLead.email}`,
        });
        await fetchQueueStatus();
      } else {
        throw new Error('Failed to enqueue sequence');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de déclencher la séquence d'emails",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue');
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "File traitée",
        description: "Traitement de la file d'emails déclenché",
      });
      
      // Refresh status after processing
      setTimeout(fetchQueueStatus, 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la file d'emails",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Système d'Email Automatisé
          </CardTitle>
          <CardDescription>
            Système complet de gestion d'emails avec séquences personnalisées, tracking et conformité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-2xl font-bold">{queueStatus?.pending || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-2xl font-bold">{queueStatus?.sent || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Envoyés</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-2xl font-bold">{queueStatus?.failed || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Échecs</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-2xl font-bold">{queueStatus?.total || 0}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total 24h</p>
            </div>
          </div>

          {queueStatus && queueStatus.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taux de succès</span>
                <span>{Math.round((queueStatus.sent / queueStatus.total) * 100)}%</span>
              </div>
              <Progress value={(queueStatus.sent / queueStatus.total) * 100} className="h-2" />
            </div>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">✅ Fonctionnalités Implémentées</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Séquences d'emails par segment (qualified, hot, warm, cold)</li>
                <li>• Tracking des ouvertures et clics</li>
                <li>• Heures de pause configurables</li>
                <li>• Limite quotidienne d'envoi</li>
                <li>• Retry avec backoff exponentiel</li>
                <li>• Désabonnement automatique</li>
                <li>• Personnalisation avancée</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">⚙️ Configuration Automatique</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Cron job: traitement toutes les 5 minutes</li>
                <li>• Nettoyage quotidien à 2h du matin</li>
                <li>• Respect des fuseaux horaires québécois</li>
                <li>• Conformité RGPD/Loi 25</li>
                <li>• Gestion des rebonds Resend</li>
                <li>• Liens trackés avec tokens signés</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleTestSequence}
              disabled={isLoading}
              className="flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Déclenchement...' : 'Tester une Séquence'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleProcessQueue}
              disabled={isLoading}
              className="flex items-center"
            >
              <Clock className="h-4 w-4 mr-2" />
              Traiter la file maintenant
            </Button>
            
            <Button 
              variant="outline"
              onClick={fetchQueueStatus}
              className="flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Actualiser Status
            </Button>
          </div>

          {/* Integration Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium">🚀 Comment utiliser le système :</h4>
            <div className="text-sm space-y-2">
              <div>
                <strong>1. Déclencher une séquence :</strong>
                <code className="block bg-background p-2 rounded mt-1 text-xs">
                  {`await enqueueEmailSequence(leadData, 'quiz_complete')`}
                </code>
              </div>
              <div>
                <strong>2. Envoyer un email individuel :</strong>
                <code className="block bg-background p-2 rounded mt-1 text-xs">
                  {`await enqueueEmail({ recipientEmail, subject, htmlContent, emailType })`}
                </code>
              </div>
              <div>
                <strong>3. Configuration :</strong> Utilisez la page <Badge variant="outline">Email Settings</Badge> pour configurer l'expéditeur, heures de pause, tracking, etc.
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSystemDemo;