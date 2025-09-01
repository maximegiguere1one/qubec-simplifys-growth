import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';

// Meta Pixel ViewContent tracking with proper parameters
const trackMetaViewContent = (pathname: string) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    const contentMapping: Record<string, {name: string, category: string}> = {
      '/': { name: 'Landing Page', category: 'landing_page' },
      '/quiz': { name: 'Business Efficiency Quiz', category: 'assessment' },
      '/vsl': { name: 'Video Sales Letter', category: 'video_content' },
      '/book-call': { name: 'Booking Page', category: 'consultation' }
    };
    
    const content = contentMapping[pathname] || { name: pathname.replace('/', '') || 'home', category: 'page' };
    
    (window as any).fbq('track', 'ViewContent', {
      content_name: content.name,
      content_category: content.category
    });
  }
};

// Map routes to event types
const routeEventMap: Record<string, string> = {
  '/': 'lp_view',
  '/quiz': 'quiz_view', // Changed from quiz_start to avoid duplication
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
      
      // Track Meta Pixel ViewContent for all pages
      trackMetaViewContent(location.pathname);
    }
  }, [location]);
};

// Hook for tracking page time
export const useTimeTracking = () => {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const pathname = window.location.pathname;
      const eventType = routeEventMap[pathname] || 'lp_view';
      
      trackEvent(eventType as any, {
        event_type: 'page_time',
        time_spent: timeSpent,
        page: pathname,
      });
    };
  }, []);
};