import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced email queue processor with advanced features
interface EmailQueueItem {
  id: string;
  lead_id: string | null;
  recipient_email: string;
  subject: string;
  html_content: string;
  email_type: string;
  scheduled_for: string;
  attempts: number;
  max_attempts: number;
  status: string;
  error_message?: string;
}

interface EmailSettings {
  from_name: string;
  from_email: string;
  reply_to?: string;
  sending_paused: boolean;
  daily_send_limit?: number;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone?: string;
  bounce_handling_enabled?: boolean;
  open_tracking_enabled?: boolean;
  click_tracking_enabled?: boolean;
}

// Helper functions
const isWithinQuietHours = (settings: EmailSettings): boolean => {
  if (!settings.quiet_hours_start || !settings.quiet_hours_end) return false;
  
  const now = new Date();
  const timezone = settings.timezone || 'America/Toronto';
  
  // Convert to local time zone
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const currentHour = localTime.getHours();
  const currentMinute = localTime.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  const [startHour, startMin] = settings.quiet_hours_start.split(':').map(Number);
  const [endHour, endMin] = settings.quiet_hours_end.split(':').map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  // Handle overnight quiet hours
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
};

const checkDailyLimit = async (supabase: any, settings: EmailSettings): Promise<boolean> => {
  if (!settings.daily_send_limit) return true;
  
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('email_delivery_logs')
    .select('id')
    .gte('created_at', today)
    .eq('status', 'sent');
    
  if (error) {
    console.error('Error checking daily limit:', error);
    return true; // Allow sending if check fails
  }
  
  return (data?.length || 0) < settings.daily_send_limit;
};

const rewriteLinksForTracking = (htmlContent: string, emailId: string, emailSigningSecret: string, baseUrl: string): string => {
  const trackingSecret = emailSigningSecret;
  
  return htmlContent.replace(
    /href="([^"]+)"/g, 
    (match, url) => {
      // Skip tracking for unsubscribe and email service links
      if (url.includes('unsubscribe') || url.includes('email-click') || url.includes('mailto:')) {
        return match;
      }
      
      const trackingToken = btoa(JSON.stringify({ emailId, secret: trackingSecret }));
      return `href="${baseUrl}/functions/v1/email-click?t=${trackingToken}&url=${encodeURIComponent(url)}"`;
    }
  );
};

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
    const baseUrl = Deno.env.get('SUPABASE_URL') ?? ''

    const requestBody = await req.json().catch(() => ({}));
    const isCleanupRequest = requestBody.cleanup === true;

    if (isCleanupRequest) {
      console.log('Running email cleanup...');
      // Run cleanup function
      const { error } = await supabase.rpc('cleanup_old_events');
      if (error) console.error('Cleanup error:', error);
      
      return new Response(
        JSON.stringify({ message: 'Cleanup completed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing email queue...')

    // Get email settings
    const { data: emailSettings, error: settingsError } = await supabase
      .from('email_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching email settings:', settingsError);
      throw settingsError;
    }

    const settings: EmailSettings = emailSettings || {
      from_name: 'One Système',
      from_email: 'noreply@resend.dev',
      sending_paused: false
    };

    // Check if sending is paused
    if (settings.sending_paused) {
      console.log('Email sending is paused');
      return new Response(
        JSON.stringify({ message: 'Email sending paused', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check quiet hours
    if (isWithinQuietHours(settings)) {
      console.log('Within quiet hours, skipping send');
      return new Response(
        JSON.stringify({ message: 'Within quiet hours', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check daily limit
    const canSendMore = await checkDailyLimit(supabase, settings);
    if (!canSendMore) {
      console.log('Daily send limit reached');
      return new Response(
        JSON.stringify({ message: 'Daily limit reached', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate remaining capacity for this batch
    const remainingCapacity = settings.daily_send_limit 
      ? Math.min(50, settings.daily_send_limit) 
      : 50;

    // Get pending emails that are due to be sent
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', 3)
      .order('scheduled_for', { ascending: true })
      .limit(remainingCapacity)

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

        // Enhanced tracking and content processing
        let finalHtmlContent = email.html_content;

        // Add click tracking if enabled
        if (settings.click_tracking_enabled !== false) {
          finalHtmlContent = rewriteLinksForTracking(finalHtmlContent, email.id, emailSigningSecret, baseUrl);
        }

        // Add open tracking pixel if enabled
        if (settings.open_tracking_enabled !== false) {
          const openTrackingUrl = `${baseUrl}/functions/v1/email-open?t=${btoa(JSON.stringify({ emailId: email.id, secret: emailSigningSecret }))}`;
          const trackingPixel = `<img src="${openTrackingUrl}" width="1" height="1" style="display:none;" alt="">`;
          finalHtmlContent += trackingPixel;
        }

        // Add unsubscribe link
        const unsubscribeUrl = `${baseUrl}/functions/v1/email-unsubscribe?t=${btoa(JSON.stringify({ email: email.recipient_email, secret: emailSigningSecret }))}`;
        const unsubscribeLink = `<div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>${settings.from_name || 'One Système'} - Solutions d'automatisation pour entreprises québécoises</p>
          <p><a href="${unsubscribeUrl}" style="color: #666;">Se désabonner</a></p>
        </div>`;
        
        finalHtmlContent += unsubscribeLink;

        // Send email via Resend with proper sender info
        const fromAddress = settings.reply_to 
          ? `${settings.from_name} <${settings.from_email}>` 
          : `${settings.from_name} <${settings.from_email}>`;

        const emailResponse = await resend.emails.send({
          from: fromAddress,
          to: [email.recipient_email],
          subject: email.subject,
          html: finalHtmlContent,
          reply_to: settings.reply_to || settings.from_email,
        });

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

        // Calculate next retry time with exponential backoff
        const nextRetryDelay = Math.min(30 * Math.pow(2, email.attempts), 1440); // Max 24 hours
        const nextScheduledFor = new Date(Date.now() + nextRetryDelay * 60000).toISOString();

        // Update attempts and error message
        await supabase
          .from('email_queue')
          .update({ 
            attempts: email.attempts + 1,
            error_message: emailError.message,
            status: email.attempts + 1 >= email.max_attempts ? 'failed' : 'pending',
            scheduled_for: email.attempts + 1 >= email.max_attempts ? email.scheduled_for : nextScheduledFor,
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