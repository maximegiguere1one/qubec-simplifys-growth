import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/integrations/supabase/client'
import { Mail, Clock, CheckCircle, XCircle, Eye, MousePointer, RefreshCw, Filter, Search } from 'lucide-react'
import { toast } from 'sonner'

interface EmailLog {
  id: string
  recipient_email: string
  subject: string
  email_type: string
  status: string
  sent_at: string
  error_message?: string
  leads?: {
    id: string
    name: string
    email: string
    company?: string
  }
}

interface EmailEvent {
  id: string
  email_id: string
  action: string
  timestamp: string
}

interface EmailAnalyticsData {
  logs: EmailLog[]
  emailEvents: EmailEvent[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    totalSent: number
    totalFailed: number
    successRate: number
    totalEmails: number
  }
}

export default function EmailAnalytics() {
  const [data, setData] = useState<EmailAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    status: '',
    email_type: '',
    search: ''
  })

  const fetchEmailLogs = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })

      const { data: response, error } = await supabase.functions.invoke('admin-email-logs', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (error) throw error

      setData(response)
    } catch (error) {
      console.error('Error fetching email logs:', error)
      toast.error('Erreur lors du chargement des logs emails')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmailLogs()
  }, [filters])

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'default',
      failed: 'destructive',
      pending: 'secondary'
    } as const

    const icons = {
      sent: CheckCircle,
      failed: XCircle,
      pending: Clock
    }

    const Icon = icons[status as keyof typeof icons] || Clock

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getEmailEvents = (emailId: string) => {
    return data?.emailEvents?.filter(event => event.email_id === emailId) || []
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      status: '',
      email_type: '',
      search: ''
    })
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement des analytics emails...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Emails</h1>
            <p className="text-muted-foreground">Analyse complète de tous les emails envoyés</p>
          </div>
          <Button onClick={fetchEmailLogs} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Stats Cards */}
        {data?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Envoyés</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{data.stats.totalSent}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Échoués</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{data.stats.totalFailed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.successRate}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total (30j)</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalEmails}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par email ou sujet..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="pl-9"
                />
              </div>

              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.email_type} onValueChange={(value) => setFilters(prev => ({ ...prev, email_type: value, page: 1 }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  <SelectItem value="welcome">Bienvenue</SelectItem>
                  <SelectItem value="quiz_confirmation">Confirmation Quiz</SelectItem>
                  <SelectItem value="nurture">Nurture</SelectItem>
                  <SelectItem value="booking_reminder">Rappel RDV</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des Emails</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.logs && data.logs.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Destinataire</th>
                        <th className="text-left p-2">Sujet</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Statut</th>
                        <th className="text-left p-2">Envoyé le</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.logs.map((log) => {
                        const events = getEmailEvents(log.id)
                        const opened = events.some(e => e.action === 'opened')
                        const clicked = events.some(e => e.action === 'clicked')

                        return (
                          <tr key={log.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{log.recipient_email}</div>
                                {log.leads?.name && (
                                  <div className="text-sm text-muted-foreground">{log.leads.name}</div>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="max-w-xs truncate">{log.subject}</div>
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">{log.email_type}</Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(log.status)}
                                {opened && <Eye className="h-4 w-4 text-blue-500" title="Ouvert" />}
                                {clicked && <MousePointer className="h-4 w-4 text-green-500" title="Cliqué" />}
                              </div>
                            </td>
                            <td className="p-2 text-sm text-muted-foreground">
                              {new Date(log.sent_at).toLocaleString('fr-FR')}
                            </td>
                            <td className="p-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedEmail(log)}>
                                    Détails
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Détails de l'Email</DialogTitle>
                                  </DialogHeader>
                                  {selectedEmail && (
                                    <Tabs defaultValue="details">
                                      <TabsList>
                                        <TabsTrigger value="details">Informations</TabsTrigger>
                                        <TabsTrigger value="events">Événements</TabsTrigger>
                                      </TabsList>
                                      
                                      <TabsContent value="details" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium">Destinataire:</label>
                                            <p>{selectedEmail.recipient_email}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Sujet:</label>
                                            <p>{selectedEmail.subject}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Type:</label>
                                            <p>{selectedEmail.email_type}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Statut:</label>
                                            <p>{getStatusBadge(selectedEmail.status)}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Envoyé le:</label>
                                            <p>{new Date(selectedEmail.sent_at).toLocaleString('fr-FR')}</p>
                                          </div>
                                          {selectedEmail.error_message && (
                                            <div className="col-span-2">
                                              <label className="text-sm font-medium text-destructive">Erreur:</label>
                                              <p className="text-sm bg-destructive/10 p-2 rounded">{selectedEmail.error_message}</p>
                                            </div>
                                          )}
                                        </div>
                                      </TabsContent>
                                      
                                      <TabsContent value="events">
                                        <div className="space-y-2">
                                          {getEmailEvents(selectedEmail.id).length > 0 ? (
                                            getEmailEvents(selectedEmail.id).map((event) => (
                                              <div key={event.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                                <span className="capitalize">{event.action}</span>
                                                <span className="text-sm text-muted-foreground">
                                                  {new Date(event.timestamp).toLocaleString('fr-FR')}
                                                </span>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-muted-foreground">Aucun événement enregistré</p>
                                          )}
                                        </div>
                                      </TabsContent>
                                    </Tabs>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
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
              <div className="text-center py-8 text-muted-foreground">
                Aucun email trouvé avec les filtres actuels
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}