import { useState, useEffect } from 'react';

interface QuizResults {
  answers: Record<number, string>;
  totalScore: number;
  diagnostic: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PersonalizedMessage {
  headline: string;
  subheading: string;
  ctaText: string;
  urgencyMessage?: string;
  socialProof?: string;
}

export const usePersonalizedMessaging = () => {
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [leadScore, setLeadScore] = useState<number>(0);

  useEffect(() => {
    // Load quiz results from localStorage
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      const results = JSON.parse(storedResults);
      setQuizResults(results);
      setLeadScore(results.totalScore || 0);
    }
  }, []);

  const getPersonalizedLanding = (): PersonalizedMessage => {
    if (!quizResults) {
      return {
        headline: "Finies les heures perdues dans la paperasse",
        subheading: "Je crée pour vous un système simple qui gère tout automatiquement",
        ctaText: "Découvrir mon potentiel d'économie de temps"
      };
    }

    const { contactInfo, totalScore } = quizResults;
    const firstName = contactInfo.name.split(' ')[0];

    if (totalScore >= 16) {
      return {
        headline: `${firstName}, transformons votre entreprise avec un système sur mesure`,
        subheading: `Basé sur votre profil, vous pourriez économiser 15-20 heures par semaine`,
        ctaText: "Voir mon plan personnalisé",
        urgencyMessage: "🔥 Profil prioritaire détecté",
        socialProof: "Entrepreneurs à haut potentiel comme vous économisent en moyenne 18h/semaine"
      };
    } else if (totalScore >= 12) {
      return {
        headline: `${firstName}, vous êtes parfait pour notre approche sur mesure`,
        subheading: `Votre analyse indique un potentiel de 10-15 heures récupérées par semaine`,
        ctaText: "Découvrir ma solution personnalisée",
        socialProof: "94% des entrepreneurs avec votre profil voient des résultats en 30 jours"
      };
    } else if (totalScore >= 8) {
      return {
        headline: `${firstName}, optimisons votre organisation actuelle`,
        subheading: `Même bien organisé, vous pourriez gagner 6-10 heures supplémentaires`,
        ctaText: "Voir mes opportunités d'amélioration",
        socialProof: "Même les entreprises efficaces trouvent des gains avec notre approche"
      };
    }

    return {
      headline: `${firstName}, perfectionnons votre système existant`,
      subheading: `Découvrez comment éliminer les dernières frustrations et gagner 3-5 heures`,
      ctaText: "Optimiser mon organisation",
      socialProof: "Zéro frustration garantie avec un système parfaitement adapté"
    };
  };

  const getPersonalizedVSL = (): PersonalizedMessage => {
    if (!quizResults) {
      return {
        headline: "Découvrez comment automatiser votre entreprise",
        subheading: "La solution qui va transformer votre quotidien d'entrepreneur",
        ctaText: "Planifier ma consultation gratuite"
      };
    }

    const { contactInfo, totalScore, answers } = quizResults;
    const firstName = contactInfo.name.split(' ')[0];
    
    // Get main pain point from first answer
    const firstAnswer = answers[0];
    const painPointMap: Record<string, string> = {
      'inventory': 'la gestion d\'inventaire',
      'billing': 'la facturation et comptabilité',
      'hr': 'la gestion des employés',
      'projects': 'le suivi de projets',
      'crm': 'la gestion clients'
    };
    const mainPainPoint = painPointMap[firstAnswer] || 'vos processus';

    if (totalScore >= 16) {
      return {
        headline: `${firstName}, voici exactement comment résoudre ${mainPainPoint}`,
        subheading: `Votre profil indique que vous avez besoin d'une solution complètement sur mesure`,
        ctaText: "Planifier ma stratégie personnalisée",
        urgencyMessage: "⚡ Consultation prioritaire - profil à fort potentiel"
      };
    } else if (totalScore >= 12) {
      return {
        headline: `${firstName}, la solution à ${mainPainPoint} est plus simple que vous le pensez`,
        subheading: `Découvrez comment d'autres entrepreneurs ont résolu exactement le même défi`,
        ctaText: "Voir ma solution personnalisée"
      };
    }

    return {
      headline: `${firstName}, optimisons ${mainPainPoint} ensemble`,
      subheading: `Même avec une bonne organisation, il y a toujours moyen de faire mieux`,
      ctaText: "Découvrir mes opportunités"
    };
  };

  const getPersonalizedBooking = (): PersonalizedMessage => {
    if (!quizResults) {
      return {
        headline: "Réservons votre consultation gratuite",
        subheading: "30 minutes pour analyser votre situation et vous proposer des solutions",
        ctaText: "Choisir mon créneau"
      };
    }

    const { contactInfo, totalScore } = quizResults;
    const firstName = contactInfo.name.split(' ')[0];

    if (totalScore >= 16) {
      return {
        headline: `${firstName}, réservons immédiatement votre session stratégique`,
        subheading: `Votre profil nécessite une approche prioritaire - créneaux limités disponibles`,
        ctaText: "Réserver ma session VIP",
        urgencyMessage: "🚨 Seulement 3 créneaux cette semaine pour les profils prioritaires"
      };
    } else if (totalScore >= 12) {
      return {
        headline: `${firstName}, planifions votre consultation personnalisée`,
        subheading: `Session de 45 minutes pour définir votre système sur mesure`,
        ctaText: "Choisir mon créneau consultant",
        urgencyMessage: "📅 Plus que 5 places cette semaine"
      };
    }

    return {
      headline: `${firstName}, réservons votre consultation d'optimisation`,
      subheading: `30 minutes pour identifier vos meilleures opportunités d'amélioration`,
      ctaText: "Planifier ma consultation"
    };
  };

  const getCTAVariant = (context: 'landing' | 'vsl' | 'booking'): string => {
    if (!quizResults) return 'control';
    
    const { totalScore } = quizResults;
    
    if (totalScore >= 16) return 'high_intent';
    if (totalScore >= 12) return 'medium_intent'; 
    return 'low_intent';
  };

  return {
    quizResults,
    leadScore,
    getPersonalizedLanding,
    getPersonalizedVSL,
    getPersonalizedBooking,
    getCTAVariant
  };
};