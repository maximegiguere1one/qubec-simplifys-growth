import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailQueueRequest {
  lead_id?: string;
  recipient_email: string;
  subject: string;
  html_content: string;
  email_type: string;
  delay_minutes?: number;
  priority?: 'high' | 'normal' | 'low';
  personalization?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      lead_id,
      recipient_email, 
      subject, 
      html_content, 
      email_type,
      delay_minutes = 0,
      priority = 'normal',
      personalization = {}
    }: EmailQueueRequest = await req.json()

    console.log(`Enqueueing email for ${recipient_email}, type: ${email_type}`)

    // Validate inputs
    if (!recipient_email || !subject || !html_content || !email_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has unsubscribed
    const { data: unsubscribed } = await supabase
      .from('email_unsubscribes')
      .select('id')
      .eq('email', recipient_email.toLowerCase())
      .maybeSingle()

    if (unsubscribed) {
      console.log(`User ${recipient_email} has unsubscribed, skipping`)
      return new Response(
        JSON.stringify({ message: 'User unsubscribed', skipped: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate scheduled time
    const scheduledFor = new Date(Date.now() + delay_minutes * 60000).toISOString()

    // Personalize content if personalization data is provided
    let finalHtmlContent = html_content
    let finalSubject = subject

    Object.entries(personalization).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      finalHtmlContent = finalHtmlContent.replace(new RegExp(placeholder, 'g'), String(value))
      finalSubject = finalSubject.replace(new RegExp(placeholder, 'g'), String(value))
    })

    // Insert into email queue
    const { data, error } = await supabase
      .from('email_queue')
      .insert({
        lead_id,
        recipient_email: recipient_email.toLowerCase(),
        subject: finalSubject,
        html_content: finalHtmlContent,
        email_type,
        scheduled_for: scheduledFor,
        status: 'pending',
        attempts: 0,
        max_attempts: priority === 'high' ? 5 : 3
      })
      .select()
      .single()

    if (error) {
      console.error('Error enqueueing email:', error)
      throw error
    }

    console.log(`Email enqueued successfully: ${data.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: data.id, 
        scheduled_for: scheduledFor,
        message: 'Email enqueued successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in enqueue-email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})