import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle, XCircle, Clock } from "lucide-react";

interface TestResult {
  success: boolean;
  message: string;
  tests?: {
    resend_configured: boolean;
    supabase_connected: boolean;
    email_sent: boolean;
    database_logged: boolean;
    stats_working: boolean;
  };
  email_id?: string;
  recipient?: string;
  stats?: {
    total_sent: number;
    total_failed: number;
    success_rate: number;
    last_successful_send: string;
  };
  error?: string;
}

export const EmailDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [results, setResults] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const runEmailTest = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer une adresse email pour le test.",
        variant: "destructive",
      });
      return;
    }

    // Validation basique d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setResults(null);

    try {
      console.log('🧪 Starting email system test...');
      
      const response = await supabase.functions.invoke('test-email', {
        body: { email: testEmail }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data as TestResult;
      setResults(result);

      if (result.success) {
        toast({
          title: "✅ Test réussi !",
          description: `Email de test envoyé à ${testEmail}`,
        });
      } else {
        toast({
          title: "❌ Test échoué",
          description: result.error || "Erreur inconnue",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Email test failed:', error);
      setResults({
        success: false,
        message: "Test échoué",
        error: error.message
      });
      
      toast({
        title: "❌ Erreur de test",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getTestIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Mail className="h-6 w-6" />
            Diagnostic Email Système
          </h2>
          <p className="text-muted-foreground">
            Testez le bon fonctionnement de l'envoi d'emails
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="test-email" className="block text-sm font-medium mb-2">
              Email de test
            </label>
            <Input
              id="test-email"
              type="email"
              placeholder="votre@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={isRunning}
              className="w-full"
            />
          </div>

          <Button 
            onClick={runEmailTest} 
            disabled={isRunning || !testEmail.trim()}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Lancer le test
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={results.success ? "default" : "destructive"}>
                {results.success ? "✅ SUCCÈS" : "❌ ÉCHEC"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {results.message}
              </span>
            </div>

            {results.tests && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Détails des tests :</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getTestIcon(results.tests.resend_configured)}
                    <span>Configuration Resend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTestIcon(results.tests.supabase_connected)}
                    <span>Connexion Supabase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTestIcon(results.tests.email_sent)}
                    <span>Envoi d'email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTestIcon(results.tests.database_logged)}
                    <span>Logging base de données</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTestIcon(results.tests.stats_working)}
                    <span>Statistiques email</span>
                  </div>
                </div>
              </div>
            )}

            {results.email_id && (
              <div className="text-xs text-muted-foreground">
                <p><strong>ID Email:</strong> {results.email_id}</p>
                <p><strong>Destinataire:</strong> {results.recipient}</p>
              </div>
            )}

            {results.stats && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <h4 className="font-semibold mb-2">📊 Statistiques récentes :</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>Emails envoyés: {results.stats.total_sent}</div>
                  <div>Emails échoués: {results.stats.total_failed}</div>
                  <div>Taux de succès: {results.stats.success_rate}%</div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Dernier envoi: {results.stats.last_successful_send ? 
                      new Date(results.stats.last_successful_send).toLocaleString('fr-CA') : 
                      'Aucun'
                    }
                  </div>
                </div>
              </div>
            )}

            {results.error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm text-red-700">
                <strong>Erreur:</strong> {results.error}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          ⚠️ Ce test utilise de vrais services d'email. L'email sera réellement envoyé.
        </div>
      </div>
    </Card>
  );
};