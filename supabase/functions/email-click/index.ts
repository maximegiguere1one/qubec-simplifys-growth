import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const url = new URL(req.url)
  const token = url.searchParams.get('t')
  const targetUrl = url.searchParams.get('url')

  if (!token || !targetUrl) {
    return new Response('Invalid request', { status: 400 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Decode the tracking token
    const decoded = JSON.parse(atob(token))
    const { emailId, secret } = decoded

    // Verify the secret
    if (secret !== Deno.env.get('EMAIL_SIGNING_SECRET')) {
      console.log('Invalid tracking secret')
      return new Response('Invalid token', { status: 400 })
    }

    console.log(`Email link clicked: ${emailId}, target: ${targetUrl}`)

    // Log the email click event with URL tracking
    await supabase
      .from('email_events')
      .insert({
        email_id: emailId,
        action: 'clicked',
        timestamp: new Date().toISOString(),
        event_data: { 
          target_url: decodeURIComponent(targetUrl),
          user_agent: req.headers.get('user-agent') || null,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null
        }
      })

    // Redirect to the target URL
    return new Response(null, {
      status: 302,
      headers: {
        'Location': decodeURIComponent(targetUrl)
      }
    })

  } catch (error) {
    console.error('Error tracking email click:', error)
    
    // Still redirect to target URL even on tracking error
    return new Response(null, {
      status: 302,
      headers: {
        'Location': decodeURIComponent(targetUrl || 'https://example.com')
      }
    })
  }
})