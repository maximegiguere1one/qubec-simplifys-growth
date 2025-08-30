import { supabase } from "@/integrations/supabase/client";

// Lead scoring system based on quiz results and engagement
export interface LeadScore {
  score: number;
  segment: 'cold' | 'warm' | 'hot' | 'qualified';
  factors: {
    quizScore?: number;
    timeOnSite?: number;
    pageViews?: number;
    emailEngagement?: number;
    bookingIntent?: number;
  };
  recommendations: string[];
}

// Quebec business size scoring
const businessSizeScores = {
  'micro': 15, // 1-5 employees - easier to implement but lower budget
  'small': 25, // 6-20 employees - sweet spot
  'medium': 20, // 21-100 employees - higher budget but more complex
  'large': 10   // 100+ employees - complex sales cycle
};

// Pain point intensity scoring  
const painPointScores = {
  'wasting_time': 20,
  'too_many_tools': 25,
  'manual_errors': 30,
  'team_confusion': 25,
  'growth_blocked': 35
};

// Implementation readiness scoring
const readinessScores = {
  'immediate': 30, // Ready within 30 days
  'quarter': 20,   // Within 3 months  
  'planning': 10,  // 6+ months
  'exploring': 5   // Just looking
};

export const calculateLeadScore = (quizResults: any): LeadScore => {
  let totalScore = 0;
  const factors: LeadScore['factors'] = {};
  const recommendations: string[] = [];

  // Quiz-based scoring
  if (quizResults) {
    // Business size factor
    const businessSize = quizResults.businessSize;
    if (businessSize && businessSizeScores[businessSize as keyof typeof businessSizeScores]) {
      const sizeScore = businessSizeScores[businessSize as keyof typeof businessSizeScores];
      totalScore += sizeScore;
      factors.quizScore = sizeScore;
    }

    // Pain points analysis
    const painPoints = quizResults.painPoints || [];
    painPoints.forEach((pain: string) => {
      if (painPointScores[pain as keyof typeof painPointScores]) {
        totalScore += painPointScores[pain as keyof typeof painPointScores];
      }
    });

    // Implementation readiness
    const readiness = quizResults.timeline;
    if (readiness && readinessScores[readiness as keyof typeof readinessScores]) {
      totalScore += readinessScores[readiness as keyof typeof readinessScores];
    }

    // Budget qualification
    const budget = quizResults.budget;
    if (budget) {
      if (budget === 'under_5k') totalScore += 5;
      else if (budget === '5k_15k') totalScore += 15;
      else if (budget === '15k_50k') totalScore += 25;
      else if (budget === 'over_50k') totalScore += 30;
    }
  }

  // Determine segment and recommendations
  let segment: LeadScore['segment'];
  if (totalScore >= 70) {
    segment = 'qualified';
    recommendations.push('Priorité maximale - Contact immédiat', 'Proposition personnalisée', 'Demo live recommandée');
  } else if (totalScore >= 50) {
    segment = 'hot';
    recommendations.push('Contact dans 24h', 'Envoyer case studies pertinents', 'Proposer consultation gratuite');
  } else if (totalScore >= 30) {
    segment = 'warm';
    recommendations.push('Séquence nurture email activée', 'Contenu éducatif ciblé', 'Suivi dans 3-5 jours');
  } else {
    segment = 'cold';
    recommendations.push('Séquence éducative longue', 'Focus sur sensibilisation', 'Suivi mensuel');
  }

  return {
    score: totalScore,
    segment,
    factors,
    recommendations
  };
};

export const updateLeadScoring = async (leadId: string, quizResults: any, engagementData?: any) => {
  try {
    const leadScore = calculateLeadScore(quizResults);
    
    // Add engagement factors
    if (engagementData) {
      if (engagementData.timeOnSite > 300) { // 5+ minutes
        leadScore.score += 10;
        leadScore.factors.timeOnSite = 10;
      }
      
      if (engagementData.pageViews > 3) {
        leadScore.score += 15;
        leadScore.factors.pageViews = 15;
      }

      if (engagementData.emailOpens > 0) {
        leadScore.score += 5 * engagementData.emailOpens;
        leadScore.factors.emailEngagement = 5 * engagementData.emailOpens;
      }

      if (engagementData.bookingPageViews > 0) {
        leadScore.score += 20;
        leadScore.factors.bookingIntent = 20;
      }
    }

    // Recalculate segment after engagement factors
    if (leadScore.score >= 70) leadScore.segment = 'qualified';
    else if (leadScore.score >= 50) leadScore.segment = 'hot';
    else if (leadScore.score >= 30) leadScore.segment = 'warm';
    else leadScore.segment = 'cold';

    // Update lead in database
    const { error } = await supabase
      .from('leads')
      .update({
        score: leadScore.score,
        segment: leadScore.segment,
        scoring_data: JSON.parse(JSON.stringify(leadScore)) // Convert to plain object for JSON storage
      })
      .eq('id', leadId);

    if (error) throw error;

    return leadScore;
  } catch (error) {
    console.error('Error updating lead scoring:', error);
    return null;
  }
};

// Get leads by segment for targeted campaigns
export const getLeadsBySegment = async (segment: LeadScore['segment']) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('segment', segment)
      .order('score', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching leads by segment:', error);
    return [];
  }
};

// Quebec-specific business context scoring
export const getQuebecBusinessContext = (industry: string, location: string) => {
  const industryMultipliers = {
    'manufacturing': 1.2,     // High automation potential
    'retail': 1.1,           // Good fit for POS integration
    'professional_services': 1.3, // High value, easy implementation
    'healthcare': 1.1,       // Compliance needs
    'construction': 1.0,     // Traditional sector
    'technology': 0.9        // Likely have existing solutions
  };

  const locationMultipliers = {
    'montreal': 1.2,         // Tech-forward market
    'quebec_city': 1.1,      // Government contracts potential
    'laval': 1.0,
    'gatineau': 1.1,         // Government proximity
    'other': 1.0
  };

  const industryMultiplier = industryMultipliers[industry as keyof typeof industryMultipliers] || 1.0;
  const locationMultiplier = locationMultipliers[location as keyof typeof locationMultipliers] || 1.0;

  return industryMultiplier * locationMultiplier;
};