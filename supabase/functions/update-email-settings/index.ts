
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailSettingsUpdate {
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  default_sequence?: string;
  sending_paused?: boolean;
  daily_send_limit?: number;
  test_recipient?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { settings }: { settings: EmailSettingsUpdate } = await req.json()

    console.log('Updating email settings:', settings)

    // Validation des champs requis
    if (settings.from_email && !settings.from_email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Email format invalide' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Vérifier si des paramètres existent
    const { data: existing } = await supabase
      .from('email_settings')
      .select('id')
      .limit(1)
      .single()

    let result;
    
    if (existing) {
      // Mise à jour
      const { data, error } = await supabase
        .from('email_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Création
      const { data, error } = await supabase
        .from('email_settings')
        .insert({
          ...settings,
          from_email: settings.from_email || 'noreply@onesysteme.ca'
        })
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('Erreur Supabase:', result.error)
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Paramètres email mis à jour avec succès')

    return new Response(
      JSON.stringify({ 
        success: true,
        settings: result.data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
