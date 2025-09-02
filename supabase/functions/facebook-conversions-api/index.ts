import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FACEBOOK_PIXEL_ID = '2170098570154640';
const FACEBOOK_ACCESS_TOKEN = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ConversionEvent {
  event_id?: string;
  event_name: string;
  event_time: number;
  event_source_url: string;
  action_source: string;
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    ln?: string[];
    external_id?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
    custom_score?: number;
    time_spent?: number;
  };
}

const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

const normalizePhone = (phone: string): string => {
  // Remove all non-digit characters
  let normalized = phone.replace(/[^\d]/g, '');
  
  // Remove leading zeros
  normalized = normalized.replace(/^0+/, '');
  
  // Add country code if missing (assume Canada +1 for Quebec market)
  if (normalized.length === 10) {
    normalized = '1' + normalized;
  }
  
  return normalized;
};

const normalizeName = (name: string): string => {
  return name.toLowerCase().trim();
};

const getClientIP = (req: Request): string | undefined => {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         req.headers.get('cf-connecting-ip') ||
         undefined;
};

const getClientUserAgent = (req: Request): string | undefined => {
  return req.headers.get('user-agent') || undefined;
};

const mapEventToFacebookEvent = (eventType: string, eventData: any): ConversionEvent => {
  // Ensure timestamp is in seconds and not in the future
  const now = Math.floor(Date.now() / 1000);
  const eventTime = eventData.timestamp ? Math.floor(eventData.timestamp / 1000) : now;
  const clampedEventTime = Math.min(eventTime, now);

  const baseEvent: ConversionEvent = {
    event_id: eventData.event_id,
    event_name: 'Custom',
    event_time: clampedEventTime,
    event_source_url: eventData.url || 'https://onesysteme.com',
    action_source: 'website',
    user_data: {
      client_ip_address: eventData.client_ip,
      client_user_agent: eventData.user_agent,
      fbc: eventData.fbc,
      fbp: eventData.fbp,
    },
  };

  // Map internal events to Facebook standard events
  switch(eventType) {
    case 'lp_view':
      baseEvent.event_name = 'ViewContent';
      baseEvent.custom_data = {
        content_name: 'Landing Page',
        content_category: 'landing_page'
      };
      break;
    
    case 'lp_submit_optin':
      baseEvent.event_name = 'Lead';
      break;
    
    case 'quiz_start':
    case 'quiz_view':
      baseEvent.event_name = 'ViewContent';
      baseEvent.custom_data = {
        content_name: 'Business Efficiency Quiz',
        content_category: 'assessment'
      };
      break;
    
    case 'quiz_complete':
      baseEvent.event_name = 'CompleteRegistration';
      baseEvent.custom_data = {
        content_name: 'Business Efficiency Quiz',
        content_category: 'assessment',
        custom_score: eventData.total_score,
        time_spent: eventData.time_spent
      };
      break;
    
    case 'vsl_view':
      baseEvent.event_name = 'ViewContent';
      baseEvent.custom_data = {
        content_name: 'Video Sales Letter',
        content_category: 'video_content'
      };
      break;
    
    case 'vsl_cta_click':
      baseEvent.event_name = 'InitiateCheckout';
      break;
    
    case 'bookcall_view':
      baseEvent.event_name = 'ViewContent';
      baseEvent.custom_data = {
        content_name: 'Booking Page',
        content_category: 'consultation'
      };
      break;
    
    case 'bookcall_submit':
      baseEvent.event_name = 'Schedule';
      baseEvent.custom_data = {
        value: 500.00,
        currency: 'CAD',
        content_name: 'Discovery Call Booking',
        content_category: 'consultation'
      };
      break;
    
    case 'bookcall_confirm':
      baseEvent.event_name = 'Purchase';
      baseEvent.custom_data = {
        value: 500.00,
        currency: 'CAD',
        content_name: 'Discovery Call Booking',
        content_category: 'consultation'
      };
      break;
    
    default:
      baseEvent.event_name = eventType;
  }

  return baseEvent;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!FACEBOOK_ACCESS_TOKEN) {
    console.error('Facebook access token not configured');
    return new Response(
      JSON.stringify({ error: 'Facebook access token not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { eventType, eventData, leadData } = await req.json();

    console.log('Processing Facebook Conversions API event:', { eventType, eventData, leadData });

    // Get client IP and user agent from headers
    const clientIP = getClientIP(req);
    const clientUserAgent = getClientUserAgent(req);

    // Create the conversion event with enhanced client data
    const conversionEvent = mapEventToFacebookEvent(eventType, {
      ...eventData,
      client_ip: clientIP || eventData.client_ip,
      user_agent: clientUserAgent || eventData.user_agent,
    });

    // Enriched lead data - fetch from DB if we only have lead ID
    let enrichedLeadData = leadData;
    if (leadData?.id && (!leadData.email || !leadData.name)) {
      try {
        const { data: lead, error } = await supabase
          .from('leads')
          .select('email, name, phone')
          .eq('id', leadData.id)
          .maybeSingle();
        
        if (lead && !error) {
          enrichedLeadData = {
            ...leadData,
            email: lead.email || leadData.email,
            name: lead.name || leadData.name,
            phone: lead.phone || leadData.phone,
          };
        }
      } catch (dbError) {
        console.warn('Failed to enrich lead data:', dbError);
      }
    }

    // Add normalized and hashed user data
    if (enrichedLeadData?.email) {
      const normalizedEmail = normalizeEmail(enrichedLeadData.email);
      conversionEvent.user_data.em = [await hashString(normalizedEmail)];
    }
    
    if (enrichedLeadData?.phone) {
      const normalizedPhone = normalizePhone(enrichedLeadData.phone);
      conversionEvent.user_data.ph = [await hashString(normalizedPhone)];
    }
    
    if (enrichedLeadData?.name) {
      const normalizedName = normalizeName(enrichedLeadData.name);
      const nameParts = normalizedName.split(' ');
      
      // First name
      if (nameParts[0]) {
        conversionEvent.user_data.fn = [await hashString(nameParts[0])];
      }
      
      // Last name (if available)
      if (nameParts.length > 1) {
        const lastName = nameParts.slice(1).join(' ');
        conversionEvent.user_data.ln = [await hashString(lastName)];
      }
    }

    // Add external IDs for better matching
    const externalIds = [];
    if (enrichedLeadData?.id) {
      externalIds.push(enrichedLeadData.id);
    }
    if (eventData.session_id) {
      externalIds.push(eventData.session_id);
    }
    if (externalIds.length > 0) {
      conversionEvent.user_data.external_id = externalIds;
    }

    // Add Facebook Click ID and Browser ID if available
    if (eventData.fbc) {
      conversionEvent.user_data.fbc = eventData.fbc;
    }
    if (eventData.fbp) {
      conversionEvent.user_data.fbp = eventData.fbp;
    }

    // Send to Facebook Conversions API
    const testEventCode = Deno.env.get('FACEBOOK_TEST_EVENT_CODE');
    const requestBody: any = {
      data: [conversionEvent],
      access_token: FACEBOOK_ACCESS_TOKEN,
    };
    
    // Add test event code if available (for testing in Graph API Explorer)
    if (testEventCode) {
      requestBody.test_event_code = testEventCode;
    }

    // Log request body but hide access token for security
    const logBody = { ...requestBody, access_token: '[HIDDEN]' };
    console.log('Facebook API Request Body:', JSON.stringify(logBody, null, 2));

    const facebookResponse = await fetch(`https://graph.facebook.com/v23.0/${FACEBOOK_PIXEL_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const facebookResult = await facebookResponse.json();

    if (!facebookResponse.ok) {
      console.error('Facebook API Error:', facebookResult);
      throw new Error(`Facebook API error: ${JSON.stringify(facebookResult)}`);
    }

    // Enhanced logging for monitoring and debugging
    console.log('Facebook API Response:', JSON.stringify(facebookResult, null, 2));
    console.log('Event processed successfully:', {
      eventType,
      facebookEventName: conversionEvent.event_name,
      eventId: conversionEvent.event_id,
      hasEmail: !!conversionEvent.user_data.em,
      hasPhone: !!conversionEvent.user_data.ph,
      hasFirstName: !!conversionEvent.user_data.fn,
      hasLastName: !!conversionEvent.user_data.ln,
      hasExternalId: !!conversionEvent.user_data.external_id,
      hasClientIP: !!conversionEvent.user_data.client_ip_address,
      hasUserAgent: !!conversionEvent.user_data.client_user_agent,
      hasFBC: !!conversionEvent.user_data.fbc,
      hasFBP: !!conversionEvent.user_data.fbp,
      leadEnriched: !!enrichedLeadData && enrichedLeadData !== leadData,
      timestamp: new Date().toISOString()
    });

    // Store the event in our database for tracking (with deduplication)
    const { error: dbError } = await supabase
      .from('conversion_events')
      .upsert({
        event_id: conversionEvent.event_id, // Use event_id as unique constraint for deduplication
        event_type: eventType,
        facebook_event_name: conversionEvent.event_name,
        event_data: eventData,
        lead_id: eventData.lead_id || enrichedLeadData?.id,
        session_id: eventData.session_id,
        facebook_response: facebookResult,
        sent_at: new Date().toISOString(),
      }, {
        onConflict: 'event_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if we can't store in DB
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        facebook_response: facebookResult,
        event_name: conversionEvent.event_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in facebook-conversions-api function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});