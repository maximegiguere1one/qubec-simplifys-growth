import { supabase } from "@/integrations/supabase/client";
import { analyticsQueue } from "@/lib/analyticsQueue";

// Send event to Facebook Conversions API via Edge Function
const sendToConversionsAPI = async (
  eventType: string,
  eventData: Record<string, any>,
  leadId?: string | null
) => {
  try {
    // Get lead data for enhanced tracking
    let leadData = null;
    if (leadId) {
      const { data } = await supabase
        .from('leads')
        .select('email, name, phone')
        .eq('id', leadId)
        .single();
      leadData = data;
    }

    // Call our Edge Function to send to Facebook Conversions API
    const response = await supabase.functions.invoke('facebook-conversions-api', {
      body: {
        eventType,
        eventData: {
          ...eventData,
          client_ip: eventData.client_ip, // Will be populated by Edge Function from request
        },
        leadData,
      }
    });

    if (response.error) {
      console.warn('Facebook Conversions API warning:', response.error);
    } else {
      console.log('Facebook Conversions API success:', response.data);
    }
  } catch (error) {
    console.warn('Failed to send to Facebook Conversions API:', error);
    // Don't throw - we don't want to break the main tracking flow
  }
};

// Meta Pixel helper function with proper case sensitivity
const trackMetaPixelEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    if (parameters) {
      (window as any).fbq('track', eventName, parameters);
    } else {
      (window as any).fbq('track', eventName);
    }
    console.log(`Meta Pixel: ${eventName}`, parameters || {});
  }
};

// Track Meta Pixel custom events for funnel optimization
const trackMetaPixelCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    if (parameters) {
      (window as any).fbq('trackCustom', eventName, parameters);
    } else {
      (window as any).fbq('trackCustom', eventName);
    }
    console.log(`Meta Pixel Custom: ${eventName}`, parameters || {});
  }
};

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
      // Track Meta Pixel Lead event for successful lead creation
      trackMetaPixelEvent('Lead', {
        content_name: 'Lead Capture',
        content_category: source,
        value: 0.00,
        currency: 'CAD'
      });
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
  | 'bookcall_confirm'
  | 'guarantee_view'
  | 'guarantee_cta_click';

// Track funnel events with Meta Pixel and Conversions API integration
export const trackEvent = (
  eventType: FunnelEventType, 
  eventData: Record<string, any> = {},
  leadId?: string | null
) => {
  try {
    const sessionId = getSessionId();
    const currentLeadId = leadId || getLeadId();
    
    // Enhanced event data
    const enhancedEventData = {
      ...eventData,
      session_id: sessionId,
      lead_id: currentLeadId,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      url: window.location.href,
      timestamp: Date.now(),
      // Add Facebook Click ID and Browser ID for better attribution
      fbc: localStorage.getItem('_fbc'),
      fbp: localStorage.getItem('_fbp'),
    };

    // Track in our analytics queue
    analyticsQueue.add(eventType, enhancedEventData, currentLeadId);

    // Send to Facebook Conversions API via Edge Function for server-to-server tracking
    sendToConversionsAPI(eventType, enhancedEventData, currentLeadId);

    // Map internal events to Meta Pixel standard events
    switch(eventType) {
      case 'lp_view':
        trackMetaPixelEvent('ViewContent', { 
          content_name: 'Landing Page',
          content_category: 'landing_page' 
        });
        break;
      case 'lp_submit_optin':
        trackMetaPixelEvent('Lead');
        break;
      case 'quiz_start':
        trackMetaPixelEvent('ViewContent', { 
          content_name: 'Quiz Start',
          content_category: 'quiz' 
        });
        trackMetaPixelCustomEvent('QuizStart');
        break;
      case 'quiz_question_answer':
        trackMetaPixelCustomEvent('QuizProgress', {
          question_number: eventData.question_id,
          score: eventData.answer_score
        });
        break;
      case 'quiz_complete':
        trackMetaPixelEvent('CompleteRegistration');
        trackMetaPixelCustomEvent('QuizComplete', {
          total_score: eventData.total_score,
          time_spent: eventData.time_spent
        });
        break;
      case 'vsl_view':
        trackMetaPixelEvent('ViewContent', { 
          content_name: 'VSL Page',
          content_category: 'video_sales_letter' 
        });
        break;
      case 'vsl_play':
        if (eventData.event_type === 'play') {
          trackMetaPixelCustomEvent('VideoPlay');
        } else if (eventData.event_type === 'complete') {
          trackMetaPixelCustomEvent('VideoComplete');
        }
        break;
      case 'vsl_cta_click':
        trackMetaPixelEvent('InitiateCheckout');
        break;
      case 'bookcall_view':
        trackMetaPixelEvent('ViewContent', { 
          content_name: 'Booking Page',
          content_category: 'booking' 
        });
        break;
      case 'bookcall_submit':
        trackMetaPixelEvent('Schedule');
        trackMetaPixelEvent('Lead');
        break;
      case 'bookcall_confirm':
        trackMetaPixelEvent('Purchase', {
          value: 0.00,
          currency: 'CAD',
          content_name: 'Discovery Call Booking',
          content_category: 'consultation'
        });
        break;
    }
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

// Send quiz confirmation email
export const sendQuizConfirmationEmail = async (
  leadId: string,
  totalScore: number,
  timeSpent: number,
  answers: Record<number, string>,
  diagnostic: string,
  contactInfo: { name: string; email: string; phone: string }
) => {
  try {
    const response = await supabase.functions.invoke('send-quiz-confirmation', {
      body: {
        leadId,
        totalScore,
        timeSpent,
        answers,
        diagnostic,
        contactInfo
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Track email send success
    await trackEvent('quiz_complete', {
      event_type: 'confirmation_email_sent',
      email_id: response.data?.emailId,
      total_score: totalScore
    });

    return response.data;
  } catch (error) {
    console.error('Error sending quiz confirmation email:', error);
    
    // Track email send failure
    await trackEvent('quiz_complete', {
      event_type: 'confirmation_email_failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      total_score: totalScore
    });

    throw error;
  }
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

  // Additional Meta Pixel tracking for high-intent actions
  if (destination === '/book-call' || location.includes('vsl')) {
    trackMetaPixelEvent('InitiateCheckout');
    trackMetaPixelCustomEvent('CTAClick', {
      cta_location: location,
      variant: variant || 'default',
      destination: destination || 'unknown'
    });
  }
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

    // Track Meta Pixel CompleteRegistration with enhanced data
    trackMetaPixelEvent('CompleteRegistration', {
      content_name: 'Business Efficiency Quiz',
      content_category: 'assessment',
      custom_score: totalScore,
      time_spent: timeSpent
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

    // Track Meta Pixel Schedule with value
    trackMetaPixelEvent('Schedule', {
      content_name: 'Discovery Call Booking',
      content_category: 'consultation',
      value: 500.00, // Estimated value of a consultation
      currency: 'CAD'
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