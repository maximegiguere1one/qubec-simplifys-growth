import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Users, Filter, TrendingUp, Mail, Phone, Building, Calendar, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  score: number;
  segment: 'cold' | 'warm' | 'hot' | 'qualified';
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
  updated_at: string;
}

interface LeadDetails extends Lead {
  quizSessions: any[];
  bookings: any[];
  events: any[];
}

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const segmentColors = {
  cold: 'bg-muted text-muted-foreground',
  warm: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  hot: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export const LeadsManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filters, setFilters] = useState({
    segment: '',
    source: '',
    search: '',
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-leads', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: new URLSearchParams({
          ...(filters.segment && { segment: filters.segment }),
          ...(filters.source && { source: filters.source }),
          ...(filters.search && { search: filters.search }),
          page: filters.page.toString(),
          limit: filters.limit.toString(),
        }).toString(),
      });

      if (error) {
        throw error;
      }

      const response = data as LeadsResponse;
      setLeads(response.leads || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les leads. Vérifiez votre accès administrateur.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadDetails = async (leadId: string) => {
    try {
      setLoadingDetails(true);
      const { data, error } = await supabase.functions.invoke('admin-leads', {
        method: 'POST',
        body: JSON.stringify({
          action: 'getDetails',
          leadId,
        }),
      });

      if (error) {
        throw error;
      }

      setSelectedLead(data as LeadDetails);
    } catch (error) {
      console.error('Error fetching lead details:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails du lead.',
        variant: 'destructive',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateLeadScore = async (leadId: string, score: number, segment: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-leads', {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateScore',
          leadId,
          data: { score, segment },
        }),
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Succès',
        description: 'Score du lead mis à jour.',
      });

      // Refresh the leads list
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead score:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le score.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreStars = (score: number) => {
    const stars = Math.round(score / 20); // Convert to 5-star scale
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < stars ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
      />
    ));
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === 'all' ? '' : value;
    setFilters(prev => ({
      ...prev,
      [key]: actualValue,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (loading && leads.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Gestion des Leads</h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Gestion des Leads</h2>
          <Badge variant="secondary">{pagination.total} leads</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un lead..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.segment || 'all'} onValueChange={(value) => handleFilterChange('segment', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les segments</SelectItem>
              <SelectItem value="qualified">Qualifiés</SelectItem>
              <SelectItem value="hot">Chauds</SelectItem>
              <SelectItem value="warm">Tièdes</SelectItem>
              <SelectItem value="cold">Froids</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.source || 'all'} onValueChange={(value) => handleFilterChange('source', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              <SelectItem value="landing_page">Landing Page</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="vsl">VSL</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setFilters({ segment: '', source: '', search: '', page: 1, limit: 50 })}
          >
            <Filter className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </Card>

      {/* Leads Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-4 font-medium">Lead</th>
                <th className="p-4 font-medium">Segment</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Créé le</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                        <Mail className="w-3 h-3" />
                        <span>{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.company && (
                        <div className="text-sm text-muted-foreground flex items-center space-x-2">
                          <Building className="w-3 h-3" />
                          <span>{lead.company}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={segmentColors[lead.segment]}>
                      {lead.segment}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{lead.score}/100</span>
                      <div className="flex">{getScoreStars(lead.score)}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{lead.source || 'unknown'}</span>
                    {lead.utm_source && (
                      <div className="text-xs text-muted-foreground">
                        UTM: {lead.utm_source}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(lead.created_at)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchLeadDetails(lead.id)}
                        >
                          Voir détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Détails du Lead - {lead.name}</DialogTitle>
                        </DialogHeader>
                        {loadingDetails ? (
                          <div className="text-center py-8">
                            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
                          </div>
                        ) : selectedLead ? (
                          <div className="space-y-6">
                            {/* Lead Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Informations personnelles</h4>
                                <p><strong>Email:</strong> {selectedLead.email}</p>
                                <p><strong>Téléphone:</strong> {selectedLead.phone || 'N/A'}</p>
                                <p><strong>Entreprise:</strong> {selectedLead.company || 'N/A'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Scoring</h4>
                                <p><strong>Score:</strong> {selectedLead.score}/100</p>
                                <p><strong>Segment:</strong> <Badge className={segmentColors[selectedLead.segment]}>{selectedLead.segment}</Badge></p>
                                <p><strong>Source:</strong> {selectedLead.source}</p>
                              </div>
                            </div>

                            {/* Quiz Sessions */}
                            {selectedLead.quizSessions.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Sessions Quiz ({selectedLead.quizSessions.length})</h4>
                                <div className="space-y-2">
                                  {selectedLead.quizSessions.map((session: any) => (
                                    <div key={session.id} className="p-3 border rounded">
                                      <p><strong>Status:</strong> {session.status}</p>
                                      <p><strong>Score:</strong> {session.total_score || 'N/A'}</p>
                                      <p><strong>Date:</strong> {formatDate(session.started_at)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Bookings */}
                            {selectedLead.bookings.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Réservations ({selectedLead.bookings.length})</h4>
                                <div className="space-y-2">
                                  {selectedLead.bookings.map((booking: any) => (
                                    <div key={booking.id} className="p-3 border rounded">
                                      <p><strong>Date:</strong> {booking.selected_date} à {booking.selected_time}</p>
                                      <p><strong>Status:</strong> {booking.status}</p>
                                      <p><strong>Créé:</strong> {formatDate(booking.created_at)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} leads
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};