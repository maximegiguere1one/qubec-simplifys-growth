import { supabase } from "@/integrations/supabase/client";

// Generate session ID for anonymous tracking
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Get or create lead ID for email-based tracking
export const getLeadId = (): string | null => {
  return localStorage.getItem('lead_id');
};

export const setLeadId = (leadId: string): void => {
  localStorage.setItem('lead_id', leadId);
};

// Get UTM parameters from URL
export const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  };
};

// Create or update lead
export const createLead = async (email: string, name: string, phone?: string, source: string = 'landing_page') => {
  const utmParams = getUTMParams();
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .upsert({
        email,
        name,
        phone,
        source,
        ...utmParams,
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;
    
    if (data) {
      setLeadId(data.id);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating lead:', error);
    return null;
  }
};

// Define event types to match database enum
export type FunnelEventType = 
  | 'lp_view'
  | 'lp_submit_optin'
  | 'quiz_start'
  | 'quiz_question_answer'
  | 'quiz_complete'
  | 'vsl_view'
  | 'vsl_play'
  | 'vsl_cta_click'
  | 'bookcall_view'
  | 'bookcall_submit'
  | 'bookcall_confirm';

// Track funnel events
export const trackEvent = async (
  eventType: FunnelEventType,
  eventData: Record<string, any> = {},
  leadId?: string | null
) => {
  try {
    const sessionId = getSessionId();
    const currentLeadId = leadId || getLeadId();

    await supabase.from('funnel_events').insert({
      session_id: sessionId,
      lead_id: currentLeadId,
      event_type: eventType,
      event_data: eventData,
      page_url: window.location.href,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// A/B Testing utilities
export const getABVariant = (testName: string, variants: string[]): string => {
  const storageKey = `ab_test_${testName}`;
  let variant = localStorage.getItem(storageKey);
  
  if (!variant) {
    // Use session ID to ensure consistent assignment
    const sessionId = getSessionId();
    const hash = sessionId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const index = Math.abs(hash) % variants.length;
    variant = variants[index];
    localStorage.setItem(storageKey, variant);
    
    // Track A/B test exposure immediately
    trackABTest(testName, variant);
  }
  
  return variant;
};

// Track A/B test assignment
export const trackABTest = async (testName: string, variant: string) => {
  await trackEvent('quiz_question_answer', { 
    event_type: 'ab_test_assignment',
    test_name: testName, 
    variant 
  });
};

// Track A/B test conversion
export const trackABConversion = async (testName: string, variant: string, conversionType: string = 'click') => {
  await trackEvent('quiz_question_answer', {
    event_type: 'ab_test_conversion',
    test_name: testName,
    variant,
    conversion_type: conversionType
  });
};

// VSL specific tracking
export const trackVSLEvent = async (eventType: 'play' | 'pause' | 'progress' | 'complete' | 'cta_click' | 'cta_show', data: Record<string, any> = {}) => {
  await trackEvent('vsl_play', {
    vsl_event_type: eventType,
    ...data
  });
};

// Enhanced CTA tracking with location and variant
export const trackCTAClick = async (location: string, variant?: string, destination?: string) => {
  await trackEvent('vsl_cta_click', {
    cta_location: location,
    variant,
    destination,
    timestamp: Date.now()
  });
};

// Quiz-specific tracking
export const startQuizSession = async (leadId?: string | null) => {
  try {
    const sessionId = getSessionId();
    const currentLeadId = leadId || getLeadId();

    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        lead_id: currentLeadId,
        session_id: sessionId,
        status: 'started',
      })
      .select()
      .single();

    if (error) throw error;
    
    // Store quiz session ID for tracking answers
    localStorage.setItem('quiz_session_id', data.id);
    
    await trackEvent('quiz_start', { quiz_session_id: data.id });
    
    return data;
  } catch (error) {
    console.error('Error starting quiz session:', error);
    return null;
  }
};

export const trackQuizAnswer = async (
  questionId: number,
  answerValue: string,
  answerScore: number,
  timeSpent: number
) => {
  try {
    const quizSessionId = localStorage.getItem('quiz_session_id');
    if (!quizSessionId) return;

    await supabase.from('quiz_answers').insert({
      quiz_session_id: quizSessionId,
      question_id: questionId,
      answer_value: answerValue,
      answer_score: answerScore,
      time_spent_seconds: timeSpent,
    });

    await trackEvent('quiz_question_answer', {
      quiz_session_id: quizSessionId,
      question_id: questionId,
      answer_value: answerValue,
      answer_score: answerScore,
      time_spent: timeSpent,
    });
  } catch (error) {
    console.error('Error tracking quiz answer:', error);
  }
};

export const completeQuizSession = async (totalScore: number, timeSpent: number) => {
  try {
    const quizSessionId = localStorage.getItem('quiz_session_id');
    if (!quizSessionId) return;

    await supabase
      .from('quiz_sessions')
      .update({
        status: 'completed',
        total_score: totalScore,
        time_spent_seconds: timeSpent,
        completed_at: new Date().toISOString(),
      })
      .eq('id', quizSessionId);

    await trackEvent('quiz_complete', {
      quiz_session_id: quizSessionId,
      total_score: totalScore,
      time_spent: timeSpent,
    });
  } catch (error) {
    console.error('Error completing quiz session:', error);
  }
};

// Booking tracking
export const trackBooking = async (bookingData: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  challenge?: string;
  selectedDate: string;
  selectedTime: string;
}) => {
  try {
    const sessionId = getSessionId();
    const currentLeadId = getLeadId();

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        lead_id: currentLeadId,
        session_id: sessionId,
        ...bookingData,
        selected_date: bookingData.selectedDate,
        selected_time: bookingData.selectedTime,
      })
      .select()
      .single();

    if (error) throw error;

    await trackEvent('bookcall_submit', {
      booking_id: data.id,
      ...bookingData,
    });

    return data;
  } catch (error) {
    console.error('Error tracking booking:', error);
    return null;
  }
};

export const confirmBooking = async (bookingId: string) => {
  try {
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    await trackEvent('bookcall_confirm', { booking_id: bookingId });
  } catch (error) {
    console.error('Error confirming booking:', error);
  }
};