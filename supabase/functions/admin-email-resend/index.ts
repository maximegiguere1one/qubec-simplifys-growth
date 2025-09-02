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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { queue_id } = await req.json()
    
    if (!queue_id) {
      return new Response(JSON.stringify({ error: 'queue_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Resending email for queue_id: ${queue_id}`)

    // Get original email content
    const { data: originalEmail, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('id', queue_id)
      .single()

    if (fetchError || !originalEmail) {
      console.error('Error fetching original email:', fetchError)
      return new Response(JSON.stringify({ error: 'Original email not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create new email queue entry
    const newEmailData = {
      lead_id: originalEmail.lead_id,
      recipient_email: originalEmail.recipient_email,
      subject: `[RESENT] ${originalEmail.subject}`,
      html_content: originalEmail.html_content,
      email_type: originalEmail.email_type,
      status: 'pending',
      scheduled_for: new Date().toISOString(),
      attempts: 0,
      max_attempts: 3
    }

    const { data: newEmail, error: insertError } = await supabase
      .from('email_queue')
      .insert(newEmailData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating resend email:', insertError)
      throw insertError
    }

    console.log(`Email queued for resend with ID: ${newEmail.id}`)

    return new Response(JSON.stringify({
      message: 'Email queued for resend',
      new_email_id: newEmail.id,
      recipient: originalEmail.recipient_email,
      subject: newEmailData.subject
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in admin-email-resend:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})