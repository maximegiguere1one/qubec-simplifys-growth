import { supabase } from "@/integrations/supabase/client";
import { LeadScore } from "./leadScoring";

export interface EmailSequence {
  id: string;
  name: string;
  segment: LeadScore['segment'];
  emails: EmailTemplate[];
  triggers: string[];
}

export interface EmailTemplate {
  id: string;
  subject: string;
  content: string;
  delay: number; // hours after trigger
  personalization: Record<string, string>;
  cta: {
    text: string;
    url: string;
    tracking: string;
  };
}

// Quebec business-focused email sequences
export const emailSequences: Record<LeadScore['segment'], EmailSequence> = {
  qualified: {
    id: 'qualified_sequence',
    name: 'Qualified Lead - Immediate Action',
    segment: 'qualified',
    triggers: ['quiz_complete', 'high_score'],
    emails: [
      {
        id: 'qualified_1',
        subject: '🎯 Votre analyse est prête - Économies potentielles identifiées',
        content: `Bonjour {{name}},

Félicitations ! Votre analyse révèle un potentiel d'économie significatif avec One Système.

Basé sur vos réponses :
• Temps économisé potentiel : {{time_savings}} heures/semaine
• Réduction d'erreurs estimée : {{error_reduction}}%
• ROI projeté : {{roi_estimate}} sur 12 mois

✅ Vous êtes éligible à notre consultation stratégique GRATUITE (valeur 500$)

Réservons 30 minutes cette semaine pour :
1. Analyser vos processus actuels
2. Identifier les gains rapides (implémentation sous 2 semaines)
3. Créer votre roadmap personnalisé

Nos créneaux cette semaine :`,
        delay: 1,
        personalization: {
          time_savings: 'dynamicValue',
          error_reduction: 'dynamicValue',
          roi_estimate: 'dynamicValue'
        },
        cta: {
          text: 'Réserver ma consultation gratuite →',
          url: '/book-call?source=qualified_email_1',
          tracking: 'qualified_cta_1'
        }
      }
    ]
  },

  hot: {
    id: 'hot_sequence',
    name: 'Hot Lead - Value Demonstration',
    segment: 'hot',
    triggers: ['quiz_complete', 'medium_score'],
    emails: [
      {
        id: 'hot_1',
        subject: 'Voici comment {{company_type}} économisent 15h/semaine',
        content: `Bonjour {{name}},

Merci d'avoir complété notre évaluation !

Votre profil ({{business_size}}, {{industry}}) correspond exactement à nos clients les plus satisfaits.

Voici ce que des entreprises comme la vôtre ont accompli :

📊 CAS CLIENT - {{similar_company}}
• Avant : 25h/semaine perdues dans la gestion manuelle
• Après : 10h/semaine, processus automatisés
• Résultat : +60% de productivité, équipe plus motivée

🎯 Vos gains potentiels identifiés :
• {{pain_point_1}} → Solution automatisée
• {{pain_point_2}} → Intégration simplifiée
• {{pain_point_3}} → Reporting en temps réel

Voulez-vous voir exactement comment cela fonctionnerait pour votre entreprise ?`,
        delay: 2,
        personalization: {
          company_type: 'businessSize',
          business_size: 'dynamicValue',
          industry: 'dynamicValue',
          similar_company: 'dynamicValue'
        },
        cta: {
          text: 'Voir la démonstration personnalisée',
          url: '/demo?source=hot_email_1',
          tracking: 'hot_cta_1'
        }
      },
      {
        id: 'hot_2',
        subject: '⚡ Implémentation express - Résultats en 2 semaines',
        content: `{{name}}, 

Vous vous demandez peut-être combien de temps prend l'implémentation ?

Bonne nouvelle : nos clients voient des résultats dès la 2ème semaine !

📅 NOTRE PROCESSUS EXPRESS :
Semaine 1 : Analyse et configuration initiale
Semaine 2 : Formation équipe + premiers automatismes
Semaine 3-4 : Optimisations et intégrations avancées

🚀 Résultats garantis ou remboursé :
• -50% erreurs administratives
• +3h/jour productive par employé
• Processus clairs pour toute l'équipe

💬 "En 3 semaines, on a récupéré notre investissement. L'équipe est transformée !" 
- Marie-Claude, {{similar_industry}}

Prêt(e) à démarrer votre transformation ?`,
        delay: 72,
        personalization: {
          similar_industry: 'dynamicValue'
        },
        cta: {
          text: 'Démarrer ma transformation →',
          url: '/book-call?source=hot_email_2&priority=express',
          tracking: 'hot_cta_2'
        }
      }
    ]
  },

  warm: {
    id: 'warm_sequence',
    name: 'Warm Lead - Education & Trust Building',
    segment: 'warm',
    triggers: ['quiz_complete', 'low_medium_score'],
    emails: [
      {
        id: 'warm_1',
        subject: 'Les 3 signes que vos systèmes vous coûtent cher',
        content: `Bonjour {{name}},

Merci d'avoir pris le temps d'évaluer vos processus actuels.

Savez-vous que 73% des PME québécoises perdent en moyenne 12h/semaine à cause de systèmes désorganisés ?

🔍 LES 3 SIGNES RÉVÉLATEURS :

1️⃣ Vos employés posent les mêmes questions répétitives
→ Signe : Information dispersée dans plusieurs outils

2️⃣ Vous découvrez des erreurs après coup  
→ Signe : Pas de contrôles automatiques

3️⃣ Les rapports prennent des heures à préparer
→ Signe : Données non-centralisées

📖 RESSOURCE GRATUITE : 
"Le Guide du Chef d'Entreprise : 10 Automatisations Rapides" 
(Spécialement conçu pour les entreprises québécoises)

Découvrez les automatisations les plus rentables en moins de 15 minutes.`,
        delay: 4,
        personalization: {},
        cta: {
          text: 'Télécharger le guide gratuit →',
          url: '/guide?source=warm_email_1',
          tracking: 'warm_cta_1'
        }
      }
    ]
  },

  cold: {
    id: 'cold_sequence',
    name: 'Cold Lead - Awareness & Education',
    segment: 'cold',
    triggers: ['quiz_complete', 'low_score'],
    emails: [
      {
        id: 'cold_1',
        subject: 'Pourquoi les entreprises québécoises choisissent l\'automatisation',
        content: `Bonjour {{name}},

L'automatisation n'est plus un luxe - c'est devenu essentiel pour rester compétitif.

Au Québec, les entreprises qui automatisent leurs processus :
• Croissent 2.3x plus vite que leurs concurrents
• Ont des employés 40% plus engagés  
• Résistent mieux aux défis économiques

🎯 TENDANCES 2024 AU QUÉBEC :
✅ 67% des PME prévoient d'automatiser cette année
✅ ROI moyen : 340% sur 18 mois
✅ Temps de récupération : 4-6 mois

Cette semaine, nous partageons des insights exclusifs sur les stratégies d'automatisation qui fonctionnent vraiment pour les entreprises québécoises.

Restez à l'écoute !`,
        delay: 6,
        personalization: {},
        cta: {
          text: 'Voir les tendances complètes →',
          url: '/insights?source=cold_email_1',
          tracking: 'cold_cta_1'
        }
      }
    ]
  }
};

// Track email engagement for lead scoring
export const trackEmailEngagement = async (
  leadId: string, 
  emailId: string, 
  action: 'sent' | 'opened' | 'clicked' | 'unsubscribed'
) => {
  try {
    await supabase.from('email_events').insert({
      lead_id: leadId,
      email_id: emailId,
      action,
      timestamp: new Date().toISOString()
    });

    // Update lead score based on engagement
    if (action === 'opened') {
      // Add 5 points for email open
      const { data: lead } = await supabase
        .from('leads')
        .select('score')
        .eq('id', leadId)
        .single();

      if (lead) {
        await supabase
          .from('leads')
          .update({ score: (lead.score || 0) + 5 })
          .eq('id', leadId);
      }
    }

    if (action === 'clicked') {
      // Add 15 points for email click
      const { data: lead } = await supabase
        .from('leads')
        .select('score')
        .eq('id', leadId)
        .single();

      if (lead) {
        await supabase
          .from('leads')
          .update({ score: (lead.score || 0) + 15 })
          .eq('id', leadId);
      }
    }
  } catch (error) {
    console.error('Error tracking email engagement:', error);
  }
};

// Get next email in sequence for a lead
export const getNextEmailForLead = async (leadId: string) => {
  try {
    // Get lead segment and last email sent
    const { data: lead } = await supabase
      .from('leads')
      .select('segment, id')
      .eq('id', leadId)
      .single();

    if (!lead || !lead.segment) return null;

    // Get email history for this lead
    const { data: emailHistory } = await supabase
      .from('email_events')
      .select('email_id')
      .eq('lead_id', leadId)
      .eq('action', 'sent')
      .order('created_at', { ascending: false });

    const sentEmails = emailHistory?.map(e => e.email_id) || [];
    const sequence = emailSequences[lead.segment];
    
    // Find next unsent email
    const nextEmail = sequence.emails.find(email => 
      !sentEmails.includes(email.id)
    );

    return nextEmail || null;
  } catch (error) {
    console.error('Error getting next email:', error);
    return null;
  }
};

// Webhook endpoint for email service integration (ActiveCampaign/HubSpot)
export const triggerEmailSequence = async (leadId: string, segment: LeadScore['segment']) => {
  try {
    const sequence = emailSequences[segment];
    if (!sequence) return false;

    // This would integrate with your email service
    // For now, we'll log the trigger
    await supabase.from('email_sequence_triggers').insert({
      lead_id: leadId,
      sequence_id: sequence.id,
      triggered_at: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error triggering email sequence:', error);
    return false;
  }
};