import { useMemo } from 'react';
import { trackEvent } from '@/lib/analytics';

interface EmailTemplateData {
  leadId: string;
  leadName: string;
  leadSegment: 'qualified' | 'hot' | 'warm' | 'cold';
  quizScore?: number;
  industry?: string;
  businessSize?: string;
  challenge?: string;
  completedQuiz?: boolean;
  bookedCall?: boolean;
}

interface EmailContent {
  subject: string;
  headline: string;
  value: string;
  cta: {
    text: string;
    url: string;
  };
  secondaryCta?: {
    text: string;
    url: string;
  };
}

export const useEmailTemplate = (data: EmailTemplateData): EmailContent => {
  return useMemo(() => {
    const { 
      leadName, 
      leadSegment, 
      quizScore, 
      industry, 
      businessSize, 
      challenge, 
      completedQuiz = false, 
      bookedCall = false 
    } = data;

    // Génération du contenu personnalisé selon le contexte
    if (bookedCall && challenge) {
      return {
        subject: `Préparation de votre consultation - Solutions pour ${challenge}`,
        headline: `Préparons votre consultation sur ${challenge}`,
        value: `Nous avons analysé votre défi spécifique "${challenge}" et préparé des solutions concrètes adaptées à votre contexte d'affaires au Québec. Voici les points clés que nous aborderons lors de notre rencontre.`,
        cta: {
          text: "Confirmer mon rendez-vous →",
          url: '/book-call'
        },
        secondaryCta: {
          text: "Modifier mon créneau",
          url: '/book-call?action=reschedule'
        }
      };
    }
    
    if (completedQuiz && quizScore) {
      if (leadSegment === 'qualified' || quizScore >= 80) {
        return {
          subject: `🎯 Analyse complétée - ${quizScore}% de potentiel d'optimisation détecté`,
          headline: `Excellentes nouvelles, ${leadName} !`,
          value: `Votre évaluation révèle un potentiel d'optimisation de ${quizScore}%. Les entreprises ${industry ? `du secteur ${industry}` : 'similaires'} qui ont automatisé leurs processus économisent en moyenne 15h par semaine et réduisent leurs erreurs de 70%. Votre profil correspond parfaitement à nos clients les plus performants.`,
          cta: {
            text: "Voir mes solutions personnalisées →",
            url: '/vsl'
          },
          secondaryCta: {
            text: "Réserver ma consultation stratégique",
            url: 'https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite'
          }
        };
      } else if (leadSegment === 'hot' || quizScore >= 60) {
        return {
          subject: `Résultats de votre évaluation - Solutions adaptées à votre ${industry || 'entreprise'}`,
          headline: `Voici vos opportunités d'amélioration, ${leadName}`,
          value: `Votre évaluation montre des opportunités concrètes d'optimisation (score: ${quizScore}%). Découvrez comment des entreprises ${businessSize ? `de taille ${businessSize}` : 'similaires'} ont transformé leurs opérations en quelques semaines et obtenu des résultats mesurables.`,
          cta: {
            text: "Voir la démonstration interactive →",
            url: '/vsl'
          },
          secondaryCta: {
            text: "Accéder aux guides gratuits",
            url: '/agents'
          }
        };
      } else {
        return {
          subject: `Merci pour votre évaluation - Ressources personnalisées prêtes`,
          headline: `Bonjour ${leadName},`,
          value: `Merci d'avoir pris le temps d'évaluer vos processus. Même si votre score suggère que vos systèmes actuels fonctionnent bien, il y a toujours des opportunités d'amélioration. Voici des ressources spécialement sélectionnées pour votre profil.`,
          cta: {
            text: "Découvrir mes ressources personnalisées →",
            url: '/agents'
          },
          secondaryCta: {
            text: "Refaire l'évaluation",
            url: '/quiz'
          }
        };
      }
    }
    
    // Contenu par défaut pour leads froids ou sans quiz
    return {
      subject: "Les 3 erreurs coûteuses que font 89% des entreprises québécoises",
      headline: `Bonjour ${leadName},`,
      value: `Saviez-vous que 89% des PME québécoises perdent en moyenne 12 heures par semaine à cause de processus manuels inefficaces ? Ces heures perdues représentent des milliers de dollars en productivité. Découvrez les 3 erreurs les plus coûteuses et comment les éviter.`,
      cta: {
        text: "Faire mon diagnostic gratuit →",
        url: '/quiz'
      },
      secondaryCta: {
        text: "Voir les ressources gratuites",
        url: '/agents'
      }
    };
  }, [data]);
};

// Fonction utilitaire pour générer les liens trackés
export const generateTrackedEmailLink = (
  leadId: string, 
  targetUrl: string, 
  trackingId: string,
  emailId?: string
): string => {
  // Créer le token de tracking
  const trackingToken = btoa(JSON.stringify({ 
    emailId: emailId || `email_${Date.now()}`,
    leadId,
    trackingId,
    timestamp: Date.now(),
    secret: 'EMAIL_SIGNING_SECRET' // En production, utiliser le vrai secret
  }));
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lbwjesrgernvjiorktia.supabase.co';
  
  return `${baseUrl}/functions/v1/email-click?t=${trackingToken}&url=${encodeURIComponent(targetUrl)}`;
};

// Fonction pour tracker l'ouverture d'email
export const generateEmailOpenPixel = (leadId: string, emailId: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lbwjesrgernvjiorktia.supabase.co';
  return `${baseUrl}/functions/v1/email-open?leadId=${leadId}&emailId=${emailId}&timestamp=${Date.now()}`;
};

// Fonction pour tracker les clics sur les CTAs d'emails
export const trackEmailCTA = async (
  leadId: string, 
  emailId: string, 
  ctaLocation: 'primary' | 'secondary' | 'unsubscribe',
  destination: string
) => {
  try {
    // Utiliser un événement funnel existant avec métadonnées email
    await trackEvent('vsl_cta_click', {
      lead_id: leadId,
      email_id: emailId,
      cta_location: ctaLocation,
      destination,
      source: 'email',
      timestamp: Date.now()
    }, leadId);
  } catch (error) {
    console.error('Failed to track email CTA click:', error);
  }
};