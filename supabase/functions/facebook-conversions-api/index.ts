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
  event_name: string;
  event_time: number;
  event_source_url: string;
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    custom_score?: number;
    time_spent?: number;
  };
  event_id?: string;
}

const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const mapEventToFacebookEvent = (eventType: string, eventData: any): ConversionEvent => {
  const baseEvent: ConversionEvent = {
    event_name: 'Custom',
    event_time: Math.floor(eventData.timestamp || Date.now() / 1000),
    event_source_url: eventData.url || 'https://onesysteme.com',
    user_data: {
      client_ip_address: eventData.client_ip,
      client_user_agent: eventData.user_agent,
    },
    event_id: eventData.event_id || `${eventData.session_id}_${eventType}_${Date.now()}`,
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

    // Create the conversion event
    const conversionEvent = mapEventToFacebookEvent(eventType, eventData);

    // Add user data if available
    if (leadData?.email) {
      conversionEvent.user_data.em = [await hashString(leadData.email)];
    }
    if (leadData?.phone) {
      conversionEvent.user_data.ph = [await hashString(leadData.phone)];
    }
    if (leadData?.name) {
      // Split name into first name for hashing
      const firstName = leadData.name.split(' ')[0];
      conversionEvent.user_data.fn = [await hashString(firstName)];
    }

    // Add Facebook Click ID and Browser ID if available
    if (eventData.fbc) {
      conversionEvent.user_data.fbc = eventData.fbc;
    }
    if (eventData.fbp) {
      conversionEvent.user_data.fbp = eventData.fbp;
    }

    // Send to Facebook Conversions API
    const facebookResponse = await fetch(`https://graph.facebook.com/v18.0/${FACEBOOK_PIXEL_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [conversionEvent],
        access_token: FACEBOOK_ACCESS_TOKEN,
        test_event_code: Deno.env.get('FACEBOOK_TEST_EVENT_CODE') || undefined,
      }),
    });

    const facebookResult = await facebookResponse.json();

    if (!facebookResponse.ok) {
      console.error('Facebook API Error:', facebookResult);
      throw new Error(`Facebook API error: ${JSON.stringify(facebookResult)}`);
    }

    console.log('Facebook Conversions API response:', facebookResult);

    // Store the event in our database for tracking
    const { error: dbError } = await supabase
      .from('conversion_events')
      .insert({
        event_type: eventType,
        facebook_event_name: conversionEvent.event_name,
        event_data: eventData,
        lead_id: eventData.lead_id,
        session_id: eventData.session_id,
        facebook_response: facebookResult,
        sent_at: new Date().toISOString(),
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