import { useEffect } from 'react';
import { analyticsQueue } from '@/lib/analyticsQueue';

export const useWebVitals = () => {
  useEffect(() => {
    // Simplified performance tracking without web-vitals dependency
    // Track basic performance metrics using Performance API
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            analyticsQueue.add('performance_metric', {
              metric_name: 'load_time',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }

      return () => {
        observer.disconnect();
      };
    }
  }, []);
};