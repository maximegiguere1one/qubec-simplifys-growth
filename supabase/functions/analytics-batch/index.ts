import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsEvent {
  event_type: string
  event_data: Record<string, any>
  lead_id?: string | null
  session_id: string
  created_at: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { events }: { events: AnalyticsEvent[] } = await req.json()
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid events data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${events.length} analytics events`)

    // Batch insert events using service role to bypass RLS
    const { data, error } = await supabase
      .from('funnel_events')
      .insert(
        events.map(event => ({
          event_type: event.event_type as any,
          event_data: event.event_data,
          lead_id: event.lead_id,
          session_id: event.session_id,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
          referrer: event.event_data.referrer,
          page_url: event.event_data.page_url,
          created_at: event.created_at
        }))
      )
      .select()

    if (error) {
      console.error('Failed to insert analytics events:', error)
      throw error
    }

    console.log(`Successfully inserted ${data?.length || 0} events`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: data?.length || 0 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in analytics-batch:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})