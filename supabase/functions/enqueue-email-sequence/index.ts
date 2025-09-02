import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnqueueRequest {
  leadId?: string | null
  quizScore: number
  segment: 'qualified' | 'hot' | 'warm' | 'cold'
  leadName: string
  leadEmail: string
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Séquences d'emails de conversion optimales avec design professionnel
const emailSequences = {
  qualified: [
    {
      id: 'qualified-1',
      subject: '🎯 {{name}}, votre analyse révèle {{score}}% d\'optimisation possible',
      delay: 0,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(220, 70%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">One Système</h1>
            <p style="color: hsl(220, 70%, 85%); margin: 8px 0 0 0; font-size: 14px;">Simplifiez. Automatisez. Prospérez.</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(220, 70%, 20%);">EXCELLENTES NOUVELLES, {{name}} !</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Votre évaluation révèle un potentiel d'optimisation de {{score}}%.
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">📊 VOTRE PROFIL D'OPTIMISATION PRIORITAIRE :</h3>
              <ul style="margin: 0; color: hsl(220, 10%, 40%);">
                <li>• Temps récupérable : 15-20 heures/semaine</li>
                <li>• Réduction d'erreurs : jusqu'à 85%</li>
                <li>• ROI projeté : 340% sur 12 mois</li>
                <li>• Priorité : HAUTE (consultation urgente recommandée)</li>
              </ul>
            </div>
            
            <div style="background: hsl(142, 76%, 95%); border: 1px solid hsl(142, 76%, 85%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(142, 76%, 30%);">🎁 VOTRE CONSULTATION STRATÉGIQUE (500$ → GRATUITE)</h3>
              <ul style="margin: 0; color: hsl(142, 10%, 40%);">
                <li>✓ Audit express : identification des gains rapides</li>
                <li>✓ Plan d'action prioritaire : les 3 automatisations les plus rentables</li>
                <li>✓ Roadmap personnalisée : timeline et budget réalistes</li>
                <li>✓ Garantie résultats : amélioration visible en 14 jours</li>
              </ul>
            </div>
            
            <div style="background: hsl(0, 75%, 95%); border: 1px solid hsl(0, 75%, 85%); border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: hsl(0, 75%, 40%); font-weight: 600;">
                ⏰ PLACES LIMITÉES cette semaine : Seulement 3 créneaux disponibles.
              </p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{booking_url}}" style="background: hsl(220, 70%, 50%); color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 8px; font-size: 18px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px hsl(220, 70%, 50% / 0.3);">
                🚀 Réserver ma consultation PRIORITAIRE
              </a>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'qualified-2',
      subject: '⚠️ {{name}}, votre créneau de consultation expire dans 24h',
      delay: 24,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(0, 75%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">⚠️ URGENT - One Système</h1>
            <p style="color: hsl(0, 75%, 85%); margin: 8px 0 0 0; font-size: 14px;">Consultation expire dans 24h</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(0, 75%, 40%);">{{name}}, DERNIÈRES HEURES !</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Votre consultation stratégique PRIORITAIRE (valeur 500$) expire dans 24h.
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">⏰ RAPPEL DE VOS GAINS IDENTIFIÉS :</h3>
              <ul style="margin: 0; color: hsl(220, 10%, 40%);">
                <li>• Score d'optimisation : {{score}}%</li>
                <li>• Temps récupérable : 15-20h/semaine</li>
                <li>• Économies annuelles projetées : 45,000$ - 67,000$</li>
              </ul>
            </div>
            
            <div style="background: hsl(0, 75%, 95%); border: 2px solid hsl(0, 75%, 60%); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: hsl(0, 75%, 40%); font-weight: 600;">
                🔥 URGENCE : Plus que 2 places disponibles cette semaine.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: hsl(0, 75%, 50%);">
                Après cette date, prochaine disponibilité dans 3 semaines (500$).
              </p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{booking_url}}" style="background: hsl(0, 75%, 50%); color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 8px; font-size: 18px; font-weight: 700; display: inline-block; animation: pulse 2s infinite;">
                ⚡ RÉSERVER MAINTENANT (expire dans 24h)
              </a>
            </div>
          </div>
        </div>
      `
    }
  ],
  hot: [
    {
      id: 'hot-1', 
      subject: '{{name}}, comment des PME économisent 15h/semaine',
      delay: 2,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(220, 70%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">One Système</h1>
            <p style="color: hsl(220, 70%, 85%); margin: 8px 0 0 0; font-size: 14px;">Simplifiez. Automatisez. Prospérez.</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(220, 70%, 20%);">Bonjour {{name}},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Merci d'avoir complété notre évaluation (score: {{score}}%) !<br>
              Votre profil correspond exactement à nos clients les plus satisfaits.
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">📊 CAS CLIENT - Entreprise similaire :</h3>
              <ul style="margin: 0; color: hsl(220, 10%, 40%);">
                <li>• AVANT : 25h/semaine perdues en gestion manuelle</li>
                <li>• APRÈS : 10h/semaine, processus fluides</li>
                <li>• RÉSULTAT : +150% productivité, équipe motivée</li>
              </ul>
            </div>
            
            <div style="background: hsl(142, 76%, 95%); border: 1px solid hsl(142, 76%, 85%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(142, 76%, 30%);">🎯 VOS GAINS POTENTIELS IDENTIFIÉS :</h3>
              <ul style="margin: 0; color: hsl(142, 10%, 40%);">
                <li>• Gestion administrative → 80% automatisée</li>
                <li>• Suivi clients → Intégration temps réel</li>
                <li>• Reporting → Tableaux de bord automatiques</li>
                <li>• Formation équipe → Processus standardisés</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{vsl_url}}" style="background: hsl(220, 70%, 50%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                🎥 Voir MA démonstration personnalisée
              </a>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'hot-2',
      subject: '⚡ Résultats garantis en 2 semaines ou remboursé',
      delay: 48,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(220, 70%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">One Système</h1>
            <p style="color: hsl(220, 70%, 85%); margin: 8px 0 0 0; font-size: 14px;">Garantie résultats ou remboursé</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(220, 70%, 20%);">{{name}}, question fréquente :</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              <strong>"Combien de temps pour voir des résultats ?"</strong><br>
              RÉPONSE : 2 semaines maximum. Garanti ou remboursé.
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">📅 NOTRE PROCESSUS EXPRESS PROUVÉ :</h3>
              <ul style="margin: 0; color: hsl(220, 10%, 40%);">
                <li>• Jour 1-3 : Analyse et configuration rapide</li>
                <li>• Jour 4-7 : Formation équipe (2h max)</li>
                <li>• Jour 8-14 : Premiers automatismes actifs</li>
                <li>• Résultats visibles : Semaine 2 garantie</li>
              </ul>
            </div>
            
            <div style="background: hsl(142, 76%, 95%); border: 2px solid hsl(142, 76%, 60%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(142, 76%, 30%);">🏆 GARANTIE RÉSULTATS (UNIQUE au Québec) :</h3>
              <ul style="margin: 0; color: hsl(142, 10%, 40%);">
                <li>✅ -50% erreurs administratives ou remboursement</li>
                <li>✅ +3h productives/jour/employé ou remboursement</li>
                <li>✅ Processus clairs pour 100% équipe ou remboursement</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{booking_url}}" style="background: hsl(142, 76%, 50%); color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 8px; font-size: 18px; font-weight: 700; display: inline-block;">
                🚀 DÉMARRER ma transformation EXPRESS
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
      subject: '{{name}}, les 3 signes que vos systèmes vous coûtent CHER',
      delay: 6,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(220, 70%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">One Système</h1>
            <p style="color: hsl(220, 70%, 85%); margin: 8px 0 0 0; font-size: 14px;">Simplifiez. Automatisez. Prospérez.</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(220, 70%, 20%);">Bonjour {{name}},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Merci d'avoir pris le temps d'évaluer vos processus.<br>
              <strong>STATISTIQUE ALARMANTE :</strong> 73% des PME québécoises perdent 12h/semaine à cause de systèmes mal organisés.
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">🔍 LES 3 SIGNES QUI NE MENTENT PAS :</h3>
              <div style="margin: 12px 0;">
                <p style="margin: 8px 0; color: hsl(220, 10%, 40%);"><strong>1️⃣ VOS EMPLOYÉS</strong> vous posent les mêmes questions chaque semaine<br>→ Diagnostic : Information éparpillée dans 5-6 outils différents</p>
                <p style="margin: 8px 0; color: hsl(220, 10%, 40%);"><strong>2️⃣ VOUS DÉCOUVREZ</strong> des erreurs importantes après-coup<br>→ Diagnostic : Aucun système de vérification automatique</p>
                <p style="margin: 8px 0; color: hsl(220, 10%, 40%);"><strong>3️⃣ VOS RAPPORTS</strong> prennent des heures à préparer<br>→ Diagnostic : Données dispersées, saisies manuelles multiples</p>
              </div>
            </div>
            
            <div style="background: hsl(0, 75%, 95%); border: 1px solid hsl(0, 75%, 85%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(0, 75%, 30%);">💰 COÛT RÉEL de ces problèmes :</h3>
              <ul style="margin: 0; color: hsl(0, 10%, 40%);">
                <li>• Temps perdu : 12-18h/semaine (18,000$/an en salaire)</li>
                <li>• Erreurs coûteuses : 5,000-15,000$/an en moyenne</li>
                <li>• Stress équipe : turnover +40% vs entreprises organisées</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{resources_url}}" style="background: hsl(220, 70%, 50%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                📊 TÉLÉCHARGER le guide (gratuit)
              </a>
            </div>
            
            <div style="background: hsl(220, 10%, 95%); padding: 16px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; color: hsl(220, 10%, 50%); text-align: center;">
                📖 "Le Guide du Chef d'Entreprise : 10 Automatisations Rapides"<br>Spécialement adapté aux PME québécoises
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
      subject: '{{name}}, pourquoi 67% des PME québécoises automatisent en 2024',
      delay: 12,
      content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: hsl(220, 70%, 50%); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">One Système</h1>
            <p style="color: hsl(220, 70%, 85%); margin: 8px 0 0 0; font-size: 14px;">Tendances d'automatisation 2024</p>
          </div>
          
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0; color: hsl(220, 70%, 20%);">Bonjour {{name}},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              <strong>Révolution silencieuse</strong> dans les PME québécoises : l'automatisation devient la norme.
            </p>
            
            <div style="background: hsl(220, 70%, 98%); border: 1px solid hsl(220, 70%, 90%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(220, 70%, 30%);">📈 TENDANCES 2024 - QUÉBEC :</h3>
              <ul style="margin: 0; color: hsl(220, 10%, 40%);">
                <li>✅ 67% des PME planifient d'automatiser cette année</li>
                <li>✅ ROI moyen confirmé : 340% sur 18 mois</li>
                <li>✅ Délai de récupération : 4-6 mois seulement</li>
                <li>✅ Satisfaction employés : +40% en moyenne</li>
              </ul>
            </div>
            
            <div style="background: hsl(142, 76%, 95%); border: 1px solid hsl(142, 76%, 85%); border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="font-size: 18px; margin: 0 0 12px 0; color: hsl(142, 76%, 30%);">🤔 POURQUOI cette adoption massive MAINTENANT ?</h3>
              <p style="margin: 8px 0; color: hsl(142, 10%, 40%);">1️⃣ <strong>COÛT</strong> de la main-d'œuvre : +18% en 2 ans au Québec</p>
              <p style="margin: 8px 0; color: hsl(142, 10%, 40%);">2️⃣ <strong>PÉNURIE</strong> de talents : difficile de recruter du personnel administratif</p>
              <p style="margin: 8px 0; color: hsl(142, 10%, 40%);">3️⃣ <strong>COMPÉTITION</strong> : les entreprises automatisées gagnent des parts de marché</p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{quiz_url}}" style="background: hsl(220, 70%, 50%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                📊 VOIR les tendances 2024 (étude complète)
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
    
    // Validate and sanitize leadId
    const validatedLeadId = leadId && isValidUUID(leadId) ? leadId : null

    console.log(`Enqueuing email sequence for lead ${validatedLeadId || 'anonymous'}, segment: ${segment}`)

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
                lead_id: validatedLeadId,
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
          lead_id: validatedLeadId,
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
        lead_id: validatedLeadId,
        sequence_id: segment
      })

    console.log(`Successfully enqueued ${sequence.length} emails for lead ${validatedLeadId || 'anonymous'}`)

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