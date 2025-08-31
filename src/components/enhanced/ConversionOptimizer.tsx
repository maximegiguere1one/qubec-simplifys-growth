import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';

interface ConversionOptimizerProps {
  page: 'landing' | 'quiz' | 'vsl' | 'booking';
  children: React.ReactNode;
}

export const ConversionOptimizer = ({ page, children }: ConversionOptimizerProps) => {
  const [scrollDepth, setScrollDepth] = useState(0);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const { isMobile } = useMobileOptimized();

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      // Track meaningful scroll milestones using existing event types
      if (scrollPercent >= 90 && scrollDepth < 90) {
        trackEvent('vsl_view', { event_type: 'scroll_depth', depth: 90, page });
        setScrollDepth(90);
      } else if (scrollPercent >= 75 && scrollDepth < 75) {
        trackEvent('vsl_view', { event_type: 'scroll_depth', depth: 75, page });
        setScrollDepth(75);
      } else if (scrollPercent >= 50 && scrollDepth < 50) {
        trackEvent('vsl_view', { event_type: 'scroll_depth', depth: 50, page });
        setScrollDepth(50);
      } else if (scrollPercent >= 25 && scrollDepth < 25) {
        trackEvent('vsl_view', { event_type: 'scroll_depth', depth: 25, page });
        setScrollDepth(25);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDepth, page]);

  // Track time on page
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const currentTime = Math.floor((Date.now() - startTime) / 1000);
      setTimeOnPage(currentTime);
      
      // Track time milestones using existing event types
      if (currentTime === 30) {
        trackEvent('vsl_view', { event_type: 'time_on_page', seconds: 30, page });
      } else if (currentTime === 60) {
        trackEvent('vsl_view', { event_type: 'time_on_page', seconds: 60, page });
      } else if (currentTime === 120) {
        trackEvent('vsl_view', { event_type: 'time_on_page', seconds: 120, page });
      } else if (currentTime === 300) {
        trackEvent('vsl_view', { event_type: 'time_on_page', seconds: 300, page });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [page]);

  // Track exit intent (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown) {
        trackEvent('vsl_view', { event_type: 'exit_intent', page, time_on_page: timeOnPage, scroll_depth: scrollDepth });
        setExitIntentShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isMobile, exitIntentShown, timeOnPage, scrollDepth, page]);

  // Track session end
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackEvent('vsl_view', { 
        event_type: 'session_end',
        page, 
        time_on_page: timeOnPage, 
        max_scroll_depth: scrollDepth 
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [page, timeOnPage, scrollDepth]);

  return <>{children}</>;
};

// Hook for tracking form interactions
export const useFormTracking = (formName: string) => {
  const trackFormEvent = (eventType: string, data?: Record<string, any>) => {
    trackEvent('bookcall_view', {
      event_type: 'form_interaction',
      form_name: formName,
      interaction_type: eventType,
      ...data
    });
  };

  return { trackFormEvent };
};