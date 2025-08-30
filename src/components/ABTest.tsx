import { ReactNode, useEffect, useState } from 'react';
import { getABVariant, trackABTest } from '@/lib/analytics';

interface ABTestProps {
  testName: string;
  variants: Record<string, ReactNode>;
  className?: string;
}

export const ABTest = ({ testName, variants, className }: ABTestProps) => {
  const [variant, setVariant] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const variantNames = Object.keys(variants);
    const selectedVariant = getABVariant(testName, variantNames);
    setVariant(selectedVariant);
    
    // Track the A/B test assignment
    trackABTest(testName, selectedVariant);
    setIsLoaded(true);
  }, [testName, variants]);

  if (!isLoaded || !variant) {
    return null; // Prevent flash of wrong variant
  }

  return (
    <div className={className} data-ab-test={testName} data-variant={variant}>
      {variants[variant]}
    </div>
  );
};

// Hook for A/B testing
export const useABTest = (testName: string, variants: string[]) => {
  const [variant, setVariant] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const selectedVariant = getABVariant(testName, variants);
    setVariant(selectedVariant);
    trackABTest(testName, selectedVariant);
    setIsLoaded(true);
  }, [testName, variants]);

  return { variant, isLoaded };
};