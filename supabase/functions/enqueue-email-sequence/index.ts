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

const emailSequences = {
  qualified: [
    {
      id: 'qualified-1',
      subject: 'Vos résultats de diagnostic - {{name}} (Score: {{score}}/100)',
      delay: 0,
      content: `
        <h1>Félicitations {{name}} !</h1>
        <p>Votre score de <strong>{{score}}/100</strong> indique que votre entreprise a un excellent potentiel d'automatisation.</p>
        <p>Basé sur vos réponses, voici ce que nous avons identifié :</p>
        <ul>
          <li>✅ Processus mûrs pour l'automatisation</li>
          <li>✅ ROI potentiel élevé (15-30% d'économies)</li>
          <li>✅ Équipe prête pour la transformation</li>
        </ul>
        <p><strong>Prochaine étape recommandée :</strong> Réservez votre consultation gratuite de 30 minutes pour découvrir exactement quels processus automatiser en premier.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{booking_url}}" style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Réserver ma consultation gratuite</a>
        </div>
      `
    },
    {
      id: 'qualified-2',
      subject: 'Cas concret : 40% de temps économisé chez {{name}}',
      delay: 24,
      content: `
        <h1>Bonjour {{name}},</h1>
        <p>J'aimerais partager avec vous le cas d'une entreprise similaire à la vôtre...</p>
        <p><strong>Résultats obtenus en 3 mois :</strong></p>
        <ul>
          <li>📊 40% de réduction du temps administratif</li>
          <li>💰 25 000$ économisés annuellement</li>
          <li>⚡ Processus 5x plus rapides</li>
        </ul>
        <p>Votre diagnostic montre le même potentiel. Parlons-en ?</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{booking_url}}" style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Oui, je veux mes résultats</a>
        </div>
      `
    }
  ],
  hot: [
    {
      id: 'hot-1',
      subject: 'Vos résultats de diagnostic - {{name}} (Score: {{score}}/100)',
      delay: 0,
      content: `
        <h1>Excellents résultats {{name}} !</h1>
        <p>Votre score de <strong>{{score}}/100</strong> place votre entreprise dans le top 20% en termes de potentiel d'automatisation.</p>
        <p>Voici les opportunités identifiées :</p>
        <ul>
          <li>🎯 ROI rapide sur plusieurs processus</li>
          <li>📈 Potentiel de croissance significatif</li>
          <li>⚡ Implementation possible sous 60 jours</li>
        </ul>
        <p>Ne laissez pas passer cette opportunité. Réservez votre consultation gratuite maintenant.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{booking_url}}" style="background: #DC2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Je réserve maintenant</a>
        </div>
      `
    }
  ],
  warm: [
    {
      id: 'warm-1',
      subject: 'Vos résultats de diagnostic - {{name}} (Score: {{score}}/100)',
      delay: 0,
      content: `
        <h1>Merci {{name}} pour votre diagnostic !</h1>
        <p>Votre score de <strong>{{score}}/100</strong> révèle des opportunités intéressantes d'automatisation.</p>
        <p>Points d'amélioration identifiés :</p>
        <ul>
          <li>📊 Optimisation des processus actuels</li>
          <li>🔄 Automatisation de tâches répétitives</li>
          <li>📈 Amélioration de l'efficacité</li>
        </ul>
        <p>Découvrons ensemble comment transformer ces opportunités en résultats concrets.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{booking_url}}" style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Consultation gratuite</a>
        </div>
      `
    }
  ],
  cold: [
    {
      id: 'cold-1',
      subject: 'Vos résultats de diagnostic - {{name}} (Score: {{score}}/100)',
      delay: 0,
      content: `
        <h1>Merci {{name}} !</h1>
        <p>Votre diagnostic révèle un score de <strong>{{score}}/100</strong>. C'est un excellent point de départ !</p>
        <p>Même si votre entreprise n'est pas encore prête pour une automatisation complète, il y a des gains rapides possibles :</p>
        <ul>
          <li>📝 Simplification des processus manuels</li>
          <li>🔧 Petites optimisations à fort impact</li>
          <li>📚 Formation et sensibilisation de l'équipe</li>
        </ul>
        <p>Commençons par identifier les premiers pas ensemble.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{booking_url}}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Premiers pas gratuits</a>
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
    const bookingUrl = 'https://lbwjesrgernvjiorktia.supabase.co/book-call'

    // Enqueue each email in the sequence
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