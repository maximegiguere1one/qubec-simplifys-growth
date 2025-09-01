import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadFilters {
  segment?: string;
  source?: string;
  lifecycle_stage?: string;
  priority?: string;
  owner_user_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  tags?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Set the session from the authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, user_id')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Admin access required');
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const filters: LeadFilters = {
        segment: url.searchParams.get('segment') || undefined,
        source: url.searchParams.get('source') || undefined,
        lifecycle_stage: url.searchParams.get('lifecycle_stage') || undefined,
        priority: url.searchParams.get('priority') || undefined,
        owner_user_id: url.searchParams.get('owner_user_id') || undefined,
        search: url.searchParams.get('search') || undefined,
        page: parseInt(url.searchParams.get('page') || '1'),
        limit: parseInt(url.searchParams.get('limit') || '50'),
        tags: url.searchParams.get('tags') ? url.searchParams.get('tags')!.split(',') : undefined,
      };

      console.log('Fetching leads with filters:', filters);

      // Build query with enhanced column selection
      let query = supabaseClient
        .from('leads')
        .select(`
          id,
          email,
          name,
          phone,
          company,
          score,
          segment,
          source,
          lifecycle_stage,
          priority,
          lead_quality,
          owner_user_id,
          last_activity_at,
          next_follow_up_at,
          lead_value,
          conversion_probability,
          utm_source,
          utm_medium,
          utm_campaign,
          created_at,
          updated_at,
          profiles:owner_user_id(first_name, last_name)
        `);

      // Apply filters
      if (filters.segment && filters.segment !== '') {
        query = query.eq('segment', filters.segment);
      }
      if (filters.source && filters.source !== '') {
        query = query.eq('source', filters.source);
      }
      if (filters.lifecycle_stage && filters.lifecycle_stage !== '') {
        query = query.eq('lifecycle_stage', filters.lifecycle_stage);
      }
      if (filters.priority && filters.priority !== '') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.owner_user_id && filters.owner_user_id !== '') {
        query = query.eq('owner_user_id', filters.owner_user_id);
      }
      if (filters.search && filters.search !== '') {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = ((filters.page || 1) - 1) * (filters.limit || 50);
      query = query
        .order('last_activity_at', { ascending: false, nullsLast: true })
        .range(offset, offset + (filters.limit || 50) - 1);

      const { data: leads, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      // If filtering by tags, get leads with those tags
      let finalLeads = leads || [];
      if (filters.tags && filters.tags.length > 0) {
        const { data: taggedLeads } = await supabaseClient
          .from('lead_tag_assignments')
          .select(`
            lead_id,
            lead_tags!inner(name)
          `)
          .in('lead_tags.name', filters.tags);

        const taggedLeadIds = new Set(taggedLeads?.map(t => t.lead_id) || []);
        finalLeads = finalLeads.filter(lead => taggedLeadIds.has(lead.id));
      }

      // Get tags for each lead
      for (const lead of finalLeads) {
        const { data: tags } = await supabaseClient
          .from('lead_tag_assignments')
          .select(`
            lead_tags(id, name, color)
          `)
          .eq('lead_id', lead.id);
        
        lead.tags = tags?.map(t => t.lead_tags).filter(Boolean) || [];
      }

      console.log(`Successfully fetched ${finalLeads.length} leads`);

      // Get total count for pagination
      let countQuery = supabaseClient
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Apply same filters for count
      if (filters.segment && filters.segment !== '') {
        countQuery = countQuery.eq('segment', filters.segment);
      }
      if (filters.source && filters.source !== '') {
        countQuery = countQuery.eq('source', filters.source);
      }
      if (filters.lifecycle_stage && filters.lifecycle_stage !== '') {
        countQuery = countQuery.eq('lifecycle_stage', filters.lifecycle_stage);
      }
      if (filters.priority && filters.priority !== '') {
        countQuery = countQuery.eq('priority', filters.priority);
      }
      if (filters.owner_user_id && filters.owner_user_id !== '') {
        countQuery = countQuery.eq('owner_user_id', filters.owner_user_id);
      }
      if (filters.search && filters.search !== '') {
        countQuery = countQuery.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { count } = await countQuery;

      return new Response(JSON.stringify({
        leads: finalLeads,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 50,
          total: count || 0,
          pages: Math.ceil((count || 0) / (filters.limit || 50))
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const { action, leadId, data } = await req.json();

      // Update lead score and segment
      if (action === 'updateScore') {
        const { score, segment } = data;
        
        const { error } = await supabaseClient
          .from('leads')
          .update({ 
            score, 
            segment, 
            last_activity_at: new Date().toISOString(),
            updated_at: new Date().toISOString() 
          })
          .eq('id', leadId);

        if (error) {
          console.error('Error updating lead score:', error);
          throw error;
        }

        console.log(`Successfully updated lead ${leadId} score to ${score}, segment to ${segment}`);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update lead details
      if (action === 'updateLead') {
        const updates = {
          ...data,
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabaseClient
          .from('leads')
          .update(updates)
          .eq('id', leadId);

        if (error) {
          console.error('Error updating lead:', error);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Add note to lead
      if (action === 'addNote') {
        const { content, note_type = 'general', is_pinned = false } = data;

        const { error } = await supabaseClient
          .from('lead_notes')
          .insert({
            lead_id: leadId,
            author_user_id: profile.user_id,
            content,
            note_type,
            is_pinned
          });

        if (error) {
          console.error('Error adding note:', error);
          throw error;
        }

        // Update lead activity
        await supabaseClient
          .from('leads')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', leadId);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Add task to lead
      if (action === 'addTask') {
        const { title, description, task_type = 'follow_up', priority = 'medium', due_date, assigned_to_user_id } = data;

        const { error } = await supabaseClient
          .from('lead_tasks')
          .insert({
            lead_id: leadId,
            assigned_to_user_id: assigned_to_user_id || profile.user_id,
            created_by_user_id: profile.user_id,
            title,
            description,
            task_type,
            priority,
            due_date
          });

        if (error) {
          console.error('Error adding task:', error);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update task status
      if (action === 'updateTask') {
        const { taskId, status, completed_at } = data;

        const updates: any = { status };
        if (status === 'completed') {
          updates.completed_at = completed_at || new Date().toISOString();
        }

        const { error } = await supabaseClient
          .from('lead_tasks')
          .update(updates)
          .eq('id', taskId);

        if (error) {
          console.error('Error updating task:', error);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Add tag to lead
      if (action === 'addTag') {
        const { tagId } = data;

        const { error } = await supabaseClient
          .from('lead_tag_assignments')
          .insert({
            lead_id: leadId,
            tag_id: tagId
          });

        if (error) {
          console.error('Error adding tag:', error);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Remove tag from lead
      if (action === 'removeTag') {
        const { tagId } = data;

        const { error } = await supabaseClient
          .from('lead_tag_assignments')
          .delete()
          .eq('lead_id', leadId)
          .eq('tag_id', tagId);

        if (error) {
          console.error('Error removing tag:', error);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Bulk actions
      if (action === 'bulkUpdate') {
        const { leadIds, updates } = data;

        const { error } = await supabaseClient
          .from('leads')
          .update({
            ...updates,
            last_activity_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .in('id', leadIds);

        if (error) {
          console.error('Error bulk updating leads:', error);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get enhanced lead details
      if (action === 'getDetails') {
        // Get lead with owner info
        const { data: lead, error: leadError } = await supabaseClient
          .from('leads')
          .select(`
            *,
            profiles:owner_user_id(first_name, last_name, email)
          `)
          .eq('id', leadId)
          .single();

        if (leadError) {
          console.error('Error fetching lead details:', leadError);
          throw leadError;
        }

        // Get notes with author info
        const { data: notes } = await supabaseClient
          .from('lead_notes')
          .select(`
            *,
            profiles:author_user_id(first_name, last_name)
          `)
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });

        // Get tasks with assignee info
        const { data: tasks } = await supabaseClient
          .from('lead_tasks')
          .select(`
            *,
            assigned_to:assigned_to_user_id(first_name, last_name),
            created_by:created_by_user_id(first_name, last_name)
          `)
          .eq('lead_id', leadId)
          .order('due_date', { ascending: true, nullsLast: true });

        // Get tags
        const { data: tagAssignments } = await supabaseClient
          .from('lead_tag_assignments')
          .select(`
            lead_tags(id, name, color, description)
          `)
          .eq('lead_id', leadId);

        const tags = tagAssignments?.map(t => t.lead_tags).filter(Boolean) || [];

        // Get quiz sessions
        const { data: quizSessions } = await supabaseClient
          .from('quiz_sessions')
          .select('*')
          .eq('lead_id', leadId)
          .order('started_at', { ascending: false });

        // Get bookings
        const { data: bookings } = await supabaseClient
          .from('bookings')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });

        // Get recent funnel events
        const { data: events } = await supabaseClient
          .from('funnel_events')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false })
          .limit(50);

        console.log(`Successfully fetched enhanced details for lead ${leadId}`);

        return new Response(JSON.stringify({
          lead,
          notes: notes || [],
          tasks: tasks || [],
          tags: tags || [],
          quizSessions: quizSessions || [],
          bookings: bookings || [],
          events: events || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get available tags
      if (action === 'getTags') {
        const { data: tags } = await supabaseClient
          .from('lead_tags')
          .select('*')
          .order('name');

        return new Response(JSON.stringify({ tags: tags || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get available users for assignment
      if (action === 'getUsers') {
        const { data: users } = await supabaseClient
          .from('profiles')
          .select('user_id, first_name, last_name, email, role')
          .eq('role', 'admin')
          .order('first_name');

        return new Response(JSON.stringify({ users: users || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('Error in admin-leads function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});