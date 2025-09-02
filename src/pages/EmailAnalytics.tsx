import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Eye, MousePointer, RefreshCw, Download, Send, Play, AlertCircle, CheckCircle, XCircle, Clock, ExternalLink, Filter, Search, Copy } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EmailAnalyticsChart } from "@/components/EmailAnalyticsChart";

// Enhanced interfaces with new fields
interface EmailLog {
  id: string;
  queue_id?: string;
  recipient_email: string;
  subject: string;
  email_type: string;
  status: string;
  sent_at: string;
  error_message?: string;
  provider_response?: any;
  lead_id?: string;
  lead_name?: string;
  lead_company?: string;
  open_count: number;
  click_count: number;
  first_opened_at?: string;
  last_clicked_at?: string;
  total_count?: number;
}

interface EmailEvent {
  id: string;
  email_id: string;
  action: string;
  timestamp: string;
  event_data?: {
    target_url?: string;
    user_agent?: string;
    ip_address?: string;
  };
}

interface EmailAnalyticsData {
  logs: EmailLog[];
  emailEvents: EmailEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalSent: number;
    totalFailed: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    successRate: number;
    totalEmails: number;
    dailyStats: any[];
  };
}

interface EmailContent {
  html_content: string;
  subject: string;
  email_type: string;
  recipient_email: string;
}

export default function EmailAnalytics() {
  const [data, setData] = useState<EmailAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    status: '',
    email_type: '',
    search: '',
    from: '',
    to: '',
  });
  const { toast } = useToast();

  // Enhanced fetchEmailLogs with POST support and better error handling
  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      
      // Use POST to send filters in body (fixes the bug where filters weren't applied)
      const { data: result, error } = await supabase.functions.invoke('admin-email-logs', {
        body: {
          page: filters.page,
          limit: filters.limit,
          status: filters.status || null,
          email_type: filters.email_type || null,
          search: filters.search || null,
          from: filters.from || null,
          to: filters.to || null,
        }
      });

      if (error) {
        console.error('Error fetching email logs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les logs d'emails",
          variant: "destructive",
        });
        return;
      }

      setData(result);
    } catch (error) {
      console.error('Error in fetchEmailLogs:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du chargement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced email content fetching
  const fetchEmailContent = async (queueId: string) => {
    if (!queueId) {
      toast({
        title: "Erreur",
        description: "ID de queue manquant pour charger le contenu",
        variant: "destructive",
      });
      return;
    }

    try {
      setContentLoading(true);
      
      const { data: content, error } = await supabase.functions.invoke('admin-email-content', {
        method: 'GET',
        body: { queue_id: queueId }
      });

      if (error) {
        console.error('Error fetching email content:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le contenu de l'email",
          variant: "destructive",
        });
        return;
      }

      setEmailContent(content);
    } catch (error) {
      console.error('Error in fetchEmailContent:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du chargement du contenu",
        variant: "destructive",
      });
    } finally {
      setContentLoading(false);
    }
  };

  // Resend email action
  const handleResendEmail = async (queueId: string, recipient: string) => {
    if (!queueId) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer cet email (ID manquant)",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(`resend-${queueId}`);
      
      const { data: result, error } = await supabase.functions.invoke('admin-email-resend', {
        body: { queue_id: queueId }
      });

      if (error) {
        console.error('Error resending email:', error);
        toast({
          title: "Erreur",
          description: "Impossible de renvoyer l'email",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Email programmé",
        description: `Email reprogrammé pour ${recipient}`,
      });

      // Refresh data
      fetchEmailLogs();
    } catch (error) {
      console.error('Error in handleResendEmail:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du renvoi",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Run email queue manually
  const handleRunQueue = async () => {
    try {
      setActionLoading('run-queue');
      
      const { data: result, error } = await supabase.functions.invoke('admin-trigger-queue', {
        body: {}
      });

      if (error) {
        console.error('Error running queue:', error);
        toast({
          title: "Erreur",
          description: "Impossible de lancer la queue d'emails",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Queue lancée",
        description: `Traitement des emails en cours`,
      });

      // Refresh data after a delay
      setTimeout(() => {
        fetchEmailLogs();
      }, 2000);
    } catch (error) {
      console.error('Error in handleRunQueue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!data?.logs || data.logs.length === 0) {
      toast({
        title: "Aucune donnée",
        description: "Aucun email à exporter",
        variant: "destructive",
      });
      return;
    }

    const csvHeaders = [
      'Email',
      'Sujet', 
      'Type',
      'Statut',
      'Date envoi',
      'Lead',
      'Entreprise',
      'Ouvertures',
      'Clics',
      'Première ouverture',
      'Dernier clic'
    ];

    const csvData = data.logs.map(log => [
      log.recipient_email,
      log.subject,
      log.email_type,
      log.status,
      new Date(log.sent_at).toLocaleString('fr-FR'),
      log.lead_name || '',
      log.lead_company || '',
      log.open_count || 0,
      log.click_count || 0,
      log.first_opened_at ? new Date(log.first_opened_at).toLocaleString('fr-FR') : '',
      log.last_clicked_at ? new Date(log.last_clicked_at).toLocaleString('fr-FR') : ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `email-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: `${data.logs.length} emails exportés en CSV`,
    });
  };

  // Copy email to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copié",
        description: `${label} copié dans le presse-papier`,
      });
    });
  };

  // Realtime subscription setup
  useEffect(() => {
    const channel = supabase
      .channel('email_analytics_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_delivery_logs'
        },
        () => {
          console.log('New email delivery detected, refreshing...');
          fetchEmailLogs();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_events'
        },
        () => {
          console.log('New email event detected, refreshing...');
          fetchEmailLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchEmailLogs();
  }, [filters]);

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'default',
      failed: 'destructive',
      pending: 'secondary',
      skipped: 'outline'
    } as const;

    const icons = {
      sent: CheckCircle,
      failed: XCircle,
      pending: Clock,
      skipped: AlertCircle
    };

    const Icon = icons[status as keyof typeof icons] || Clock;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getEmailEvents = (queueId: string) => {
    return data?.emailEvents?.filter(event => event.email_id === queueId) || [];
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      status: '',
      email_type: '',
      search: '',
      from: '',
      to: '',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Il y a moins d\'1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="text-lg">Chargement des analytics emails...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Emails</h1>
            <p className="text-muted-foreground">
              Analyse complète de tous les emails envoyés • Temps réel activé
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportCSV} variant="outline" disabled={!data?.logs?.length}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={handleRunQueue} 
              variant="outline"
              disabled={actionLoading === 'run-queue'}
            >
              {actionLoading === 'run-queue' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Lancer Queue
            </Button>
            <Button onClick={fetchEmailLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{data.stats.totalSent}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
                <Eye className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{data.stats.totalOpened}</div>
                <p className="text-xs text-muted-foreground">
                  {data.stats.openRate}% taux d'ouverture
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cliqués</CardTitle>
                <MousePointer className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{data.stats.totalClicked}</div>
                <p className="text-xs text-muted-foreground">
                  {data.stats.clickRate}% taux de clic
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Échecs</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{data.stats.totalFailed}</div>
                <p className="text-xs text-muted-foreground">
                  {data.stats.bounceRate}% taux d'échec
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Succès</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.successRate}%</div>
                <p className="text-xs text-muted-foreground">Taux de succès</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalEmails}</div>
                <p className="text-xs text-muted-foreground">30 derniers jours</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        {data?.stats?.dailyStats && data.stats.dailyStats.length > 0 && (
          <EmailAnalyticsChart dailyStats={data.stats.dailyStats} stats={data.stats} />
        )}

        {/* Enhanced Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres avancés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par email ou sujet..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="pl-9"
                />
              </div>

              <Select value={filters.status || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="skipped">Ignoré</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.email_type || "all-types"} onValueChange={(value) => setFilters(prev => ({ ...prev, email_type: value === "all-types" ? "" : value, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">Tous les types</SelectItem>
                  <SelectItem value="welcome">Bienvenue</SelectItem>
                  <SelectItem value="quiz_confirmation">Confirmation Quiz</SelectItem>
                  <SelectItem value="nurture">Nurture</SelectItem>
                  <SelectItem value="booking_reminder">Rappel RDV</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <Input
                  type="date"
                  placeholder="Date début"
                  value={filters.from}
                  onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value, page: 1 }))}
                />
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="Date fin"
                  value={filters.to}
                  onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value, page: 1 }))}
                />
              </div>

              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Email Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des Emails ({data?.pagination?.total || 0} résultats)</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.logs && data.logs.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Destinataire</TableHead>
                        <TableHead>Sujet</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Engagements</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.logs.map((log) => {
                        const events = getEmailEvents(log.queue_id || log.id);
                        const opened = log.open_count > 0;
                        const clicked = log.click_count > 0;

                        return (
                          <TableRow key={log.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{log.recipient_email}</div>
                                {log.lead_name && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    {log.lead_name}
                                    {log.lead_company && ` • ${log.lead_company}`}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="truncate font-medium">{log.subject}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.email_type}</Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(log.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {opened && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Eye className="h-4 w-4" />
                                    <span className="text-sm">{log.open_count}</span>
                                  </div>
                                )}
                                {clicked && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <MousePointer className="h-4 w-4" />
                                    <span className="text-sm">{log.click_count}</span>
                                  </div>
                                )}
                                {!opened && !clicked && (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              <div>{formatTimeAgo(log.sent_at)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => {
                                        setSelectedEmail(log);
                                        if (log.queue_id) {
                                          fetchEmailContent(log.queue_id);
                                        }
                                      }}
                                    >
                                      Détails
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Détails de l'Email</DialogTitle>
                                      <DialogDescription>
                                        Email envoyé à {selectedEmail?.recipient_email}
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedEmail && (
                                      <Tabs defaultValue="details" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4">
                                          <TabsTrigger value="details">Informations</TabsTrigger>
                                          <TabsTrigger value="events">Événements ({events.length})</TabsTrigger>
                                          <TabsTrigger value="preview">Aperçu</TabsTrigger>
                                          <TabsTrigger value="provider">Provider</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="details" className="space-y-4 mt-6">
                                          <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                              <div>
                                                <Label className="text-sm font-medium">Destinataire</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <span>{selectedEmail.recipient_email}</span>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(selectedEmail.recipient_email, "Email")}
                                                  >
                                                    <Copy className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                              <div>
                                                <Label className="text-sm font-medium">Sujet</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <span>{selectedEmail.subject}</span>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(selectedEmail.subject, "Sujet")}
                                                  >
                                                    <Copy className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                              <div>
                                                <Label className="text-sm font-medium">Type</Label>
                                                <p className="mt-1">{selectedEmail.email_type}</p>
                                              </div>
                                              <div>
                                                <Label className="text-sm font-medium">Statut</Label>
                                                <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                                              </div>
                                            </div>
                                            <div className="space-y-4">
                                              <div>
                                                <Label className="text-sm font-medium">Envoyé le</Label>
                                                <p className="mt-1">{new Date(selectedEmail.sent_at).toLocaleString('fr-FR')}</p>
                                              </div>
                                              <div>
                                                <Label className="text-sm font-medium">Ouvertures</Label>
                                                <p className="mt-1">{selectedEmail.open_count || 0}</p>
                                                {selectedEmail.first_opened_at && (
                                                  <p className="text-xs text-muted-foreground">
                                                    Première: {new Date(selectedEmail.first_opened_at).toLocaleString('fr-FR')}
                                                  </p>
                                                )}
                                              </div>
                                              <div>
                                                <Label className="text-sm font-medium">Clics</Label>
                                                <p className="mt-1">{selectedEmail.click_count || 0}</p>
                                                {selectedEmail.last_clicked_at && (
                                                  <p className="text-xs text-muted-foreground">
                                                    Dernier: {new Date(selectedEmail.last_clicked_at).toLocaleString('fr-FR')}
                                                  </p>
                                                )}
                                              </div>
                                              {selectedEmail.queue_id && (
                                                <div>
                                                  <Button
                                                    onClick={() => handleResendEmail(selectedEmail.queue_id!, selectedEmail.recipient_email)}
                                                    disabled={actionLoading === `resend-${selectedEmail.queue_id}`}
                                                    size="sm"
                                                  >
                                                    {actionLoading === `resend-${selectedEmail.queue_id}` ? (
                                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    ) : (
                                                      <Send className="h-4 w-4 mr-2" />
                                                    )}
                                                    Renvoyer
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          {selectedEmail.error_message && (
                                            <div>
                                              <Label className="text-sm font-medium text-destructive">Message d'erreur</Label>
                                              <div className="mt-1 p-3 bg-destructive/10 rounded-md">
                                                <code className="text-sm">{selectedEmail.error_message}</code>
                                              </div>
                                            </div>
                                          )}
                                        </TabsContent>
                                        
                                        <TabsContent value="events" className="mt-6">
                                          <div className="space-y-3">
                                            {events.length > 0 ? (
                                              events.map((event, index) => (
                                                <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                  <div className="flex items-center gap-3">
                                                    {event.action === 'opened' && <Eye className="h-4 w-4 text-blue-500" />}
                                                    {event.action === 'clicked' && <MousePointer className="h-4 w-4 text-green-500" />}
                                                    <div>
                                                      <span className="capitalize font-medium">{event.action}</span>
                                                      {event.event_data?.target_url && (
                                                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                          <ExternalLink className="h-3 w-3" />
                                                          <a 
                                                            href={event.event_data.target_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="hover:underline truncate max-w-md"
                                                          >
                                                            {event.event_data.target_url}
                                                          </a>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="text-right">
                                                    <div className="text-sm font-medium">
                                                      {formatTimeAgo(event.timestamp)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                      {new Date(event.timestamp).toLocaleString('fr-FR')}
                                                    </div>
                                                  </div>
                                                </div>
                                              ))
                                            ) : (
                                              <div className="text-center py-8 text-muted-foreground">
                                                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p>Aucun événement enregistré</p>
                                                <p className="text-sm">L'email n'a pas encore été ouvert ou cliqué</p>
                                              </div>
                                            )}
                                          </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="preview" className="mt-6">
                                          {contentLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                                              <span>Chargement du contenu...</span>
                                            </div>
                                          ) : emailContent ? (
                                            <div className="space-y-4">
                                              <div className="border rounded-lg p-4 bg-background">
                                                <div className="text-sm text-muted-foreground mb-2">Aperçu de l'email:</div>
                                                <div 
                                                  className="prose prose-sm max-w-none"
                                                  dangerouslySetInnerHTML={{ __html: emailContent.html_content }}
                                                />
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                              <p>Contenu de l'email non disponible</p>
                                              <p className="text-sm">Le contenu n'a pas pu être chargé depuis la queue</p>
                                            </div>
                                          )}
                                        </TabsContent>
                                        
                                        <TabsContent value="provider" className="mt-6">
                                          {selectedEmail.provider_response ? (
                                            <div className="space-y-4">
                                              <div>
                                                <Label className="text-sm font-medium">Réponse du fournisseur</Label>
                                                <div className="mt-2 p-4 bg-muted rounded-lg">
                                                  <pre className="text-sm overflow-x-auto">
                                                    {JSON.stringify(selectedEmail.provider_response, null, 2)}
                                                  </pre>
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                              <p>Aucune réponse du fournisseur disponible</p>
                                            </div>
                                          )}
                                        </TabsContent>
                                      </Tabs>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Enhanced Pagination */}
                {data.pagination && data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {data.pagination.page} sur {data.pagination.totalPages} 
                      ({data.pagination.total} résultats)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.pagination.page <= 1}
                        onClick={() => handlePageChange(data.pagination.page - 1)}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.pagination.page >= data.pagination.totalPages}
                        onClick={() => handlePageChange(data.pagination.page + 1)}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun email trouvé</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.status || filters.email_type || filters.from || filters.to
                    ? "Aucun email ne correspond aux filtres actuels"
                    : "Aucun email n'a encore été envoyé"}
                </p>
                {(filters.search || filters.status || filters.email_type || filters.from || filters.to) && (
                  <Button variant="outline" onClick={resetFilters} className="mt-4">
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}