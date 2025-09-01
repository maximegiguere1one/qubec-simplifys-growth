import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const emailSigningSecret = Deno.env.get('EMAIL_SIGNING_SECRET') ?? 'fallback-secret'

    console.log('Processing email queue...')

    // Get pending emails that are due to be sent
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', 3)
      .order('scheduled_for', { ascending: true })
      .limit(50)

    if (fetchError) {
      console.error('Error fetching pending emails:', fetchError)
      throw fetchError
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('No pending emails to process')
      return new Response(
        JSON.stringify({ message: 'No pending emails', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${pendingEmails.length} emails to process`)
    let processedCount = 0
    let failedCount = 0

    for (const email of pendingEmails) {
      try {
        console.log(`Processing email ${email.id} for ${email.recipient_email}`)

        // Check if user has unsubscribed
        const { data: unsubscribed } = await supabase
          .from('email_unsubscribes')
          .select('id')
          .eq('email', email.recipient_email)
          .single()

        if (unsubscribed) {
          console.log(`User ${email.recipient_email} has unsubscribed, skipping`)
          await supabase
            .from('email_queue')
            .update({ 
              status: 'skipped',
              error_message: 'User unsubscribed',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id)
          continue
        }

        // Generate tracking pixels and links
        const openTrackingUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/email-open?t=${btoa(JSON.stringify({ emailId: email.id, secret: emailSigningSecret }))}`
        const unsubscribeUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/email-unsubscribe?t=${btoa(JSON.stringify({ email: email.recipient_email, secret: emailSigningSecret }))}`

        // Add tracking pixel and unsubscribe link to HTML content
        const trackingPixel = `<img src="${openTrackingUrl}" width="1" height="1" style="display:none;" alt="">`
        const unsubscribeLink = `<div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>One Système - Solutions d'automatisation pour entreprises québécoises</p>
          <p><a href="${unsubscribeUrl}" style="color: #666;">Se désabonner</a></p>
        </div>`

        const finalHtmlContent = `${email.html_content}${trackingPixel}${unsubscribeLink}`

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: 'One Système <noreply@resend.dev>',
          to: [email.recipient_email],
          subject: email.subject,
          html: finalHtmlContent,
        })

        console.log(`Email sent successfully:`, emailResponse)

        // Update email status to sent
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id)

        // Log delivery
        await supabase
          .from('email_delivery_logs')
          .insert({
            lead_id: email.lead_id,
            recipient_email: email.recipient_email,
            email_type: email.email_type,
            subject: email.subject,
            status: 'sent',
            provider_response: emailResponse
          })

        processedCount++

      } catch (emailError) {
        console.error(`Error sending email ${email.id}:`, emailError)
        failedCount++

        // Update attempts and error message
        await supabase
          .from('email_queue')
          .update({ 
            attempts: email.attempts + 1,
            error_message: emailError.message,
            status: email.attempts + 1 >= 3 ? 'failed' : 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id)

        // Log failed delivery
        await supabase
          .from('email_delivery_logs')
          .insert({
            lead_id: email.lead_id,
            recipient_email: email.recipient_email,
            email_type: email.email_type,
            subject: email.subject,
            status: 'failed',
            error_message: emailError.message
          })
      }
    }

    console.log(`Email processing complete. Processed: ${processedCount}, Failed: ${failedCount}`)

    return new Response(
      JSON.stringify({ 
        message: 'Email processing complete',
        processed: processedCount,
        failed: failedCount,
        total: pendingEmails.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-email-queue:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})