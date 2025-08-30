import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';

// Map routes to event types
const routeEventMap: Record<string, string> = {
  '/': 'lp_view',
  '/quiz': 'quiz_start',
  '/vsl': 'vsl_view',
  '/book-call': 'bookcall_view',
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const eventType = routeEventMap[location.pathname];
    if (eventType) {
      trackEvent(eventType as any, {
        path: location.pathname,
        search: location.search,
      });
    }
  }, [location]);
};

// Hook for tracking page time
export const useTimeTracking = () => {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackEvent('quiz_question_answer', {
        event_type: 'page_time',
        time_spent: timeSpent,
        page: window.location.pathname,
      });
    };
  }, []);
};