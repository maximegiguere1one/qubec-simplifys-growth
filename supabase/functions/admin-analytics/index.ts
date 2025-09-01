import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      const daysBack = parseInt(url.searchParams.get('days') || '30');

      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Get lead analytics
      const { data: leads, error: leadsError } = await supabaseClient
        .from('leads')
        .select('segment, source, score, created_at')
        .gte('created_at', startDate.toISOString());

      if (leadsError) {
        throw leadsError;
      }

      // Get quiz completion data
      const { data: quizSessions } = await supabaseClient
        .from('quiz_sessions')
        .select('status, total_score, started_at')
        .gte('started_at', startDate.toISOString());

      // Get booking data
      const { data: bookings } = await supabaseClient
        .from('bookings')
        .select('status, created_at')
        .gte('created_at', startDate.toISOString());

      // Calculate metrics
      const totalLeads = leads?.length || 0;
      const qualifiedLeads = leads?.filter(l => l.segment === 'qualified').length || 0;
      const hotLeads = leads?.filter(l => l.segment === 'hot').length || 0;
      const warmLeads = leads?.filter(l => l.segment === 'warm').length || 0;
      const coldLeads = leads?.filter(l => l.segment === 'cold').length || 0;
      
      const averageScore = totalLeads > 0 
        ? Math.round((leads?.reduce((sum, l) => sum + (l.score || 0), 0) || 0) / totalLeads) 
        : 0;

      const conversionRate = totalLeads > 0 
        ? Math.round(((qualifiedLeads + hotLeads) / totalLeads) * 100) 
        : 0;

      // Leads by source
      const sourceStats = leads?.reduce((acc, lead) => {
        const source = lead.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const leadsBySource = Object.entries(sourceStats).map(([source, count]) => ({
        source,
        count
      }));

      // Quiz completion rate
      const totalQuizzes = quizSessions?.length || 0;
      const completedQuizzes = quizSessions?.filter(q => q.status === 'completed').length || 0;
      const quizCompletionRate = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;

      // Booking conversion rate
      const totalBookings = bookings?.length || 0;
      const bookingConversionRate = totalLeads > 0 ? Math.round((totalBookings / totalLeads) * 100) : 0;

      const analytics = {
        overview: {
          totalLeads,
          qualifiedLeads,
          hotLeads,
          warmLeads,
          coldLeads,
          averageScore,
          conversionRate,
          quizCompletionRate,
          bookingConversionRate
        },
        leadsBySource,
        timeRange: {
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
          daysBack
        }
      };

      return new Response(JSON.stringify(analytics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('Error in admin-analytics function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});