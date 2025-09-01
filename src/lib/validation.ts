import { z } from 'zod';

// Validation schemas for all form data
export const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().optional().refine((phone) => {
    if (!phone) return true;
    return phone.length >= 10;
  }, 'Phone number must be at least 10 digits'),
  source: z.enum(['landing_page', 'quiz', 'vsl', 'direct']),
  utm_source: z.string().max(255).regex(/^[a-zA-Z0-9_-]*$/, 'Invalid UTM source format').optional(),
  utm_medium: z.string().max(255).regex(/^[a-zA-Z0-9_-]*$/, 'Invalid UTM medium format').optional(),
  utm_campaign: z.string().max(255).optional(),
  honeypot: z.string().max(0, 'Bot detected').optional(), // Should be empty
});

export const quizAnswerSchema = z.object({
  questionId: z.number().int().min(1).max(20),
  answerValue: z.string().min(1, 'Answer required').max(500, 'Answer too long'),
  answerScore: z.number().int().min(0).max(10),
  timeSpent: z.number().int().min(1).max(600).optional(), // 1 second to 10 minutes
});

export const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long'),
  company: z.string().max(200, 'Company name too long').optional(),
  challenge: z.string().max(1000, 'Challenge description too long').optional(),
  selectedDate: z.string().date('Invalid date format'),
  selectedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  timezone: z.enum(['America/Toronto', 'America/Montreal', 'America/Vancouver', 'America/Edmonton']),
  sessionId: z.string().regex(/^sess_\d+_[a-zA-Z0-9]{9}$/, 'Invalid session ID'),
  honeypot: z.string().max(0, 'Bot detected').optional(), // Should be empty
});

export const funnelEventSchema = z.object({
  eventType: z.enum([
    'lp_view', 'lp_submit_optin', 'quiz_start', 'quiz_question_answer',
    'quiz_complete', 'vsl_view', 'vsl_play', 'vsl_cta_click',
    'bookcall_view', 'bookcall_submit', 'bookcall_confirm',
    'guarantee_view', 'guarantee_cta_click'
  ]),
  sessionId: z.string().regex(/^sess_\d+_[a-zA-Z0-9]{9}$/, 'Invalid session ID'),
  eventData: z.record(z.any()).refine((data) => {
    // Validate timestamp is within reasonable bounds
    if (data.timestamp) {
      const timestamp = Number(data.timestamp);
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      const fiveMinutesFromNow = now + (5 * 60 * 1000);
      return timestamp > oneHourAgo && timestamp <= fiveMinutesFromNow;
    }
    return true;
  }, 'Invalid timestamp'),
  leadId: z.string().uuid().optional(),
  pageUrl: z.string().url().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
});

// Timezone validation utilities
export const VALID_TIMEZONES = [
  'America/Toronto',
  'America/Montreal', 
  'America/Vancouver',
  'America/Edmonton'
] as const;

export const validateTimezone = (timezone: string): boolean => {
  return VALID_TIMEZONES.includes(timezone as any);
};

// Date/time validation
export const validateBookingDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 90); // 90 days from now
  
  return date >= today && date <= maxDate;
};

// IP rate limiting validation (for Edge Functions)
export const validateRateLimit = (attempts: number, maxAttempts: number = 10): boolean => {
  return attempts < maxAttempts;
};

// Honeypot detection
export const detectHoneypot = (formData: Record<string, any>): boolean => {
  const honeypotFields = ['website', 'url', 'honeypot', 'bot_field'];
  return honeypotFields.some(field => 
    formData[field] && String(formData[field]).trim().length > 0
  );
};

// Session ID validation
export const validateSessionId = (sessionId: string): boolean => {
  return /^sess_\d+_[a-zA-Z0-9]{9}$/.test(sessionId);
};

// UTM parameter sanitization
export const sanitizeUTMParams = (params: Record<string, any>) => {
  const sanitized: Record<string, string> = {};
  
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
    if (params[key]) {
      const value = String(params[key]).trim();
      if (value.length <= 255) {
        sanitized[key] = value;
      }
    }
  });
  
  return sanitized;
};

// Comprehensive form validation function
export const validateFormData = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown,
  checkHoneypot: boolean = true
): { success: boolean; data?: T; errors?: string[] } => {
  try {
    // Check honeypot first if enabled
    if (checkHoneypot && detectHoneypot(data as Record<string, any>)) {
      return { success: false, errors: ['Bot detected'] };
    }
    
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
  } catch (error) {
    return { success: false, errors: ['Validation failed'] };
  }
};

// Export type definitions
export type LeadFormData = z.infer<typeof leadSchema>;
export type QuizAnswerData = z.infer<typeof quizAnswerSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type FunnelEventData = z.infer<typeof funnelEventSchema>;