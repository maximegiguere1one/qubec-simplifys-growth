import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizResultsRequest {
  leadId: string;
  totalScore: number;
  timeSpent: number;
  answers: Record<number, string>;
  diagnostic: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

const generatePersonalizedEmail = (data: QuizResultsRequest) => {
  const { contactInfo, totalScore, diagnostic, answers } = data;
  const firstName = contactInfo.name.split(' ')[0];
  
  // Get main priority from first answer
  const priorities = {
    'inventory': 'Gestion d\'inventaire',
    'billing': 'Facturation automatisée',
    'hr': 'Gestion des employés',
    'projects': 'Suivi de projets',
    'crm': 'Gestion clients'
  };
  
  const mainPriority = priorities[answers[0] as keyof typeof priorities] || 'Système sur mesure';
  
  let scoreSegment = "";
  let nextSteps = "";
  let urgencyLevel = "";
  
  if (totalScore >= 16) {
    scoreSegment = "🎯 PROFIL HAUTE PRIORITÉ";
    nextSteps = "Votre situation nécessite une solution immédiate. Nous pourrions créer votre système en 4-6 semaines.";
    urgencyLevel = "URGENT - Ne perdez pas une minute de plus !";
  } else if (totalScore >= 12) {
    scoreSegment = "✨ CANDIDAT IDÉAL";
    nextSteps = "Vous êtes parfait pour une solution sur mesure. Développement estimé: 6-8 semaines.";
    urgencyLevel = "Agissez maintenant pour transformer votre quotidien";
  } else if (totalScore >= 8) {
    scoreSegment = "💡 BON POTENTIEL";
    nextSteps = "Un système personnalisé vous donnerait un avantage concurrentiel majeur.";
    urgencyLevel = "L'opportunité est là, saisissez-la";
  } else {
    scoreSegment = "👌 BIEN ORGANISÉ";
    nextSteps = "Même bien organisé, vous pourriez gagner encore plus de temps avec du sur mesure.";
    urgencyLevel = "Passez à l'étape suivante de votre croissance";
  }
  
  return {
    subject: `${firstName}, votre diagnostic personnalisé est prêt ! [${scoreSegment}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Votre diagnostic personnalisé - One Système</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">One Système</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Votre transformation commence ici</p>
        </div>

        <h2 style="color: #667eea; font-size: 24px; margin-bottom: 20px;">Bonjour ${firstName} ! 👋</h2>
        
        <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin: 0 0 10px; color: #667eea; font-size: 18px;">${scoreSegment}</h3>
          <p style="margin: 0; font-size: 16px; font-weight: 500;">${diagnostic}</p>
        </div>

        <h3 style="color: #333; font-size: 20px; margin-top: 30px;">📊 Votre analyse détaillée :</h3>
        <ul style="background: #fafafa; padding: 20px; border-radius: 5px; margin: 15px 0;">
          <li style="margin-bottom: 10px;"><strong>Priorité identifiée :</strong> ${mainPriority}</li>
          <li style="margin-bottom: 10px;"><strong>Score d'urgence :</strong> ${totalScore}/20 points</li>
          <li style="margin-bottom: 10px;"><strong>Temps passé dans l'analyse :</strong> ${Math.floor(data.timeSpent / 60)}:${(data.timeSpent % 60).toString().padStart(2, '0')}</li>
          <li><strong>Potentiel d'économie de temps :</strong> ${totalScore >= 16 ? '15-20h/semaine' : totalScore >= 12 ? '10-15h/semaine' : totalScore >= 8 ? '6-10h/semaine' : '3-5h/semaine'}</li>
        </ul>

        <h3 style="color: #333; font-size: 20px; margin-top: 30px;">🚀 Vos prochaines étapes :</h3>
        <p style="font-size: 16px; margin-bottom: 20px;">${nextSteps}</p>

        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 25px; border-radius: 10px; text-align: center; margin: 30px 0;">
          <h3 style="margin: 0 0 15px; font-size: 20px;">⚡ ${urgencyLevel}</h3>
          <p style="margin: 0 0 20px; font-size: 16px;">Découvrez comment nous pourrions transformer votre entreprise en 30 jours :</p>
          <a href="https://lbwjesrgernvjiorktia.lovableproject.com/vsl" style="display: inline-block; background: white; color: #ee5a24; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">🎥 Voir ma solution personnalisée</a>
        </div>

        <!-- Guarantee Block -->
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 32px; margin: 24px 0; text-align: center;">
          <div style="background: #3b82f6; color: white; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 16px;">
            🔐 GARANTIE ULTRA-MESURABLE
          </div>
          <h2 style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 16px 0; line-height: 1.3;">
            Je te garantis que tu vas gagner au moins 10 heures par mois, sinon je te rembourse + je te vire 1 000 $
          </h2>
          <p style="color: #3b82f6; font-size: 18px; font-weight: bold; margin: 16px 0;">
            🔐 Tu gagnes du temps, ou tu gagnes de l'argent.
          </p>
          <div style="background: rgba(255,255,255,0.8); border-radius: 8px; padding: 20px; margin: 16px 0;">
            <p style="color: #374151; margin: 0; line-height: 1.5;">
              Je te garantis que tu ne te sentiras plus jamais mêlé, désorganisé ou dépassé.<br>
              <strong style="color: #3b82f6;">Et en plus, tu vas gagner au moins 10 heures par mois, dès le premier mois.</strong>
            </p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0;">
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; text-align: left;">
              <h3 style="color: #dc2626; font-weight: bold; margin: 0 0 8px 0;">❌ Sinon ?</h3>
              <ul style="margin: 0; padding-left: 16px; color: #374151;">
                <li>Je te rembourse chaque dollar</li>
                <li><strong>Et je te vire 1 000 $ cash</strong></li>
              </ul>
            </div>
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 16px; text-align: left;">
              <h3 style="color: #16a34a; font-weight: bold; margin: 0 0 8px 0;">✅ Aucun risque</h3>
              <p style="margin: 0; color: #374151; font-size: 14px;">
                Paiement basé uniquement sur les économies réelles mesurées
              </p>
            </div>
          </div>
          <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 20px; margin: 16px 0;">
            <p style="color: #3b82f6; font-weight: bold; margin: 0 0 8px 0;">
              👉 Tu gagnes du temps ou tu repars payé.
            </p>
            <p style="color: #6b7280; margin: 0;">
              Clique ci-dessous pour voir ce que ça peut changer dans ta business.
            </p>
          </div>
          <a href="https://lbwjesrgernvjiorktia.lovableproject.com/vsl" 
             style="display: inline-block; background: #3b82f6; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            📞 Voir la vidéo complète
          </a>
        </div>

        <h3 style="color: #333; font-size: 18px; margin-top: 30px;">💡 Pourquoi choisir One Système ?</h3>
        <div style="background: #f0f8ff; padding: 20px; border-radius: 5px; margin: 15px 0;">
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">✅ <strong>Solutions 100% québécoises</strong> - Conformes TPS/TVQ</li>
            <li style="margin-bottom: 8px;">✅ <strong>Développement sur mesure</strong> - Exactement ce dont vous avez besoin</li>
            <li style="margin-bottom: 8px;">✅ <strong>Support en français</strong> - Équipe basée au Québec</li>
            <li style="margin-bottom: 8px;">✅ <strong>ROI garanti</strong> - Vous économisez plus que ça vous coûte</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          <p style="font-size: 16px; margin-bottom: 20px;">Prêt à reprendre le contrôle de votre temps ?</p>
          <a href="https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">📞 Réserver ma consultation gratuite</a>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>Cet email vous a été envoyé car vous avez complété notre analyse gratuite sur <a href="https://lbwjesrgernvjiorktia.lovableproject.com" style="color: #667eea;">One Système</a></p>
          <p style="margin-top: 10px;">One Système - Solutions sur mesure pour entrepreneurs québécois</p>
        </div>
      </body>
      </html>
    `
  };
};

// Fonction pour logger dans la nouvelle table
const logEmailDelivery = async (
  supabase: any,
  leadId: string,
  emailType: string,
  recipientEmail: string,
  subject: string,
  status: string,
  providerResponse?: any,
  errorMessage?: string
) => {
  try {
    await supabase.from('email_delivery_logs').insert({
      lead_id: leadId,
      email_type: emailType,
      recipient_email: recipientEmail,
      subject: subject,
      status: status,
      provider_response: providerResponse,
      error_message: errorMessage
    });
  } catch (error) {
    console.error('Failed to log email delivery:', error);
  }
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

  // Créer le client Supabase AVANT le try-catch principal
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let data: QuizResultsRequest;
  
  try {
    data = await req.json();
  } catch (error) {
    console.error('❌ Failed to parse JSON request:', error);
    return new Response(JSON.stringify({ 
      error: 'Invalid JSON request',
      success: false
    }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders 
      },
    });
  }

  // Validation des champs requis avec logging détaillé
  const requiredFields = ['leadId', 'contactInfo'];
  const missingFields = requiredFields.filter(field => !data[field as keyof QuizResultsRequest]);
  
  if (missingFields.length > 0 || !data.contactInfo?.email || !data.contactInfo?.name) {
    const errorMsg = `Missing required fields: ${missingFields.join(', ')}${!data.contactInfo?.email ? ', email' : ''}${!data.contactInfo?.name ? ', name' : ''}`;
    console.error('❌ Validation failed:', errorMsg);
    
    // Log l'erreur même sans leadId
    if (data.leadId) {
      await logEmailDelivery(
        supabase,
        data.leadId,
        'quiz_confirmation',
        data.contactInfo?.email || 'unknown',
        'Validation Error',
        'failed',
        null,
        errorMsg
      );
    }
    
    return new Response(JSON.stringify({ 
      error: errorMsg,
      success: false
    }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders 
      },
    });
  }

  console.log('🚀 Processing quiz confirmation email for:', {
    email: data.contactInfo.email,
    name: data.contactInfo.name,
    leadId: data.leadId,
    score: data.totalScore,
    timeSpent: data.timeSpent
  });

  // Vérifier que Resend API key est configurée
  if (!Deno.env.get("RESEND_API_KEY")) {
    const errorMsg = "RESEND_API_KEY not configured";
    console.error('❌ Configuration error:', errorMsg);
    
    await logEmailDelivery(
      supabase,
      data.leadId,
      'quiz_confirmation',
      data.contactInfo.email,
      'Configuration Error',
      'failed',
      null,
      errorMsg
    );
    
    return new Response(JSON.stringify({ 
      error: errorMsg,
      success: false
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders 
      },
    });
  }

  try {
    // Récupérer les paramètres email depuis la base de données
    console.log('⚙️ Fetching email settings...');
    const { data: emailSettings, error: settingsError } = await supabase
      .from('email_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error('❌ Failed to fetch email settings:', settingsError);
      throw new Error('Failed to load email configuration');
    }

    // Valeurs par défaut si pas de paramètres configurés
    const fromName = emailSettings?.from_name || 'One Système';
    const fromEmail = emailSettings?.from_email || 'onboarding@resend.dev';
    const replyTo = emailSettings?.reply_to || 'info@onesysteme.com';

    // Vérification du domaine pour éviter l'erreur 403
    const isDomainVerified = fromEmail !== 'onboarding@resend.dev' && !fromEmail.includes('@resend.dev');
    
    if (!isDomainVerified && data.contactInfo.email !== 'maxime@agence1.com') {
      console.warn('⚠️ Using sandbox mode - only sending to verified addresses');
      await logEmailDelivery(
        supabase,
        data.leadId,
        'quiz_confirmation',
        data.contactInfo.email,
        'Domain Not Verified',
        'failed',
        null,
        'Domain not verified in Resend. Please verify your sending domain or use maxime@agence1.com for testing.'
      );
      
      throw new Error('Domain not verified. Please verify your sending domain in Resend or use maxime@agence1.com for testing.');
    }

    // Générer le contenu de l'email
    console.log('📧 Generating personalized email content...');
    const emailContent = generatePersonalizedEmail(data);

    // Envoyer l'email via Resend
    console.log('📤 Sending email via Resend...', { from: `${fromName} <${fromEmail}>`, to: data.contactInfo.email });
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      reply_to: replyTo,
      to: [data.contactInfo.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log('✅ Email sent successfully:', {
      emailId: emailResponse.id,
      recipient: data.contactInfo.email,
      subject: emailContent.subject
    });

    // Logger le succès dans la nouvelle table
    await logEmailDelivery(
      supabase,
      data.leadId,
      'quiz_confirmation',
      data.contactInfo.email,
      emailContent.subject,
      'sent',
      emailResponse
    );

    // Logger dans l'ancienne table pour compatibilité
    await supabase.from('email_events').insert({
      lead_id: data.leadId,
      email_id: emailResponse.id || 'unknown',
      action: 'sent'
    });

    // Mettre à jour la table leads avec les résultats du quiz
    console.log('📊 Updating lead with quiz results...');
    const { error: updateError } = await supabase.from('leads').update({
      score: data.totalScore,
      scoring_data: {
        answers: data.answers,
        diagnostic: data.diagnostic,
        time_spent: data.timeSpent,
        completed_at: new Date().toISOString()
      },
      segment: data.totalScore >= 16 ? 'hot' : data.totalScore >= 12 ? 'warm' : 'cold'
    }).eq('id', data.leadId);

    if (updateError) {
      console.warn('⚠️ Failed to update lead:', updateError);
    } else {
      console.log('✅ Lead updated successfully');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.id,
      message: "Quiz confirmation email sent successfully",
      recipient: data.contactInfo.email,
      subject: emailContent.subject
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Error in send-quiz-confirmation function:", {
      message: error.message,
      stack: error.stack,
      leadId: data.leadId,
      email: data.contactInfo.email
    });
    
    // Logger l'erreur dans la nouvelle table
    await logEmailDelivery(
      supabase,
      data.leadId,
      'quiz_confirmation',
      data.contactInfo.email,
      'Email Send Error',
      'failed',
      null,
      error.message
    );
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      success: false,
      leadId: data.leadId,
      email: data.contactInfo.email
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