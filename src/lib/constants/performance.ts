// Performance optimization constants
export const PERFORMANCE_CONFIG = {
  // Core Web Vitals targets
  LCP_TARGET: 2500, // 2.5s
  CLS_TARGET: 0.1,
  FID_TARGET: 100,
  
  // Image loading strategies
  HERO_IMAGE_PRIORITY: true,
  LAZY_LOADING_THRESHOLD: '100px',
  
  // Preload strategies
  CRITICAL_FONTS: [
    '/fonts/inter-var.woff2'
  ],
  
  CRITICAL_ASSETS: [
    '/assets/hero-image.jpg'
  ],
  
  // A/B test cache duration
  AB_TEST_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  
  // Analytics batching
  ANALYTICS_BATCH_SIZE: 10,
  ANALYTICS_BATCH_TIMEOUT: 5000, // 5 seconds
} as const;

// Mobile optimization breakpoints
export const MOBILE_BREAKPOINTS = {
  SMALL: 320,
  MEDIUM: 375,
  LARGE: 430,
  TABLET: 768,
} as const;

// Touch target minimums (WCAG AA)
export const ACCESSIBILITY_TARGETS = {
  MIN_TOUCH_TARGET: 44, // px
  MIN_TEXT_SIZE: 16, // px
  MIN_CONTRAST_RATIO: 4.5,
} as const;