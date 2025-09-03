import { useEffect, useCallback } from 'react';

interface PrefetchOptions {
  onHover?: boolean;
  onIdle?: boolean;
  delay?: number;
}

export const usePrefetch = (
  routes: string[],
  options: PrefetchOptions = { onHover: true, onIdle: true, delay: 2000 }
) => {
  const prefetchRoute = useCallback(async (route: string) => {
    try {
      switch (route) {
        case '/quiz':
          await import('@/pages/Quiz');
          console.log('Quiz page prefetched');
          break;
        case '/vsl':
          await import('@/pages/VSL');
          console.log('VSL page prefetched');
          break;
        case '/landing':
          await import('@/pages/Landing');
          console.log('Landing page prefetched');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Prefetch failed for route:', route, error);
    }
  }, []);

  const handleHover = useCallback((route: string) => {
    if (options.onHover) {
      prefetchRoute(route);
    }
  }, [prefetchRoute, options.onHover]);

  useEffect(() => {
    if (options.onIdle) {
      const timeoutId = setTimeout(() => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            routes.forEach(route => prefetchRoute(route));
          });
        } else {
          // Fallback for Safari and older browsers
          setTimeout(() => {
            routes.forEach(route => prefetchRoute(route));
          }, 100);
        }
      }, options.delay);

      return () => clearTimeout(timeoutId);
    }
  }, [routes, prefetchRoute, options.onIdle, options.delay]);

  return { handleHover, prefetchRoute };
};