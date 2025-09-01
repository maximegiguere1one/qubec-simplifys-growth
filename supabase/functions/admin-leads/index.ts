
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadFilters {
  segment?: string;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
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
      .select('role')
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
        search: url.searchParams.get('search') || undefined,
        page: parseInt(url.searchParams.get('page') || '1'),
        limit: parseInt(url.searchParams.get('limit') || '50'),
      };

      console.log('Fetching leads with filters:', filters);

      // Build query with correct column selection
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
          utm_source,
          utm_medium,
          utm_campaign,
          created_at,
          updated_at
        `);

      // Apply filters
      if (filters.segment && filters.segment !== '') {
        query = query.eq('segment', filters.segment);
      }
      if (filters.source && filters.source !== '') {
        query = query.eq('source', filters.source);
      }
      if (filters.search && filters.search !== '') {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = ((filters.page || 1) - 1) * (filters.limit || 50);
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + (filters.limit || 50) - 1);

      const { data: leads, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      console.log(`Successfully fetched ${leads?.length || 0} leads`);

      // Get total count for pagination
      let countQuery = supabaseClient
        .from('leads')
        .select('*', { count: 'exact', head: true });

      if (filters.segment && filters.segment !== '') {
        countQuery = countQuery.eq('segment', filters.segment);
      }
      if (filters.source && filters.source !== '') {
        countQuery = countQuery.eq('source', filters.source);
      }
      if (filters.search && filters.search !== '') {
        countQuery = countQuery.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { count } = await countQuery;

      return new Response(JSON.stringify({
        leads,
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

      if (action === 'updateScore') {
        const { score, segment } = data;
        
        const { error } = await supabaseClient
          .from('leads')
          .update({ 
            score, 
            segment, 
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

      if (action === 'getDetails') {
        // Get lead with related data
        const { data: lead, error: leadError } = await supabaseClient
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (leadError) {
          console.error('Error fetching lead details:', leadError);
          throw leadError;
        }

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

        console.log(`Successfully fetched details for lead ${leadId}`);

        return new Response(JSON.stringify({
          lead,
          quizSessions: quizSessions || [],
          bookings: bookings || [],
          events: events || []
        }), {
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
