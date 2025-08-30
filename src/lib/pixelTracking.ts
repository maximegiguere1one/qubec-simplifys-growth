// Advanced pixel tracking for Facebook, Google, and custom events
export interface PixelEvent {
  source: 'facebook' | 'google' | 'custom';
  eventName: string;
  parameters?: Record<string, any>;
  value?: number;
  currency?: string;
}

// Facebook Pixel Events
export const FacebookPixel = {
  init: (pixelId: string) => {
    if (typeof window === 'undefined') return;
    
    // Load Facebook Pixel
    !(function(f: any, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    (window as any).fbq('init', pixelId);
    (window as any).fbq('track', 'PageView');
  },

  track: (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window === 'undefined' || !(window as any).fbq) return;
    (window as any).fbq('track', eventName, parameters);
  },

  // One Système specific events
  trackQuizStart: (leadId?: string) => {
    FacebookPixel.track('InitiateCheckout', {
      content_name: 'Business Assessment Quiz',
      content_category: 'Lead Generation',
      value: 0,
      currency: 'CAD',
      custom_lead_id: leadId
    });
  },

  trackQuizComplete: (score: number, segment: string, leadId?: string) => {
    FacebookPixel.track('CompleteRegistration', {
      content_name: 'Quiz Completed',
      content_category: 'Lead Qualification',
      value: score,
      currency: 'CAD',
      custom_segment: segment,
      custom_lead_id: leadId
    });
  },

  trackConsultationBooking: (leadId: string, value: number = 500) => {
    FacebookPixel.track('Purchase', {
      content_name: 'Free Consultation Booking',
      content_category: 'High Intent Action',
      value: value, // Potential consultation value
      currency: 'CAD',
      custom_lead_id: leadId
    });
  },

  trackVideoEngagement: (videoName: string, percentage: number) => {
    if (percentage >= 75) {
      FacebookPixel.track('ViewContent', {
        content_name: videoName,
        content_type: 'video',
        custom_watch_percentage: percentage
      });
    }
  }
};

// Google Analytics 4 Events
export const GoogleAnalytics = {
  init: (measurementId: string) => {
    if (typeof window === 'undefined') return;

    // Load GA4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      // Enhanced ecommerce for B2B tracking
      send_page_view: true,
      custom_map: {
        custom_parameter_lead_id: 'lead_id',
        custom_parameter_lead_score: 'lead_score',
        custom_parameter_segment: 'segment'
      }
    });
  },

  track: (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window === 'undefined' || !(window as any).gtag) return;
    (window as any).gtag('event', eventName, parameters);
  },

  // Quebec business specific tracking
  trackLeadGeneration: (source: string, medium: string, campaign: string) => {
    GoogleAnalytics.track('generate_lead', {
      event_category: 'Lead Generation',
      event_label: 'Quebec Business Lead',
      source: source,
      medium: medium,
      campaign: campaign,
      value: 50 // Average lead value
    });
  },

  trackQuizProgress: (questionNumber: number, totalQuestions: number) => {
    const progress = (questionNumber / totalQuestions) * 100;
    GoogleAnalytics.track('quiz_progress', {
      event_category: 'Engagement',
      event_label: 'Business Assessment',
      value: progress,
      custom_parameter_question: questionNumber
    });
  },

  trackConsultationIntent: (leadScore: number, segment: string) => {
    GoogleAnalytics.track('begin_checkout', {
      event_category: 'Conversion Intent',
      event_label: 'Free Consultation',
      value: leadScore,
      custom_parameter_lead_score: leadScore,
      custom_parameter_segment: segment
    });
  }
};

// LinkedIn Insight Tag (for B2B targeting)
export const LinkedInInsight = {
  init: (partnerId: string) => {
    if (typeof window === 'undefined') return;

    (window as any)._linkedin_partner_id = partnerId;
    (window as any)._linkedin_data_partner_ids = (window as any)._linkedin_data_partner_ids || [];
    (window as any)._linkedin_data_partner_ids.push(partnerId);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(script);
  },

  track: (conversionId: string) => {
    if (typeof window === 'undefined' || !(window as any).lintrk) return;
    (window as any).lintrk('track', { conversion_id: conversionId });
  }
};

// Unified tracking function for all pixels
export const trackEvent = async (event: PixelEvent) => {
  try {
    const { source, eventName, parameters, value, currency } = event;

    switch (source) {
      case 'facebook':
        FacebookPixel.track(eventName, { ...parameters, value, currency });
        break;
      
      case 'google':
        GoogleAnalytics.track(eventName, { ...parameters, value, currency });
        break;
      
      case 'custom':
        // Store custom events in our database for analysis
        const customEventData = {
          event_name: eventName,
          parameters: parameters || {},
          value: value || 0,
          timestamp: new Date().toISOString(),
          page_url: window.location.href,
          user_agent: navigator.userAgent
        };
        
        // This would be stored in our analytics system
        console.log('Custom event tracked:', customEventData);
        break;
    }
  } catch (error) {
    console.error('Error tracking pixel event:', error);
  }
};

// One Système specific tracking functions
export const OneSystemeTracking = {
  // Landing page events
  trackLandingPageView: (source?: string) => {
    trackEvent({
      source: 'facebook',
      eventName: 'ViewContent',
      parameters: { 
        content_name: 'One Système Landing Page',
        content_type: 'landing_page',
        source: source 
      }
    });
    
    trackEvent({
      source: 'google',
      eventName: 'page_view',
      parameters: { 
        page_title: 'One Système - Simplifiez vos opérations',
        page_location: window.location.href,
        source: source
      }
    });
  },

  // Lead capture events
  trackLeadCapture: (leadId: string, email: string, name: string) => {
    trackEvent({
      source: 'facebook',
      eventName: 'Lead',
      parameters: {
        content_name: 'Email Capture',
        custom_lead_id: leadId
      }
    });

    trackEvent({
      source: 'google',
      eventName: 'generate_lead',
      parameters: {
        event_category: 'Lead Generation',
        custom_parameter_lead_id: leadId
      }
    });
  },

  // Quiz engagement tracking
  trackQuizEngagement: (questionId: number, timeSpent: number, leadId?: string) => {
    trackEvent({
      source: 'facebook',
      eventName: 'ViewContent',
      parameters: {
        content_name: `Quiz Question ${questionId}`,
        content_type: 'assessment',
        custom_time_spent: timeSpent,
        custom_lead_id: leadId
      }
    });
  },

  // High-intent actions
  trackHighIntentAction: (action: string, leadId: string, leadScore: number) => {
    if (leadScore >= 70) {
      // Track as high-value conversion for qualified leads
      trackEvent({
        source: 'facebook',
        eventName: 'AddToCart',
        parameters: {
          content_name: action,
          value: 1000, // Potential customer value
          currency: 'CAD',
          custom_lead_id: leadId,
          custom_lead_score: leadScore
        }
      });
    }
  },

  // VSL (Video Sales Letter) engagement
  trackVSLEngagement: (watchPercentage: number, leadId?: string) => {
    const milestones = [25, 50, 75, 95];
    const milestone = milestones.find(m => watchPercentage >= m && watchPercentage < m + 5);
    
    if (milestone) {
      trackEvent({
        source: 'facebook',
        eventName: 'ViewContent',
        parameters: {
          content_name: 'One Système VSL',
          content_type: 'video',
          custom_watch_percentage: milestone,
          custom_lead_id: leadId
        }
      });
    }
  },

  // Booking conversion
  trackBookingConversion: (leadId: string, bookingValue: number = 2500) => {
    // This is a high-value conversion
    trackEvent({
      source: 'facebook',
      eventName: 'Purchase',
      parameters: {
        content_name: 'Consultation Booking',
        value: bookingValue,
        currency: 'CAD',
        custom_lead_id: leadId
      }
    });

    trackEvent({
      source: 'google',
      eventName: 'purchase',
      parameters: {
        transaction_id: leadId,
        value: bookingValue,
        currency: 'CAD',
        event_category: 'Conversion'
      }
    });
  }
};

// Initialize all pixels
export const initializeTracking = () => {
  // These would be loaded from environment variables in production
  const FACEBOOK_PIXEL_ID = '1234567890'; // Replace with actual pixel ID
  const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with actual measurement ID
  const LINKEDIN_PARTNER_ID = '12345'; // Replace with actual partner ID

  FacebookPixel.init(FACEBOOK_PIXEL_ID);
  GoogleAnalytics.init(GA4_MEASUREMENT_ID);
  LinkedInInsight.init(LINKEDIN_PARTNER_ID);
  
  // Track initial page view
  OneSystemeTracking.trackLandingPageView();
};