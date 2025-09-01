import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnqueueRequest {
  leadId: string
  quizScore: number
  segment: 'qualified' | 'hot' | 'warm' | 'cold'
  leadName: string
  leadEmail: string
}

// Templates d'emails français mis à jour avec contenu axé sur la valeur
const emailSequences = {
  qualified: [
    {
      id: 'qualified-1',
      subject: '🎯 Analyse complétée - {{score}}% de potentiel d\'optimisation détecté',
      delay: 0,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(220, 70%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">One Système</h1>
            <p style="color: hsl(220, 70%, 85%); margin: 8px 0 0 0; font-size: 14px;">Simplifiez. Automatisez. Prospérez.</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(220, 70%, 20%);">Excellentes nouvelles, {{name}} !</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Votre évaluation révèle un potentiel d'optimisation de {{score}}%. Les entreprises similaires qui automatisent leurs processus économisent en moyenne 15h par semaine et réduisent leurs erreurs de 70%.
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">📊 VOTRE PROFIL D'OPTIMISATION :</h3>
              <ul style="margin: 0; color: hsl(220, 10%, 40%);">
                <li>Temps récupérable : 15-20 heures/semaine</li>
                <li>Réduction d'erreurs possible : 85%</li>
                <li>ROI estimé : 340% sur 12 mois</li>
                <li>Votre consultation stratégique personnalisée (valeur 500$) est prête</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{booking_url}}" style="background: hsl(220, 70%, 50%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                Réserver ma consultation stratégique →
              </a>
            </div>
            
            <div style="background: hsl(220, 10%, 95%); padding: 16px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; color: hsl(220, 10%, 50%); text-align: center;">
                Durant ces 30 minutes : Audit express • Plan d'automatisation prioritaire • Roadmap personnalisée
              </p>
            </div>
          </div>
        </div>
      `
    }
  ],
  hot: [
    {
      id: 'hot-1', 
      subject: 'Résultats de votre évaluation - Solutions adaptées pour {{name}}',
      delay: 0,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(220, 70%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">One Système</h1>
            <p style="color: hsl(220, 70%, 85%); margin: 8px 0 0 0; font-size: 14px;">Simplifiez. Automatisez. Prospérez.</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(220, 70%, 20%);">Voici vos opportunités d'amélioration, {{name}}</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Votre évaluation montre des opportunités concrètes d'optimisation (score: {{score}}%). Découvrez comment des entreprises similaires ont transformé leurs opérations en quelques semaines.
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">📊 CAS CLIENT SIMILAIRE :</h3>
              <ul style="margin: 0; color: hsl(220, 10%, 40%);">
                <li>Avant : 25h/semaine perdues dans la gestion manuelle</li>
                <li>Après : 10h/semaine, processus automatisés</li>
                <li>Résultat : +60% de productivité, équipe plus motivée</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{vsl_url}}" style="background: hsl(220, 70%, 50%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                Voir ma démonstration personnalisée →
              </a>
            </div>
          </div>
        </div>
      `
    }
  ],
  warm: [
    {
      id: 'warm-1',
      subject: 'Les 3 signes que vos systèmes vous coûtent cher',
      delay: 0,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(220, 70%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">One Système</h1>
            <p style="color: hsl(220, 70%, 85%); margin: 8px 0 0 0; font-size: 14px;">Simplifiez. Automatisez. Prospérez.</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(220, 70%, 20%);">Bonjour {{name}},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Merci d'avoir pris le temps d'évaluer vos processus actuels. Saviez-vous que 73% des PME québécoises perdent en moyenne 12h/semaine à cause de systèmes désorganisés ?
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">🔍 LES 3 SIGNES RÉVÉLATEURS :</h3>
              <div style="margin: 12px 0;">
                <p style="margin: 8px 0; color: hsl(220, 10%, 40%);"><strong>1️⃣ Vos employés posent les mêmes questions répétitives</strong><br>→ Information dispersée dans plusieurs outils</p>
                <p style="margin: 8px 0; color: hsl(220, 10%, 40%);"><strong>2️⃣ Vous découvrez des erreurs après coup</strong><br>→ Pas de contrôles automatiques</p>
                <p style="margin: 8px 0; color: hsl(220, 10%, 40%);"><strong>3️⃣ Les rapports prennent des heures à préparer</strong><br>→ Données non-centralisées</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{resources_url}}" style="background: hsl(220, 70%, 50%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                Télécharger le guide gratuit →
              </a>
            </div>
            
            <div style="background: hsl(220, 10%, 95%); padding: 16px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; color: hsl(220, 10%, 50%); text-align: center;">
                📖 "Le Guide du Chef d'Entreprise : 10 Automatisations Rapides" - Spécialement conçu pour les entreprises québécoises
              </p>
            </div>
          </div>
        </div>
      `
    }
  ],
  cold: [
    {
      id: 'cold-1',
      subject: 'Pourquoi les entreprises québécoises choisissent l\'automatisation',
      delay: 0,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(220, 70%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">One Système</h1>
            <p style="color: hsl(220, 70%, 85%); margin: 8px 0 0 0; font-size: 14px;">Simplifiez. Automatisez. Prospérez.</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(220, 70%, 20%);">Bonjour {{name}},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              L'automatisation n'est plus un luxe - c'est devenu essentiel pour rester compétitif. Au Québec, les entreprises qui automatisent leurs processus croissent 2.3x plus vite que leurs concurrents.
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">🎯 TENDANCES 2024 AU QUÉBEC :</h3>
              <ul style="margin: 0; color: hsl(220, 10%, 40%);">
                <li>✅ 67% des PME prévoient d'automatiser cette année</li>
                <li>✅ ROI moyen : 340% sur 18 mois</li>
                <li>✅ Temps de récupération : 4-6 mois</li>
                <li>✅ Employés 40% plus engagés</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{quiz_url}}" style="background: hsl(220, 70%, 50%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                Découvrir les tendances 2024 →
              </a>
            </div>
          </div>
        </div>
      `
    }
  ]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { leadId, quizScore, segment, leadName, leadEmail }: EnqueueRequest = await req.json()

    console.log(`Enqueuing email sequence for lead ${leadId}, segment: ${segment}`)

    // Get the appropriate email sequence
    const sequence = emailSequences[segment] || emailSequences.cold
    const bookingUrl = 'https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite'
    const vslUrl = 'https://lbwjesrgernvjiorktia.supabase.co/vsl'
    const resourcesUrl = 'https://lbwjesrgernvjiorktia.supabase.co/agents'
    const quizUrl = 'https://lbwjesrgernvjiorktia.supabase.co/quiz'

    // Send immediate email (delay = 0) via Resend, queue others
    const resend = new (await import("npm:resend@4.0.0")).Resend(Deno.env.get('RESEND_API_KEY'))
    
    for (const email of sequence) {
      const scheduledFor = new Date()
      scheduledFor.setHours(scheduledFor.getHours() + email.delay)

      // Personalize content
      const personalizedSubject = email.subject
        .replace(/{{name}}/g, leadName)
        .replace(/{{score}}/g, quizScore.toString())

      const personalizedContent = email.content
        .replace(/{{name}}/g, leadName)
        .replace(/{{score}}/g, quizScore.toString())
        .replace(/{{booking_url}}/g, bookingUrl)
        .replace(/{{vsl_url}}/g, vslUrl)
        .replace(/{{resources_url}}/g, resourcesUrl)
        .replace(/{{quiz_url}}/g, quizUrl)

      // Send immediate emails (delay = 0) directly via Resend
      if (email.delay === 0) {
        try {
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'One Système <noreply@resend.dev>',
            to: [leadEmail],
            subject: personalizedSubject,
            html: personalizedContent,
          })
          
          if (emailError) {
            console.error(`Error sending immediate email ${email.id}:`, emailError)
            // Fall back to queueing if direct send fails
          } else {
            console.log(`Immediate email ${email.id} sent successfully:`, emailData)
            // Log successful delivery
            await supabase
              .from('email_delivery_logs')
              .insert({
                lead_id: leadId,
                recipient_email: leadEmail,
                email_type: email.id,
                subject: personalizedSubject,
                status: 'sent',
                provider_response: emailData
              })
            continue // Skip queueing for successfully sent immediate emails
          }
        } catch (error) {
          console.error(`Failed to send immediate email ${email.id}:`, error)
          // Fall through to queue the email
        }
      }

      // Queue email (for delayed emails or failed immediate sends)
      const { error } = await supabase
        .from('email_queue')
        .insert({
          lead_id: leadId,
          recipient_email: leadEmail,
          email_type: email.id,
          subject: personalizedSubject,
          html_content: personalizedContent,
          scheduled_for: scheduledFor.toISOString(),
          status: 'pending'
        })

      if (error) {
        console.error(`Error enqueuing email ${email.id}:`, error)
        throw error
      }
    }

    // Log the sequence trigger
    await supabase
      .from('email_sequence_triggers')
      .insert({
        lead_id: leadId,
        sequence_id: segment
      })

    console.log(`Successfully enqueued ${sequence.length} emails for lead ${leadId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsEnqueued: sequence.length,
        segment 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in enqueue-email-sequence:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})