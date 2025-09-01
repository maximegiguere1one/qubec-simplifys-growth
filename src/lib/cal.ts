import React from 'react';
import { trackEvent } from '@/lib/analytics';

// Global Cal.com integration for One Système
declare global {
  interface Window {
    Cal?: any;
  }
}

// Cal.com configuration
const CAL_CONFIG = {
  namespace: "reservez-votre-consultation-gratuite",
  link: "maxime-giguere-umemh7/reservez-votre-consultation-gratuite",
  embedUrl: "https://app.cal.com/embed/embed.js",
  origin: "https://app.cal.com",
  directUrl: "https://cal.com/maxime-giguere-umemh7/reservez-votre-consultation-gratuite"
};

// Initialize Cal.com embed
export const initCalEmbed = () => {
  if (typeof window === 'undefined') return;

  // Cal.com embed initialization script
  (function (C: any, A: string, L: string) {
    let p = function (a: any, ar: any) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
      let cal = C.Cal;
      let ar = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        d.head.appendChild(d.createElement("script")).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else p(cal, ar);
        return;
      }
      p(cal, ar);
    };
  })(window, CAL_CONFIG.embedUrl, "init");

  // Initialize the namespace
  if (window.Cal) {
    window.Cal("init", CAL_CONFIG.namespace, { origin: CAL_CONFIG.origin });

    // Apply custom theming
    window.Cal.ns[CAL_CONFIG.namespace]("ui", {
      "cssVarsPerTheme": {
        "dark": {
          "cal-brand": "#eb9e43"
        }
      },
      "hideEventTypeDetails": false,
      "layout": "month_view"
    });
  }
};

// Open Cal.com booking modal programmatically
export const openCal = (source?: string) => {
  try {
    // Track booking intent
    trackEvent('bookcall_view' as any, {
      event_type: 'booking_intent',
      source: source || 'direct',
      method: 'cal_embed'
    });

    if (typeof window !== 'undefined' && window.Cal && window.Cal.ns[CAL_CONFIG.namespace]) {
      // Use Cal.com namespace to open modal
      window.Cal.ns[CAL_CONFIG.namespace]("openModal", {
        calLink: CAL_CONFIG.link,
        config: {
          layout: "month_view"
        }
      });
    } else {
      // Fallback: open direct Cal.com link in new tab
      console.warn('Cal.com embed not loaded, opening direct link');
      window.open(CAL_CONFIG.directUrl, '_blank');
    }
  } catch (error) {
    console.error('Error opening Cal.com:', error);
    // Ultimate fallback
    if (typeof window !== 'undefined') {
      window.open(CAL_CONFIG.directUrl, '_blank');
    }
  }
};

// Cal.com event listeners for tracking
export const setupCalTracking = () => {
  if (typeof window === 'undefined') return;

  // Listen for Cal.com events if available
  if (window.Cal) {
    window.Cal.ns[CAL_CONFIG.namespace]("on", {
      action: "bookingSuccessful",
      callback: (e: any) => {
        trackEvent('bookcall_confirm' as any, {
          booking_id: e.detail?.bookingId,
          event_type: 'booking_confirmed',
          method: 'cal_embed'
        });
      }
    });

    window.Cal.ns[CAL_CONFIG.namespace]("on", {
      action: "linkReady",
      callback: () => {
        console.log('Cal.com embed ready');
      }
    });
  }
};

// React component for Cal.com provider
export const CalEmbedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    initCalEmbed();
    setupCalTracking();
  }, []);

  return React.createElement(React.Fragment, null, children);
};

// Get Cal.com data attributes for buttons
export const getCalDataAttributes = () => ({
  'data-cal-link': CAL_CONFIG.link,
  'data-cal-namespace': CAL_CONFIG.namespace,
  'data-cal-config': JSON.stringify({ layout: "month_view" })
});

// Direct Cal.com link for emails and external use
export const getCalDirectLink = (source?: string) => {
  const url = new URL(CAL_CONFIG.directUrl);
  if (source) {
    url.searchParams.set('utm_source', source);
  }
  return url.toString();
};