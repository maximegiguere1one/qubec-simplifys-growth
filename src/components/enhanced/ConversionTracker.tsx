import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// Track key conversion events and user behavior
export const ConversionTracker = () => {
  useEffect(() => {
    // Track scroll depth
    let maxScroll = 0;
    
    const handleScroll = () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track milestone scrolls
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          trackEvent('vsl_play', { 
            event_type: 'scroll_depth', 
            scroll_percent: scrollPercent 
          });
        }
      }
    };

    // Track time on page
    const startTime = Date.now();
    
    const trackTimeOnPage = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Track key time milestones
      if ([30, 60, 120, 300].includes(timeSpent)) {
        trackEvent('vsl_play', { 
          event_type: 'time_on_page', 
          seconds: timeSpent 
        });
      }
    };

    // Track exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        trackEvent('vsl_play', { 
          event_type: 'exit_intent',
          scroll_percent: maxScroll,
          time_spent: Math.floor((Date.now() - startTime) / 1000)
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    const timeTracker = setInterval(trackTimeOnPage, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(timeTracker);
      
      // Track final session data
      const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackEvent('vsl_play', { 
        event_type: 'session_end',
        total_time: finalTimeSpent,
        max_scroll: maxScroll
      });
    };
  }, []);

  return null; // This is a tracking component, no UI
};

// Hook for tracking form interactions
export const useFormTracking = (formName: string) => {
  const trackFormEvent = (eventType: string, data: Record<string, any> = {}) => {
    trackEvent('bookcall_submit', {
      form_name: formName,
      event_type: eventType,
      ...data
    });
  };

  return { trackFormEvent };
};