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
          break;
        case '/vsl':
          await import('@/pages/VSL');
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
    if (options.onIdle && 'requestIdleCallback' in window) {
      const timeoutId = setTimeout(() => {
        window.requestIdleCallback(() => {
          routes.forEach(route => prefetchRoute(route));
        });
      }, options.delay);

      return () => clearTimeout(timeoutId);
    }
  }, [routes, prefetchRoute, options.onIdle, options.delay]);

  return { handleHover, prefetchRoute };
};