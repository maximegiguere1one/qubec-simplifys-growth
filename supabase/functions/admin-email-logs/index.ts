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

    // Support both GET (query params) and POST (JSON body) for filters
    let page = 1, limit = 50, status = null, email_type = null, search = null, from = null, to = null;
    
    if (req.method === 'GET') {
      const url = new URL(req.url)
      page = parseInt(url.searchParams.get('page') || '1')
      limit = parseInt(url.searchParams.get('limit') || '50')
      status = url.searchParams.get('status')
      email_type = url.searchParams.get('email_type')
      search = url.searchParams.get('search')
      from = url.searchParams.get('from')
      to = url.searchParams.get('to')
    } else if (req.method === 'POST') {
      const body = await req.json()
      page = body.page || 1
      limit = body.limit || 50
      status = body.status
      email_type = body.email_type
      search = body.search
      from = body.from
      to = body.to
    }
    
    const offset = (page - 1) * limit

    console.log(`Fetching email logs - page: ${page}, limit: ${limit}, status: ${status}, type: ${email_type}, search: ${search}, from: ${from}, to: ${to}`)

    // Use enhanced analytics function for better performance and features
    const { data: analyticsData, error: analyticsError } = await supabase
      .rpc('get_email_analytics_enhanced', {
        page_num: page,
        page_limit: limit,
        filter_status: status || null,
        filter_email_type: email_type || null,
        filter_search: search || null,
        filter_from: from ? new Date(from).toISOString() : null,
        filter_to: to ? new Date(to).toISOString() : null
      })

    if (analyticsError) {
      console.error('Error fetching enhanced analytics:', analyticsError)
      // Fallback to original query
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
      if (status) query = query.eq('status', status)
      if (email_type) query = query.eq('email_type', email_type)
      if (search) query = query.or(`recipient_email.ilike.%${search}%,subject.ilike.%${search}%`)
      if (from) query = query.gte('sent_at', from)
      if (to) query = query.lte('sent_at', to)

      query = query.range(offset, offset + limit - 1)

      const { data: logs, error: logsError, count } = await query
      
      if (logsError) {
        console.error('Error fetching email logs:', logsError)
        throw logsError
      }

      // Get email events using queue_id
      const queueIds = logs?.filter(log => log.queue_id).map(log => log.queue_id.toString()) || []
      let emailEvents = []
      
      if (queueIds.length > 0) {
        const { data: events, error: eventsError } = await supabase
          .from('email_events')
          .select('*')
          .in('email_id', queueIds)
          .order('timestamp', { ascending: false })
        
        if (!eventsError) {
          emailEvents = events || []
        }
      }

      // Transform to match enhanced format
      const transformedLogs = logs?.map(log => ({
        ...log,
        lead_name: log.leads?.name || null,
        lead_company: log.leads?.company || null,
        open_count: emailEvents.filter(e => e.email_id === log.queue_id?.toString() && e.action === 'opened').length,
        click_count: emailEvents.filter(e => e.email_id === log.queue_id?.toString() && e.action === 'clicked').length,
        first_opened_at: emailEvents.find(e => e.email_id === log.queue_id?.toString() && e.action === 'opened')?.timestamp || null,
        last_clicked_at: emailEvents.find(e => e.email_id === log.queue_id?.toString() && e.action === 'clicked')?.timestamp || null,
        total_count: count
      })) || []

      const response = {
        logs: transformedLogs,
        emailEvents,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        },
        stats: await getEmailStats(supabase)
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get email events using the queue_ids from analytics data
    const queueIds = analyticsData?.filter(log => log.queue_id).map(log => log.queue_id.toString()) || []
    let emailEvents = []
    
    if (queueIds.length > 0) {
      const { data: events, error: eventsError } = await supabase
        .from('email_events')
        .select('*')
        .in('email_id', queueIds)
        .order('timestamp', { ascending: false })
      
      if (!eventsError) {
        emailEvents = events || []
      }
    }

    const response = {
      logs: analyticsData || [],
      emailEvents,
      pagination: {
        page,
        limit,
        total: analyticsData?.[0]?.total_count || 0,
        totalPages: Math.ceil((analyticsData?.[0]?.total_count || 0) / limit)
      },
      stats: await getEmailStats(supabase)
    }

    console.log(`Successfully fetched ${analyticsData?.length || 0} enhanced email logs`)

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

// Helper function to get email stats
async function getEmailStats(supabase: any) {
  const { data: dashboardStats } = await supabase
    .rpc('get_email_stats_dashboard', { days_back: 30 })

  if (dashboardStats && dashboardStats.length > 0) {
    const stats = dashboardStats[0]
    return {
      totalSent: stats.total_sent,
      totalFailed: stats.total_failed,
      totalOpened: stats.total_opened,
      totalClicked: stats.total_clicked,
      openRate: stats.open_rate,
      clickRate: stats.click_rate,
      bounceRate: stats.bounce_rate,
      successRate: Math.round(100 - stats.bounce_rate),
      totalEmails: stats.total_sent + stats.total_failed,
      dailyStats: stats.daily_stats
    }
  }

  // Fallback to basic stats
  const { data: basicStats } = await supabase
    .from('email_delivery_logs')
    .select('status')
    .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const totalSent = basicStats?.filter(s => s.status === 'sent').length || 0
  const totalFailed = basicStats?.filter(s => s.status === 'failed').length || 0
  const successRate = basicStats?.length ? Math.round((totalSent / basicStats.length) * 100) : 0

  return {
    totalSent,
    totalFailed,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: Math.round(100 - successRate),
    successRate,
    totalEmails: basicStats?.length || 0,
    dailyStats: []
  }
}