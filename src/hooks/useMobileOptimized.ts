import { useEffect, useState } from 'react';
import { useIsMobile } from './use-mobile';

/**
 * Hook for mobile-optimized features and behaviors
 * Handles performance optimizations and UX improvements for mobile devices
 */
export const useMobileOptimized = () => {
  const isMobile = useIsMobile();
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast'>('fast');

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    // Detect slow connections
    const connection = (navigator as any).connection;
    if (connection) {
      const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                              connection.effectiveType === '2g' ||
                              connection.saveData;
      setConnectionSpeed(isSlowConnection ? 'slow' : 'fast');
    }

    // Prevent horizontal scrolling on mobile
    if (isMobile) {
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflowX = 'hidden';
    }

    return () => {
      if (isMobile) {
        document.documentElement.style.overflowX = '';
        document.body.style.overflowX = '';
      }
    };
  }, [isMobile]);

  // Mobile-optimized touch target size
  const touchTargetClass = isMobile ? 'min-h-[44px] min-w-[44px]' : '';

  // Reduced animation classes for performance
  const animationClass = isReducedMotion || (isMobile && connectionSpeed === 'slow') 
    ? 'transition-none' 
    : 'transition-all duration-300';

  // Image loading strategy
  const imageLoadingStrategy = isMobile && connectionSpeed === 'slow' ? 'lazy' : 'eager';

  return {
    isMobile,
    isReducedMotion,
    connectionSpeed,
    touchTargetClass,
    animationClass,
    imageLoadingStrategy,
    // Helper classes for mobile optimization
    mobileTextClass: 'whitespace-normal break-words text-balance',
    mobileButtonClass: 'w-full sm:w-auto max-w-full whitespace-normal break-words text-center min-w-0',
    mobileContainerClass: 'overflow-x-hidden px-4 sm:px-6',
  };
};