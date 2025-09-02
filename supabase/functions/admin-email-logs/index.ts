import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const status = url.searchParams.get('status')
    const email_type = url.searchParams.get('email_type')
    const search = url.searchParams.get('search')
    
    const offset = (page - 1) * limit

    console.log(`Fetching email logs - page: ${page}, limit: ${limit}, status: ${status}, type: ${email_type}, search: ${search}`)

    // Base query
    let query = supabase
      .from('email_delivery_logs')
      .select(`
        *,
        leads:lead_id (
          id,
          name,
          email,
          company
        )
      `, { count: 'exact' })
      .order('sent_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (email_type) {
      query = query.eq('email_type', email_type)
    }
    if (search) {
      query = query.or(`recipient_email.ilike.%${search}%,subject.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: logs, error: logsError, count } = await query

    if (logsError) {
      console.error('Error fetching email logs:', logsError)
      throw logsError
    }

    // Get email events for these logs
    const logIds = logs?.map(log => log.id) || []
    let emailEvents = []
    
    if (logIds.length > 0) {
      const { data: events, error: eventsError } = await supabase
        .from('email_events')
        .select('*')
        .in('email_id', logIds)
        .order('timestamp', { ascending: false })
      
      if (!eventsError) {
        emailEvents = events || []
      }
    }

    // Get summary stats
    const { data: stats } = await supabase
      .from('email_delivery_logs')
      .select('status')
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    const totalSent = stats?.filter(s => s.status === 'sent').length || 0
    const totalFailed = stats?.filter(s => s.status === 'failed').length || 0
    const successRate = stats?.length ? Math.round((totalSent / stats.length) * 100) : 0

    const response = {
      logs: logs || [],
      emailEvents,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: {
        totalSent,
        totalFailed,
        successRate,
        totalEmails: stats?.length || 0
      }
    }

    console.log(`Successfully fetched ${logs?.length || 0} email logs`)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in admin-email-logs:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})