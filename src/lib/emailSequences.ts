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
        subject: '🎯 Analyse complétée - {{score}}% de potentiel d\'optimisation détecté',
        content: `Bonjour {{name}},

Excellentes nouvelles ! Votre évaluation révèle un potentiel d'optimisation de {{score}}%.

📊 VOTRE PROFIL D'OPTIMISATION :
• Temps récupérable : {{time_savings}} heures/semaine
• Réduction d'erreurs possible : {{error_reduction}}%
• ROI estimé : {{roi_estimate}} sur 12 mois

🎯 PROCHAINES ÉTAPES RECOMMANDÉES :
Les entreprises {{industry}} de votre taille qui automatisent leurs processus voient en moyenne :
✅ +67% de productivité équipe
✅ -85% d'erreurs administratives
✅ +340% ROI en 18 mois

Votre consultation stratégique personnalisée (valeur 500$) est prête.

Durant ces 30 minutes, nous couvrirons :
1. Audit express de vos processus actuels
2. Plan d'automatisation prioritaire (gains rapides)
3. Roadmap personnalisée avec timeline réaliste

Quel créneau vous convient le mieux cette semaine ?`,
        delay: 1,
        personalization: {
          score: 'quizScore',
          time_savings: 'calculatedTimeSavings',
          error_reduction: 'calculatedErrorReduction',
          roi_estimate: 'calculatedROI',
          industry: 'leadIndustry'
        },
        cta: {
          text: 'Réserver ma consultation stratégique →',
          url: 'https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite?utm_source=qualified_email_1',
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
          text: 'Voir ma démonstration personnalisée',
          url: '/vsl?source=hot_email_1&utm_campaign=demo_request',
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
          url: 'https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite?utm_source=hot_email_2&priority=express',
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
          url: '/agents?source=warm_email_1&utm_campaign=guide_download',
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
          text: 'Découvrir les tendances 2024 →',
          url: '/quiz?source=cold_email_1&utm_campaign=trends_2024',
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
    // Use funnel_events for now since email_events table might not be in types yet
    await supabase.from('funnel_events').insert({
      lead_id: leadId,
      event_type: 'quiz_question_answer', // Reuse existing event type
      event_data: {
        event_type: 'email_engagement',
        email_id: emailId,
        action: action
      },
      session_id: `email_${Date.now()}`
    });

    // Email engagement will be handled through lead scoring updates
    console.log(`Email engagement tracked: ${action} for lead ${leadId}`);
  } catch (error) {
    console.error('Error tracking email engagement:', error);
  }
};

// Get next email in sequence for a lead  
export const getNextEmailForLead = async (leadId: string) => {
  try {
    // For now, return first email for demonstration
    // In production, this would track sent emails
    const defaultSegment: LeadScore['segment'] = 'warm';
    const sequence = emailSequences[defaultSegment];
    
    // Return first email in sequence
    return sequence.emails[0] || null;
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

    // Log the trigger using funnel_events for now
    await supabase.from('funnel_events').insert({
      lead_id: leadId,
      event_type: 'quiz_question_answer',
      event_data: {
        event_type: 'email_sequence_trigger',
        sequence_id: sequence.id,
        segment: segment
      },
      session_id: `seq_${Date.now()}`
    });

    console.log(`Email sequence triggered for lead ${leadId}, segment: ${segment}`);
    return true;
  } catch (error) {
    console.error('Error triggering email sequence:', error);
    return false;
  }
};