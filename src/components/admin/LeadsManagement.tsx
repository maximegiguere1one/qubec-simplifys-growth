import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Star, 
  User, 
  Calendar, 
  Tag, 
  MessageSquare, 
  Clock,
  TrendingUp,
  Phone,
  Mail,
  Building,
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Users,
  Zap,
  BarChart3,
  Archive,
  Settings,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileText,
  PhoneCall,
  DollarSign,
  Percent
} from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

// Types et interfaces
interface Lead {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  score?: number;
  segment?: string;
  source?: string;
  lifecycle_stage?: string;
  priority?: string;
  lead_quality?: string;
  owner_user_id?: string;
  last_activity_at?: string;
  next_follow_up_at?: string;
  lead_value?: number;
  conversion_probability?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
  updated_at?: string;
  profiles?: { first_name?: string; last_name?: string; };
  tags?: Array<{ id: string; name: string; color: string; }>;
}

interface LeadDetails extends Lead {
  notes?: Array<{
    id: string;
    content: string;
    note_type: string;
    is_pinned: boolean;
    created_at: string;
    profiles?: { first_name?: string; last_name?: string; };
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    task_type?: string;
    priority?: string;
    status?: string;
    due_date?: string;
    completed_at?: string;
    assigned_to?: { first_name?: string; last_name?: string; };
    created_by?: { first_name?: string; last_name?: string; };
  }>;
  quizSessions?: Array<any>;
  bookings?: Array<any>;
  events?: Array<any>;
}

interface LeadTag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface User {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
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
  qualified: 'bg-green-100 text-green-800 border-green-200',
  hot: 'bg-red-100 text-red-800 border-red-200',
  warm: 'bg-orange-100 text-orange-800 border-orange-200',
  cold: 'bg-blue-100 text-blue-800 border-blue-200'
};

const priorityColors = {
  urgent: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-blue-500 text-white',
  low: 'bg-gray-500 text-white'
};

const lifecycleStageLabels = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  proposal: 'Proposition',
  negotiation: 'Négociation',
  closed_won: 'Fermé gagné',
  closed_lost: 'Fermé perdu'
};

export const LeadsManagement = () => {
  const { toast } = useToast();
  
  // États principaux
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [leadDetails, setLeadDetails] = useState<LeadDetails | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les filtres avancés
  const [filters, setFilters] = useState({
    search: '',
    segment: '',
    source: '',
    lifecycle_stage: '',
    priority: '',
    owner_user_id: '',
    tags: [] as string[],
    page: 1,
    limit: 50
  });
  
  // États pour les données de référence
  const [availableTags, setAvailableTags] = useState<LeadTag[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  
  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // États pour les actions
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', note_type: 'general', is_pinned: false });
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    task_type: 'follow_up', 
    priority: 'medium',
    due_date: '',
    assigned_to_user_id: ''
  });

  // Fonction pour appeler l'API admin-leads
  const callAdminAPI = async (method: string, body?: any): Promise<any> => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const url = `https://lbwjesrgernvjiorktia.supabase.co/functions/v1/admin-leads`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Charger les leads avec filtres
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const url = `https://lbwjesrgernvjiorktia.supabase.co/functions/v1/admin-leads?${params}`;
      const response = await callAdminAPI('GET');
      
      setLeads(response.leads || []);
      setPagination(response.pagination || { page: 1, limit: 50, total: 0, pages: 0 });
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // Charger les données de référence
  const fetchReferenceData = useCallback(async () => {
    try {
      const [tagsResponse, usersResponse] = await Promise.all([
        callAdminAPI('POST', { action: 'getTags' }),
        callAdminAPI('POST', { action: 'getUsers' })
      ]);
      
      setAvailableTags(tagsResponse.tags || []);
      setAvailableUsers(usersResponse.users || []);
    } catch (error: any) {
      console.error('Error fetching reference data:', error);
    }
  }, []);

  // Charger les détails d'un lead
  const fetchLeadDetails = async (leadId: string) => {
    try {
      const response = await callAdminAPI('POST', { 
        action: 'getDetails', 
        leadId 
      });
      
      setLeadDetails(response);
    } catch (error: any) {
      console.error('Error fetching lead details:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du lead",
        variant: "destructive",
      });
    }
  };

  // Mettre à jour le score d'un lead
  const updateLeadScore = async (leadId: string, score: number, segment: string) => {
    try {
      await callAdminAPI('POST', {
        action: 'updateScore',
        leadId,
        data: { score, segment }
      });
      
      toast({
        title: "Succès",
        description: "Score mis à jour avec succès",
      });
      
      fetchLeads();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le score",
        variant: "destructive",
      });
    }
  };

  // Ajouter une note
  const addNote = async () => {
    if (!selectedLead || !newNote.content.trim()) return;
    
    try {
      await callAdminAPI('POST', {
        action: 'addNote',
        leadId: selectedLead,
        data: newNote
      });
      
      setNewNote({ content: '', note_type: 'general', is_pinned: false });
      setIsAddingNote(false);
      fetchLeadDetails(selectedLead);
      
      toast({
        title: "Succès",
        description: "Note ajoutée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la note",
        variant: "destructive",
      });
    }
  };

  // Ajouter une tâche
  const addTask = async () => {
    if (!selectedLead || !newTask.title.trim()) return;
    
    try {
      await callAdminAPI('POST', {
        action: 'addTask',
        leadId: selectedLead,
        data: newTask
      });
      
      setNewTask({ 
        title: '', 
        description: '', 
        task_type: 'follow_up', 
        priority: 'medium',
        due_date: '',
        assigned_to_user_id: ''
      });
      setIsAddingTask(false);
      fetchLeadDetails(selectedLead);
      
      toast({
        title: "Succès",
        description: "Tâche ajoutée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la tâche",
        variant: "destructive",
      });
    }
  };

  // Mettre à jour le statut d'une tâche
  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await callAdminAPI('POST', {
        action: 'updateTask',
        leadId: selectedLead,
        data: { taskId, status, completed_at: status === 'completed' ? new Date().toISOString() : undefined }
      });
      
      if (selectedLead) {
        fetchLeadDetails(selectedLead);
      }
      
      toast({
        title: "Succès",
        description: "Tâche mise à jour avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
    }
  };

  // Actions en lot
  const bulkUpdateLeads = async (updates: any) => {
    if (selectedLeads.length === 0) return;
    
    try {
      await callAdminAPI('POST', {
        action: 'bulkUpdate',
        data: { leadIds: selectedLeads, updates }
      });
      
      setSelectedLeads([]);
      fetchLeads();
      
      toast({
        title: "Succès",
        description: `${selectedLeads.length} leads mis à jour avec succès`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les leads",
        variant: "destructive",
      });
    }
  };

  // Gestionnaires d'événements
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const openLeadDetails = (leadId: string) => {
    setSelectedLead(leadId);
    setShowDetailDrawer(true);
    fetchLeadDetails(leadId);
  };

  const closeLeadDetails = () => {
    setShowDetailDrawer(false);
    setSelectedLead(null);
    setLeadDetails(null);
    setIsAddingNote(false);
    setIsAddingTask(false);
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    setSelectedLeads(leads.map(lead => lead.id));
  };

  const clearSelection = () => {
    setSelectedLeads([]);
  };

  // Utilitaires de formatage
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy à HH:mm', { locale: fr });
  };

  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return formatDistance(new Date(dateString), new Date(), { 
      addSuffix: true, 
      locale: fr 
    });
  };

  const getScoreStars = (score?: number) => {
    if (!score) return null;
    const stars = Math.round(score / 20);
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getOwnerName = (profiles?: { first_name?: string; last_name?: string; }) => {
    if (!profiles?.first_name && !profiles?.last_name) return 'Non assigné';
    return `${profiles.first_name || ''} ${profiles.last_name || ''}`.trim();
  };

  // Effects
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  // Render
  return (
    <div className="space-y-6">
      {/* Header avec actions globales */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Leads</h1>
          <p className="text-muted-foreground mt-1">
            {pagination.total} leads • {selectedLeads.length} sélectionnés
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {selectedLeads.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkUpdateLeads({ priority: 'high' })}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Marquer prioritaire
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkUpdateLeads({ lifecycle_stage: 'contacted' })}
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                Marquer contacté
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Désélectionner
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          
          <Button onClick={fetchLeads}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Panneau de filtres avancés */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtres avancés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Nom, email, entreprise..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Segment</label>
                <Select
                  value={filters.segment || undefined}
                  onValueChange={(value) => handleFilterChange('segment', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les segments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les segments</SelectItem>
                    <SelectItem value="qualified">Qualifié</SelectItem>
                    <SelectItem value="hot">Chaud</SelectItem>
                    <SelectItem value="warm">Tiède</SelectItem>
                    <SelectItem value="cold">Froid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Étape du cycle</label>
                <Select
                  value={filters.lifecycle_stage || undefined}
                  onValueChange={(value) => handleFilterChange('lifecycle_stage', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les étapes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les étapes</SelectItem>
                    {Object.entries(lifecycleStageLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Priorité</label>
                <Select
                  value={filters.priority || undefined}
                  onValueChange={(value) => handleFilterChange('priority', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les priorités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Propriétaire</label>
                <Select
                  value={filters.owner_user_id || undefined}
                  onValueChange={(value) => handleFilterChange('owner_user_id', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les propriétaires" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les propriétaires</SelectItem>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Source</label>
                <Select
                  value={filters.source || undefined}
                  onValueChange={(value) => handleFilterChange('source', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les sources</SelectItem>
                    <SelectItem value="landing_page">Page d'atterrissage</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="vsl">VSL</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau des leads */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Leads ({pagination.total})</CardTitle>
            <div className="flex items-center gap-2">
              {selectedLeads.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectedLeads.length === leads.length ? clearSelection : selectAllLeads}
                >
                  {selectedLeads.length === leads.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun lead trouvé
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLeads.length === leads.length && leads.length > 0}
                          onCheckedChange={selectedLeads.length === leads.length ? clearSelection : selectAllLeads}
                        />
                      </TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Étape</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Propriétaire</TableHead>
                      <TableHead>Valeur</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Dernière activité</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={() => toggleLeadSelection(lead.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {lead.email}
                            </div>
                            {lead.company && (
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Building className="w-3 h-3 mr-1" />
                                {lead.company}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getScoreStars(lead.score)}
                            <span className="text-sm font-medium">
                              {lead.score || 0}/100
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={segmentColors[lead.segment as keyof typeof segmentColors] || 'bg-gray-100 text-gray-800'}
                          >
                            {lead.segment || 'Non défini'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {lifecycleStageLabels[lead.lifecycle_stage as keyof typeof lifecycleStageLabels] || 'Nouveau'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={priorityColors[lead.priority as keyof typeof priorityColors] || 'bg-gray-500 text-white'}
                          >
                            {lead.priority || 'medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1 text-muted-foreground" />
                            <span className="text-sm">{getOwnerName(lead.profiles)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.lead_value ? (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                              <span className="font-medium">{lead.lead_value.toLocaleString()}$</span>
                              {lead.conversion_probability && (
                                <div className="ml-2 flex items-center text-sm text-muted-foreground">
                                  <Percent className="w-3 h-3 mr-1" />
                                  {lead.conversion_probability}%
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {lead.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color }}>
                                {tag.name}
                              </Badge>
                            ))}
                            {lead.tags && lead.tags.length > 2 && (
                              <Badge variant="outline">+{lead.tags.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatRelativeDate(lead.last_activity_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openLeadDetails(lead.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* TODO: Edit lead */}}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} sur {pagination.pages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog des détails du lead */}
      <Dialog open={showDetailDrawer} onOpenChange={closeLeadDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6" />
                <div>
                  <div className="text-xl font-bold">{leadDetails?.name}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {leadDetails?.email}
                  </div>
                </div>
              </div>
              {leadDetails && (
                <div className="flex items-center space-x-2">
                  <Badge className={segmentColors[leadDetails.segment as keyof typeof segmentColors] || 'bg-gray-100 text-gray-800'}>
                    {leadDetails.segment}
                  </Badge>
                  <Badge className={priorityColors[leadDetails.priority as keyof typeof priorityColors] || 'bg-gray-500 text-white'}>
                    {leadDetails.priority}
                  </Badge>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {leadDetails && (
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes ({leadDetails.notes?.length || 0})</TabsTrigger>
                <TabsTrigger value="tasks">Tâches ({leadDetails.tasks?.length || 0})</TabsTrigger>
              </TabsList>

              {/* Onglet Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Informations du lead
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Score</label>
                          <div className="flex items-center space-x-2 mt-1">
                            {getScoreStars(leadDetails.score)}
                            <span className="font-bold">{leadDetails.score || 0}/100</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Probabilité conversion</label>
                          <div className="flex items-center mt-1">
                            <Percent className="w-4 h-4 mr-1 text-green-600" />
                            <span className="font-medium">{leadDetails.conversion_probability || 0}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Valeur estimée</label>
                          <div className="flex items-center mt-1">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            <span className="font-medium">
                              {leadDetails.lead_value ? `${leadDetails.lead_value.toLocaleString()}$` : 'Non définie'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Propriétaire</label>
                          <div className="flex items-center mt-1">
                            <User className="w-4 h-4 mr-1 text-muted-foreground" />
                            <span>{getOwnerName(leadDetails.profiles)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {leadDetails.company && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Entreprise</label>
                          <div className="flex items-center mt-1">
                            <Building className="w-4 h-4 mr-1 text-muted-foreground" />
                            <span>{leadDetails.company}</span>
                          </div>
                        </div>
                      )}
                      
                      {leadDetails.phone && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                          <div className="flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-1 text-muted-foreground" />
                            <span>{leadDetails.phone}</span>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {leadDetails.tags?.map((tag) => (
                            <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color }}>
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Activité récente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Créé le</label>
                        <div className="mt-1">{formatDate(leadDetails.created_at)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Dernière activité</label>
                        <div className="mt-1">{formatRelativeDate(leadDetails.last_activity_at)}</div>
                      </div>
                      {leadDetails.next_follow_up_at && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Prochain suivi</label>
                          <div className="mt-1 flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-orange-500" />
                            {formatDate(leadDetails.next_follow_up_at)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Quiz complétés</p>
                          <p className="text-2xl font-bold">{leadDetails.quizSessions?.length || 0}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Réservations</p>
                          <p className="text-2xl font-bold">{leadDetails.bookings?.length || 0}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-2xl font-bold">{leadDetails.notes?.length || 0}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Événements</p>
                          <p className="text-2xl font-bold">{leadDetails.events?.length || 0}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Timeline */}
              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-4">
                  {leadDetails.events?.map((event, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{event.event_type}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatRelativeDate(event.created_at)}
                              </div>
                            </div>
                            {event.event_data && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {JSON.stringify(event.event_data, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Onglet Notes */}
              <TabsContent value="notes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <Button onClick={() => setIsAddingNote(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une note
                  </Button>
                </div>

                {isAddingNote && (
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium">Type de note</label>
                        <Select
                          value={newNote.note_type}
                          onValueChange={(value) => setNewNote(prev => ({ ...prev, note_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Général</SelectItem>
                            <SelectItem value="call">Appel</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="meeting">Réunion</SelectItem>
                            <SelectItem value="follow_up">Suivi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Contenu</label>
                        <Textarea
                          value={newNote.content}
                          onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Saisissez votre note..."
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={newNote.is_pinned}
                          onCheckedChange={(checked) => setNewNote(prev => ({ ...prev, is_pinned: !!checked }))}
                        />
                        <label className="text-sm">Épingler cette note</label>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={addNote}>Ajouter</Button>
                        <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                          Annuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {leadDetails.notes?.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">{note.note_type}</Badge>
                              {note.is_pinned && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                            </div>
                            <p className="text-sm mb-2">{note.content}</p>
                            <div className="text-xs text-muted-foreground">
                              Par {getOwnerName(note.profiles)} • {formatRelativeDate(note.created_at)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Onglet Tâches */}
              <TabsContent value="tasks" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Tâches</h3>
                  <Button onClick={() => setIsAddingTask(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une tâche
                  </Button>
                </div>

                {isAddingTask && (
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium">Titre</label>
                        <Input
                          value={newTask.title}
                          onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Titre de la tâche"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newTask.description}
                          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description de la tâche"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select
                            value={newTask.task_type}
                            onValueChange={(value) => setNewTask(prev => ({ ...prev, task_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="follow_up">Suivi</SelectItem>
                              <SelectItem value="call">Appel</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="meeting">Réunion</SelectItem>
                              <SelectItem value="demo">Démo</SelectItem>
                              <SelectItem value="proposal">Proposition</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Priorité</label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Faible</SelectItem>
                              <SelectItem value="medium">Moyenne</SelectItem>
                              <SelectItem value="high">Élevée</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Échéance</label>
                          <Input
                            type="datetime-local"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Assigné à</label>
                          <Select
                            value={newTask.assigned_to_user_id}
                            onValueChange={(value) => setNewTask(prev => ({ ...prev, assigned_to_user_id: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un utilisateur" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableUsers.map((user) => (
                                <SelectItem key={user.user_id} value={user.user_id}>
                                  {user.first_name} {user.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={addTask}>Ajouter</Button>
                        <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                          Annuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {leadDetails.tasks?.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateTaskStatus(
                                task.id, 
                                task.status === 'completed' ? 'pending' : 'completed'
                              )}
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </span>
                                <Badge variant="outline">{task.task_type}</Badge>
                                <Badge className={priorityColors[task.priority as keyof typeof priorityColors] || 'bg-gray-500 text-white'}>
                                  {task.priority}
                                </Badge>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>
                                  Assigné à {getOwnerName(task.assigned_to)}
                                </span>
                                {task.due_date && (
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(task.due_date)}
                                  </span>
                                )}
                                {task.completed_at && (
                                  <span className="text-green-600">
                                    Complété {formatRelativeDate(task.completed_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};