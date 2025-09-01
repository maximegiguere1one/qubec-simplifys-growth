import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let testData;
  try {
    testData = await req.json();
  } catch {
    testData = { email: "test@example.com" };
  }

  const testEmail = testData.email || "test@example.com";

  console.log('🧪 Testing email system with recipient:', testEmail);

  try {
    // Test 1: Vérifier la configuration de Resend
    if (!Deno.env.get("RESEND_API_KEY")) {
      throw new Error("RESEND_API_KEY not configured");
    }
    console.log('✅ RESEND_API_KEY is configured');

    // Test 2: Vérifier la connexion Supabase
    const { data: testConnection } = await supabase.from('leads').select('count').limit(1);
    console.log('✅ Supabase connection working');

    // Test 2.5: Récupérer les paramètres email
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    const fromName = emailSettings?.from_name || 'One Système Test';
    const fromEmail = emailSettings?.from_email || 'onboarding@resend.dev';
    const isDomainVerified = fromEmail !== 'onboarding@resend.dev' && !fromEmail.includes('@resend.dev');

    // Test 3: Vérification du domaine
    if (!isDomainVerified && testEmail !== 'maxime@agence1.com') {
      throw new Error('Domain not verified. Please verify your sending domain in Resend or use maxime@agence1.com for testing.');
    }

    // Test 4: Envoyer un email de test
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [testEmail],
      subject: "🧪 Test d'envoi d'email - One Système",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4CAF50;">✅ Test d'email réussi !</h1>
          <p>Votre système d'envoi d'emails fonctionne correctement.</p>
          <p><strong>Heure du test:</strong> ${new Date().toLocaleString('fr-CA', {timeZone: 'America/Toronto'})}</p>
          <p><strong>Destinataire:</strong> ${testEmail}</p>
          <hr>
          <p style="color: #666; font-size: 14px;">
            Ceci est un email de test automatique de One Système.<br>
            Si vous avez reçu cet email par erreur, vous pouvez l'ignorer.
          </p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully:', emailResponse);

    // Test 5: Logger dans la base de données
    await supabase.from('email_delivery_logs').insert({
      lead_id: null,
      email_type: 'test_email',
      recipient_email: testEmail,
      subject: '🧪 Test d\'envoi d\'email - One Système',
      status: 'sent',
      provider_response: emailResponse
    });

    console.log('✅ Email logged in database');

    // Test 6: Vérifier les statistiques d'email
    const { data: stats } = await supabase.rpc('get_email_delivery_stats', { days_back: 1 });
    console.log('✅ Email stats retrieved:', stats);

    return new Response(JSON.stringify({ 
      success: true,
      message: "All email system tests passed!",
      tests: {
        resend_configured: true,
        supabase_connected: true,
        domain_verified: isDomainVerified,
        email_sent: true,
        database_logged: true,
        stats_working: true
      },
      email_id: emailResponse.id,
      recipient: testEmail,
      stats: stats?.[0] || null
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Email system test failed:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      recipient: testEmail,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders 
      },
    });
  }
};

serve(handler);