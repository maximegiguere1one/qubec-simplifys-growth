import { useEffect } from 'react';
import { analyticsQueue } from '@/lib/analyticsQueue';

export const useWebVitals = () => {
  useEffect(() => {
    // Enhanced performance tracking with Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observers: PerformanceObserver[] = [];
      
      // Navigation timing
      const navObserver = new PerformanceObserver((list) => {
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

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          analyticsQueue.add('performance_metric', {
            metric_name: 'lcp',
            value: lastEntry.startTime,
          });
        }
      });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        analyticsQueue.add('performance_metric', {
          metric_name: 'cls',
          value: clsValue,
        });
      });

      // First Input Delay approximation
      let firstInputDelay = 0;
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (firstInputDelay === 0) {
            firstInputDelay = (entry as any).processingStart - entry.startTime;
            analyticsQueue.add('performance_metric', {
              metric_name: 'fid',
              value: firstInputDelay,
            });
          }
        }
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        observers.push(navObserver, lcpObserver, clsObserver, fidObserver);
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }

      return () => {
        observers.forEach(observer => observer.disconnect());
      };
    }
  }, []);
};