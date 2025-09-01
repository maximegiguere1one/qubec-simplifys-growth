import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('t')

  if (!token) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erreur</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1 class="error">Erreur</h1>
        <p>Lien de désabonnement invalide.</p>
      </body>
      </html>
    `, {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Decode the token
    const decoded = JSON.parse(atob(token))
    const { email, secret } = decoded

    // Verify the secret
    if (secret !== Deno.env.get('EMAIL_SIGNING_SECRET')) {
      throw new Error('Invalid token')
    }

    console.log(`Unsubscribe request for: ${email}`)

    // Check if already unsubscribed
    const { data: existing } = await supabase
      .from('email_unsubscribes')
      .select('id')
      .eq('email', email)
      .single()

    if (!existing) {
      // Add to unsubscribe list
      const { error } = await supabase
        .from('email_unsubscribes')
        .insert({
          email: email,
          unsubscribed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error adding unsubscribe:', error)
        throw error
      }
    }

    // Cancel any pending emails for this user
    await supabase
      .from('email_queue')
      .update({ 
        status: 'cancelled',
        error_message: 'User unsubscribed',
        updated_at: new Date().toISOString()
      })
      .eq('recipient_email', email)
      .eq('status', 'pending')

    console.log(`Successfully unsubscribed: ${email}`)

    // Return success page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Désabonnement confirmé</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px; 
            background: #f9fafb;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
          }
          .success { color: #059669; }
          .checkmark {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #059669;
            color: white;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin-bottom: 20px;
          }
          p { color: #6b7280; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✓</div>
          <h1 class="success">Désabonnement confirmé</h1>
          <p>Votre adresse email <strong>${email}</strong> a été retirée de notre liste de diffusion.</p>
          <p>Vous ne recevrez plus d'emails de notre part.</p>
          <p>Si vous changez d'avis, vous pouvez toujours vous réinscrire via notre site web.</p>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })

  } catch (error) {
    console.error('Error processing unsubscribe:', error)
    
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erreur</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1 class="error">Erreur</h1>
        <p>Une erreur est survenue lors du traitement de votre demande de désabonnement.</p>
        <p>Veuillez réessayer plus tard ou nous contacter directement.</p>
      </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
})