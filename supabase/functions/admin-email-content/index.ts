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
    const queueId = url.searchParams.get('queue_id')
    
    if (!queueId) {
      return new Response(JSON.stringify({ error: 'queue_id parameter required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Fetching email content for queue_id: ${queueId}`)

    // Get email content from email_queue
    const { data: emailContent, error } = await supabase
      .rpc('get_email_content_by_queue_id', { queue_id_param: queueId })

    if (error) {
      console.error('Error fetching email content:', error)
      throw error
    }

    if (!emailContent || emailContent.length === 0) {
      return new Response(JSON.stringify({ error: 'Email content not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const content = emailContent[0]

    console.log(`Successfully fetched email content for ${content.recipient_email}`)

    return new Response(JSON.stringify({
      html_content: content.html_content,
      subject: content.subject,
      email_type: content.email_type,
      recipient_email: content.recipient_email
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in admin-email-content:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})