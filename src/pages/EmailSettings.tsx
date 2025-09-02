import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EmailSystemDemo from '@/components/EmailSystemDemo';
import QuickEmailTest from '@/components/QuickEmailTest';
import { Save, Mail, Settings, TestTube, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmailSettings {
  from_name: string;
  from_email: string;
  reply_to: string;
  default_sequence: string;
  sending_paused: boolean;
  daily_send_limit: number | null;
  test_recipient: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  bounce_handling_enabled: boolean;
  open_tracking_enabled: boolean;
  click_tracking_enabled: boolean;
}

interface DomainStatus {
  isVerified: boolean;
  isResendDomain: boolean;
  needsVerification: boolean;
}

const EmailSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<EmailSettings>({
    from_name: 'One Système',
    from_email: '',
    reply_to: '',
    default_sequence: 'welcome',
    sending_paused: false,
    daily_send_limit: null,
    test_recipient: '',
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'America/Toronto',
    bounce_handling_enabled: true,
    open_tracking_enabled: true,
    click_tracking_enabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const getDomainStatus = (email: string): DomainStatus => {
    if (!email) return { isVerified: false, isResendDomain: false, needsVerification: true };
    
    const isResendDomain = email.includes('@resend.dev');
    const isVerified = isResendDomain || false; // En production, ceci devrait vérifier via l'API Resend
    const needsVerification = !isVerified;
    
    return { isVerified, isResendDomain, needsVerification };
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          from_name: data.from_name || 'One Système',
          from_email: data.from_email || '',
          reply_to: data.reply_to || '',
          default_sequence: data.default_sequence || 'welcome',
          sending_paused: data.sending_paused || false,
          daily_send_limit: data.daily_send_limit,
          test_recipient: data.test_recipient || '',
          quiet_hours_start: data.quiet_hours_start || '22:00',
          quiet_hours_end: data.quiet_hours_end || '08:00',
          timezone: data.timezone || 'America/Toronto',
          bounce_handling_enabled: data.bounce_handling_enabled !== false,
          open_tracking_enabled: data.open_tracking_enabled !== false,
          click_tracking_enabled: data.click_tracking_enabled !== false
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-email-settings', {
        body: { settings }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Succès",
        description: "Paramètres email sauvegardés avec succès"
      });

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.test_recipient) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir un email de test",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);

    try {
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: {
          email: settings.test_recipient
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Test réussi",
          description: `Email de test envoyé à ${settings.test_recipient}`,
        });
      } else {
        throw new Error(data?.error || 'Test failed');
      }

    } catch (error) {
      console.error('Erreur test email:', error);
      toast({
        title: "Erreur de test",
        description: error instanceof Error ? error.message : "Erreur lors du test email",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-gradient-background">
        <div className="container mx-auto container-mobile py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-background">
      <div className="container mx-auto container-mobile py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-responsive-lg font-bold flex items-center">
                <Mail className="h-8 w-8 mr-3" />
                Configuration Email
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez les paramètres d'envoi d'emails automatisés
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={settings.sending_paused ? "destructive" : "default"}>
                {settings.sending_paused ? "Envoi Pausé" : "Actif"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configuration de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Paramètres de Base
              </CardTitle>
              <CardDescription>
                Configuration de l'expéditeur et paramètres généraux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="from_name">Nom de l'expéditeur</Label>
                <Input
                  id="from_name"
                  value={settings.from_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, from_name: e.target.value }))}
                  placeholder="One Système"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="from_email">Email expéditeur *</Label>
                <div className="space-y-2">
                  <Input
                    id="from_email"
                    type="email"
                    value={settings.from_email}
                    onChange={(e) => setSettings(prev => ({ ...prev, from_email: e.target.value }))}
                    placeholder="noreply@onesysteme.ca"
                    required
                  />
                  {settings.from_email && (() => {
                    const status = getDomainStatus(settings.from_email);
                    if (status.isResendDomain) {
                      return (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <Badge variant="outline" className="text-amber-600">Mode Sandbox</Badge>
                          <span>Seuls les emails vérifiés peuvent recevoir vos envois</span>
                        </div>
                      );
                    } else if (status.needsVerification) {
                      return (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <Badge variant="destructive">Domaine non vérifié</Badge>
                          <span>
                            Vérifiez votre domaine sur{' '}
                            <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">
                              resend.com/domains
                            </a>
                          </span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Badge variant="outline" className="text-green-600">Domaine vérifié</Badge>
                          <span>Prêt pour l'envoi</span>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reply_to">Email de réponse</Label>
                <Input
                  id="reply_to"
                  type="email"
                  value={settings.reply_to}
                  onChange={(e) => setSettings(prev => ({ ...prev, reply_to: e.target.value }))}
                  placeholder="contact@onesysteme.ca"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="default_sequence">Séquence par défaut</Label>
                <Select 
                  value={settings.default_sequence} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, default_sequence: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Bienvenue</SelectItem>
                    <SelectItem value="quiz_followup">Suivi Quiz</SelectItem>
                    <SelectItem value="nurture">Maturation</SelectItem>
                    <SelectItem value="booking_reminder">Rappel RDV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres avancés */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Avancés</CardTitle>
              <CardDescription>
                Contrôle du volume et tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Envoi automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer/désactiver l'envoi d'emails
                  </p>
                </div>
                <Switch
                  checked={!settings.sending_paused}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sending_paused: !checked }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="daily_limit">Limite quotidienne (optionnel)</Label>
                <Input
                  id="daily_limit"
                  type="number"
                  value={settings.daily_send_limit || ''}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    daily_send_limit: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  Nombre maximum d'emails envoyés par jour
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quiet_hours">Heures de pause</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="quiet_start" className="text-sm text-muted-foreground">De</Label>
                    <Input
                      id="quiet_start"
                      type="time"
                      value={settings.quiet_hours_start}
                      onChange={(e) => setSettings(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet_end" className="text-sm text-muted-foreground">À</Label>
                    <Input
                      id="quiet_end"
                      type="time"
                      value={settings.quiet_hours_end}
                      onChange={(e) => setSettings(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Aucun email ne sera envoyé pendant ces heures
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Toronto">Toronto (EST/EDT)</SelectItem>
                    <SelectItem value="America/Montreal">Montréal (EST/EDT)</SelectItem>
                    <SelectItem value="America/Vancouver">Vancouver (PST/PDT)</SelectItem>
                    <SelectItem value="America/Edmonton">Edmonton (MST/MDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Suivi et tracking</Label>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Tracking des ouvertures</Label>
                    <p className="text-xs text-muted-foreground">Suivre quand les emails sont ouverts</p>
                  </div>
                  <Switch
                    checked={settings.open_tracking_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, open_tracking_enabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Tracking des clics</Label>
                    <p className="text-xs text-muted-foreground">Suivre les clics sur les liens</p>
                  </div>
                  <Switch
                    checked={settings.click_tracking_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, click_tracking_enabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Gestion des rebonds</Label>
                    <p className="text-xs text-muted-foreground">Gérer automatiquement les emails qui rebondissent</p>
                  </div>
                  <Switch
                    checked={settings.bounce_handling_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, bounce_handling_enabled: checked }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="test_recipient">Email de test</Label>
                <div className="flex gap-2">
                  <Input
                    id="test_recipient"
                    type="email"
                    value={settings.test_recipient}
                    onChange={(e) => setSettings(prev => ({ ...prev, test_recipient: e.target.value }))}
                    placeholder="test@example.com"
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleTestEmail}
                    disabled={isTesting || !settings.test_recipient}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {isTesting ? 'Test...' : 'Test'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Email Test */}
        <div className="mt-6">
          <QuickEmailTest />
        </div>

        {/* Email System Demo */}
        <div className="mt-6">
          <EmailSystemDemo />
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !settings.from_email}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
