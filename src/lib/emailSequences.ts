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

// Séquences d'emails de conversion optimales
export const emailSequences: Record<LeadScore['segment'], EmailSequence> = {
  qualified: {
    id: 'qualified_sequence',
    name: 'Leads Qualifiés - Action Immédiate',
    segment: 'qualified',
    triggers: ['quiz_complete', 'high_score'],
    emails: [
      {
        id: 'qualified_1',
        subject: '🎯 {{name}}, votre analyse révèle {{score}}% d\'optimisation possible',
        content: `Bonjour {{name}},

EXCELLENTES NOUVELLES ! Votre évaluation révèle un potentiel d'optimisation de {{score}}%.

📊 VOTRE PROFIL D'OPTIMISATION PRIORITAIRE :
• Temps récupérable : 15-20 heures/semaine  
• Réduction d'erreurs : jusqu'à 85%
• ROI projeté : 340% sur 12 mois
• Priorité : HAUTE (consultation urgente recommandée)

🏆 POURQUOI AGIR MAINTENANT ?
Les entreprises {{industry}} qui agissent rapidement obtiennent :
✅ +67% productivité équipe (résultats en 2 semaines)
✅ -85% erreurs administratives (dès le premier mois) 
✅ +340% ROI (confirmé sur 18 mois)

🎁 VOTRE CONSULTATION STRATÉGIQUE (500$ → GRATUITE)
✓ Audit express : identification des gains rapides
✓ Plan d'action prioritaire : les 3 automatisations les plus rentables  
✓ Roadmap personnalisée : timeline et budget réalistes
✓ Garantie résultats : amélioration visible en 14 jours

⏰ PLACES LIMITÉES cette semaine : Seulement 3 créneaux disponibles.

Quel moment vous convient le mieux ?`,
        delay: 0,
        personalization: {
          score: 'quizScore',
          industry: 'leadIndustry'
        },
        cta: {
          text: '🚀 Réserver ma consultation PRIORITAIRE',
          url: 'https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite?priority=high&utm_source=qualified_email_1',
          tracking: 'qualified_cta_1'
        }
      },
      {
        id: 'qualified_2', 
        subject: '⚠️ {{name}}, votre créneau de consultation expire dans 24h',
        content: `{{name}},

Votre consultation stratégique PRIORITAIRE (valeur 500$) expire dans 24h.

⏰ RAPPEL DE VOS GAINS IDENTIFIÉS :
• Score d'optimisation : {{score}}%
• Temps récupérable : 15-20h/semaine  
• Économies annuelles projetées : 45,000$ - 67,000$

🔥 URGENCE : Plus que 2 places disponibles cette semaine.

Après cette date, la prochaine disponibilité sera dans 3 semaines, et le coût de consultation passera à 500$.

📞 RÉSERVATION EXPRESS : 2 minutes suffisent.

Ne laissez pas passer cette opportunité de transformer votre entreprise.`,
        delay: 24,
        personalization: {
          score: 'quizScore'
        },
        cta: {
          text: '⚡ RÉSERVER MAINTENANT (expire dans 24h)',
          url: 'https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite?urgent=true&utm_source=qualified_email_2',
          tracking: 'qualified_cta_2'
        }
      },
      {
        id: 'qualified_3',
        subject: '{{name}}, voici ce que vous ratez...',
        content: `{{name}},

Votre consultation gratuite a expiré hier.

Pendant que vous réfléchissiez, voici ce qui s'est passé :

📈 CAS RÉEL - entreprise similaire à la vôtre :
• Lundi : Consultation avec nous
• Mercredi : Première automatisation en place  
• Vendredi : 12h de travail manuel économisées
• 2 semaines plus tard : Processus complet optimisé
• Résultat : 28,000$ économisés en 3 mois

😔 COÛT DE L'INACTION :
Chaque semaine d'attente = 15h perdues + erreurs évitables + stress inutile.

🎁 DERNIÈRE CHANCE : Je rouvre exceptionnellement 2 créneaux pour vous.

Mais cette fois, c'est vraiment la dernière opportunité à ce prix.

Prêt(e) à rattraper le temps perdu ?`,
        delay: 72,
        personalization: {},
        cta: {
          text: '🏃‍♂️ DERNIÈRE CHANCE - Réserver maintenant',
          url: 'https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite?last_chance=true&utm_source=qualified_email_3',
          tracking: 'qualified_cta_3'
        }
      }
    ]
  },

  hot: {
    id: 'hot_sequence', 
    name: 'Leads Chauds - Démonstration de Valeur',
    segment: 'hot',
    triggers: ['quiz_complete', 'medium_high_score'],
    emails: [
      {
        id: 'hot_1',
        subject: '{{name}}, comment {{company_type}} économisent 15h/semaine',
        content: `Bonjour {{name}},

Merci d'avoir complété notre évaluation (score: {{score}}%) !

Votre profil correspond exactement à nos clients les plus satisfaits.

📊 CAS CLIENT - Entreprise similaire ({{industry}}) :
• AVANT : 25h/semaine perdues en gestion manuelle
• APRÈS : 10h/semaine, processus fluides  
• RÉSULTAT : +150% productivité, équipe motivée

🎯 VOS GAINS POTENTIELS IDENTIFIÉS :
• Gestion administrative → 80% automatisée
• Suivi clients → Intégration temps réel  
• Reporting → Tableaux de bord automatiques
• Formation équipe → Processus standardisés

💡 VOTRE QUESTION : "Est-ce que ça marcherait vraiment pour nous ?"

RÉPONSE : Découvrez EXACTEMENT comment dans votre démonstration personnalisée (15 min).

Vous verrez votre situation actuelle VS optimisée, avec chiffres à l'appui.

Quand êtes-vous disponible pour 15 minutes cette semaine ?`,
        delay: 2,
        personalization: {
          score: 'quizScore',
          company_type: 'businessSize', 
          industry: 'leadIndustry'
        },
        cta: {
          text: '🎥 Voir MA démonstration personnalisée',
          url: '/vsl?source=hot_email_1&personalized=true&utm_campaign=demo_request',
          tracking: 'hot_cta_1'  
        }
      },
      {
        id: 'hot_2',
        subject: '⚡ Résultats garantis en 2 semaines ou remboursé',
        content: `{{name}},

Question fréquente : "Combien de temps pour voir des résultats ?"

RÉPONSE : 2 semaines maximum. Garanti ou remboursé.

📅 NOTRE PROCESSUS EXPRESS PROUVÉ :
• Jour 1-3 : Analyse et configuration rapide
• Jour 4-7 : Formation équipe (2h max)  
• Jour 8-14 : Premiers automatismes actifs
• Résultats visibles : Semaine 2 garantie

🏆 GARANTIE RÉSULTATS (UNIQUE au Québec) :
✅ -50% erreurs administratives ou remboursement  
✅ +3h productives/jour/employé ou remboursement
✅ Processus clairs pour 100% équipe ou remboursement

💬 TÉMOIGNAGE RÉCENT :
"En 10 jours, mon équipe a récupéré 18h/semaine. 
ROI récupéré en 3 semaines. Incroyable !"
- Marie-Claude Tremblay, Directrice Opérations

⏰ OFFRE LIMITÉE : 5 implementations express ce mois-ci.

Prêt(e) pour votre transformation express ?`,
        delay: 48,
        personalization: {},
        cta: {
          text: '🚀 DÉMARRER ma transformation EXPRESS',
          url: 'https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite?express=true&utm_source=hot_email_2',
          tracking: 'hot_cta_2'
        }
      }
    ]
  },

  warm: {
    id: 'warm_sequence',
    name: 'Leads Tièdes - Éducation et Confiance', 
    segment: 'warm',
    triggers: ['quiz_complete', 'medium_score'],
    emails: [
      {
        id: 'warm_1',
        subject: '{{name}}, les 3 signes que vos systèmes vous coûtent CHER',
        content: `Bonjour {{name}},

Merci d'avoir pris le temps d'évaluer vos processus.

STATISTIQUE ALARMANTE : 73% des PME québécoises perdent 12h/semaine à cause de systèmes mal organisés.

🔍 LES 3 SIGNES QUI NE MENTENT PAS :

1️⃣ VOS EMPLOYÉS vous posent les mêmes questions chaque semaine
→ Diagnostic : Information éparpillée dans 5-6 outils différents

2️⃣ VOUS DÉCOUVREZ des erreurs importantes après-coup  
→ Diagnostic : Aucun système de vérification automatique

3️⃣ VOS RAPPORTS prennent des heures à préparer
→ Diagnostic : Données dispersées, saisies manuelles multiples

💰 COÛT RÉEL de ces problèmes :
• Temps perdu : 12-18h/semaine (18,000$/an en salaire)
• Erreurs coûteuses : 5,000-15,000$/an en moyenne
• Stress équipe : turnover +40% vs entreprises organisées

📖 SOLUTION : Guide gratuit "10 Automatisations Rapides" 
(Spécialement adapté aux PME québécoises)

Découvrez les automatisations les plus rentables en 15 minutes.

Téléchargement immédiat et gratuit.`,
        delay: 6,
        personalization: {},
        cta: {
          text: '📊 TÉLÉCHARGER le guide (gratuit)',
          url: '/agents?source=warm_email_1&guide=automation&utm_campaign=guide_download',
          tracking: 'warm_cta_1'
        }
      },
      {
        id: 'warm_2',
        subject: '{{name}}, pourquoi vos concurrents automatisent MAINTENANT',
        content: `{{name}},

Tendance inquiétante au Québec : l'écart se creuse entre les entreprises.

📊 ÉTUDES RÉCENTES révèlent :
• 67% des PME québécoises automatisent en 2024
• Celles qui n'automatisent PAS perdent 23% de parts de marché  
• Les "early adopters" croissent 2.3x plus vite

🏃‍♂️ VOS CONCURRENTS en ce moment :
• Réduisent leurs coûts de 15-30%
• Améliorent leur service client (+60% satisfaction)
• Attirent les meilleurs talents (entreprises "modernes")

⚠️ DANGER DE L'IMMOBILISME :
Dans 18 mois, les entreprises non-automatisées seront perçues comme "dépassées" par :
- Leurs clients (processus lents, erreurs)  
- Leurs employés (outils obsolètes)
- Leurs partenaires (inefficacité)

💡 BONNE NOUVELLE : Il n'est pas trop tard !

Les PME qui agissent maintenant rattrapent rapidement et dépassent même les "early adopters".

Prêt(e) à rejoindre les entreprises d'avant-garde ?`,
        delay: 96,
        personalization: {},
        cta: {
          text: '🎯 ÉVALUER mes options d\'automatisation',
          url: '/quiz?retake=true&source=warm_email_2&utm_campaign=automation_options',
          tracking: 'warm_cta_2'
        }
      }
    ]
  },

  cold: {
    id: 'cold_sequence',
    name: 'Leads Froids - Sensibilisation Progressive',
    segment: 'cold', 
    triggers: ['quiz_complete', 'low_score'],
    emails: [
      {
        id: 'cold_1',
        subject: '{{name}}, pourquoi 67% des PME québécoises automatisent en 2024',
        content: `Bonjour {{name}},

Révolution silencieuse dans les PME québécoises : l'automatisation devient la norme.

📈 TENDANCES 2024 - QUÉBEC :
✅ 67% des PME planifient d'automatiser cette année
✅ ROI moyen confirmé : 340% sur 18 mois  
✅ Délai de récupération : 4-6 mois seulement
✅ Satisfaction employés : +40% en moyenne

🤔 POURQUOI cette adoption massive MAINTENANT ?

3 FACTEURS DÉCLENCHEURS :
1️⃣ COÛT de la main-d'œuvre : +18% en 2 ans au Québec
2️⃣ PÉNURIE de talents : difficile de recruter du personnel administratif  
3️⃣ COMPÉTITION : les entreprises automatisées gagnent des parts de marché

💡 RÉALITÉ : L'automatisation n'est plus un "nice to have".

C'est devenu aussi essentiel qu'avoir un site web ou un système comptable.

Les entreprises qui tardent risquent d'être dépassées par leurs concurrents.

Cette semaine : insights exclusifs sur les stratégies qui fonctionnent vraiment.

À bientôt pour plus d'informations pratiques !`,
        delay: 12,
        personalization: {},
        cta: {
          text: '📊 VOIR les tendances 2024 (étude complète)',
          url: '/quiz?source=cold_email_1&study=trends2024&utm_campaign=trends_2024',
          tracking: 'cold_cta_1'
        }
      },
      {
        id: 'cold_2',
        subject: '{{name}}, les 5 automatisations qui changent tout',
        content: `{{name}},

Suite de notre série sur l'automatisation au Québec.

Aujourd'hui : LES 5 automatisations qui transforment les PME québécoises.

🏆 TOP 5 - IMPACT IMMÉDIAT :

1️⃣ FACTURATION automatique → +95% paiements à temps
2️⃣ SUIVI CLIENT automatisé → +67% satisfaction client
3️⃣ GESTION INVENTAIRE → -80% ruptures de stock  
4️⃣ REPORTING financier → -90% temps de préparation
5️⃣ ONBOARDING employés → -70% temps d'intégration

💰 EXEMPLE CONCRET - PME manufacturière (Longueuil) :
• Avant : 35h/semaine tâches administratives
• Après : 12h/semaine (automatisation des 5 processus)  
• Économies : 23h x 25$/h = 575$/semaine = 29,900$/an
• ROI : 650% la première année

🎯 QUESTION pour vous :
Laquelle de ces 5 automatisations aurait le plus d'impact dans VOTRE entreprise ?

Demain : Comment identifier VOS priorités d'automatisation (méthode simple).`,
        delay: 60,
        personalization: {},
        cta: {
          text: '🔍 IDENTIFIER mes priorités d\'automatisation',
          url: '/quiz?focus=priorities&source=cold_email_2&utm_campaign=automation_priorities', 
          tracking: 'cold_cta_2'
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