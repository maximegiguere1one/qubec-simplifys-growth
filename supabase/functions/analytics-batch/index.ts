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

    // Validate lead_id exists if provided to prevent foreign key errors
    const eventsToInsert = []
    const leadIdCache = new Set<string>()
    
    for (const event of events) {
      let validatedLeadId = null
      
      if (event.lead_id) {
        // Check cache first
        if (leadIdCache.has(event.lead_id)) {
          validatedLeadId = event.lead_id
        } else {
          // Verify lead exists in database
          const { data: leadExists } = await supabase
            .from('leads')
            .select('id')
            .eq('id', event.lead_id)
            .single()
          
          if (leadExists) {
            leadIdCache.add(event.lead_id)
            validatedLeadId = event.lead_id
          } else {
            console.warn(`Lead ID ${event.lead_id} not found, setting to null for event ${event.event_type}`)
          }
        }
      }
      
      eventsToInsert.push({
        event_type: event.event_type as any,
        event_data: event.event_data,
        lead_id: validatedLeadId, // Use validated lead_id or null
        session_id: event.session_id,
        ip_address: (() => {
          const forwardedFor = req.headers.get('x-forwarded-for');
          const realIp = req.headers.get('x-real-ip');
          
          if (forwardedFor) {
            // Extract first IP from comma-separated list and validate
            const firstIp = forwardedFor.split(',')[0].trim();
            // Basic IPv4/IPv6 validation
            if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(firstIp) || 
                /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(firstIp)) {
              return firstIp;
            }
          }
          
          if (realIp && (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(realIp) || 
                        /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(realIp))) {
            return realIp;
          }
          
          return null; // Return null if no valid IP found
        })(),
        user_agent: req.headers.get('user-agent'),
        referrer: event.event_data.referrer,
        page_url: event.event_data.page_url,
        created_at: event.created_at
      })
    }

    // Batch insert events using service role to bypass RLS
    const { data, error } = await supabase
      .from('funnel_events')
      .insert(eventsToInsert)
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