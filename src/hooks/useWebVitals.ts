import { useEffect } from 'react';
import { analyticsQueue } from '@/lib/analyticsQueue';

// Dynamic import for web-vitals to avoid bundle bloat
const loadWebVitals = async () => {
  try {
    const webVitals = await import('web-vitals');
    return webVitals;
  } catch (error) {
    console.warn('Web Vitals could not be loaded:', error);
    return null;
  }
};

export const useWebVitals = (reportAllChanges: boolean = false) => {
  useEffect(() => {
    const initWebVitals = async () => {
      const webVitals = await loadWebVitals();
      if (!webVitals) return;

      const { onCLS, onLCP } = webVitals;

      // Track Core Web Vitals
      onCLS((metric) => {
        analyticsQueue.add('performance_metric', {
          metric_name: 'CLS',
          value: metric.value,
          rating: metric.rating,
        });
      });

      onLCP((metric) => {
        analyticsQueue.add('performance_metric', {
          metric_name: 'LCP',
          value: metric.value,
          rating: metric.rating,
        });
      });
    };

    initWebVitals();
  }, [reportAllChanges]);
};