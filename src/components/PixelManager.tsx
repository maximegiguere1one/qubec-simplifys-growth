import { useEffect } from 'react';
import { initializeTracking, OneSystemeTracking } from '@/lib/pixelTracking';

interface PixelManagerProps {
  children: React.ReactNode;
}

export const PixelManager = ({ children }: PixelManagerProps) => {
  useEffect(() => {
    // Initialize all tracking pixels on app load
    initializeTracking();
    
    // Track initial page view
    OneSystemeTracking.trackLandingPageView(new URLSearchParams(window.location.search).get('utm_source') || undefined);
  }, []);

  return <>{children}</>;
};