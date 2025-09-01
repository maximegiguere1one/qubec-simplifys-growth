import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadRequest {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  sessionId: string;
  honeypot?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: LeadRequest = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // 1. Honeypot detection
    if (body.honeypot && body.honeypot.trim().length > 0) {
      console.log('Honeypot detected from IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Invalid submission' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Rate limiting check
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { count: recentSubmissions } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo.toISOString())
      .like('scoring_data->ip_address', `%${clientIP}%`);

    if (recentSubmissions && recentSubmissions >= 5) {
      console.log('Rate limit exceeded for IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Input validation
    const errors: string[] = [];
    
    if (!body.name || body.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    if (!body.email || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(body.email)) {
      errors.push('Valid email is required');
    }
    
    if (body.phone && body.phone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    }

    if (!body.sessionId || !/^sess_\d+_[a-zA-Z0-9]{9}$/.test(body.sessionId)) {
      errors.push('Invalid session ID');
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. UTM parameter validation and sanitization
    const sanitizedUTM = {
      utm_source: body.utm_source?.substring(0, 255),
      utm_medium: body.utm_medium?.substring(0, 255),
      utm_campaign: body.utm_campaign?.substring(0, 255),
    };

    // 5. Create or update lead with IP enrichment
    const leadData = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone?.trim(),
      source: body.source || 'landing_page',
      ...sanitizedUTM,
      scoring_data: {
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent'),
        session_id: body.sessionId,
        created_via: 'validated_edge_function',
        timestamp: new Date().toISOString(),
      }
    };

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .upsert(leadData, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (leadError) {
      console.error('Database error creating lead:', leadError);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Log successful lead creation event
    await supabase.from('funnel_events').insert({
      session_id: body.sessionId,
      event_type: 'lp_submit_optin',
      event_data: {
        lead_id: lead.id,
        source: body.source || 'landing_page',
        validated: true,
        ip_address: clientIP,
      },
      lead_id: lead.id,
      ip_address: clientIP,
      page_url: req.headers.get('referer'),
      user_agent: req.headers.get('user-agent'),
    });

    console.log('Lead created successfully:', { leadId: lead.id, email: lead.email });

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead created successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in validate-lead function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);