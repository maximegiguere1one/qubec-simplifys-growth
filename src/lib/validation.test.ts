import { describe, it, expect } from 'vitest';
import { 
  validateFormData,
  leadSchema,
  bookingSchema,
  quizAnswerSchema,
  detectHoneypot,
  validateTimezone,
  validateBookingDate,
  sanitizeUTMParams
} from './validation';

describe('Form Validation', () => {
  describe('leadSchema', () => {
    it('should validate correct lead data', () => {
      const validLead = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        source: 'landing_page' as const,
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test-campaign'
      };
      
      const result = validateFormData(leadSchema, validLead);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validLead);
    });

    it('should reject invalid email format', () => {
      const invalidLead = {
        name: 'John Doe',
        email: 'invalid-email',
        source: 'landing_page' as const
      };
      
      const result = validateFormData(leadSchema, invalidLead);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('email: Invalid email address');
    });

    it('should reject short names', () => {
      const invalidLead = {
        name: 'J',
        email: 'john@example.com',
        source: 'landing_page' as const
      };
      
      const result = validateFormData(leadSchema, invalidLead);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('name: Name must be at least 2 characters');
    });

    it('should validate UTM parameters', () => {
      const invalidLead = {
        name: 'John Doe',
        email: 'john@example.com',
        source: 'landing_page' as const,
        utm_source: 'invalid@source!' // Invalid characters
      };
      
      const result = validateFormData(leadSchema, invalidLead);
      
      expect(result.success).toBe(false);
      expect(result.errors?.some(err => err.includes('Invalid UTM source format'))).toBe(true);
    });
  });

  describe('bookingSchema', () => {
    it('should validate correct booking data', () => {
      const validBooking = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Test Corp',
        challenge: 'Need help with automation',
        selectedDate: '2024-12-01',
        selectedTime: '10:30',
        timezone: 'America/Toronto' as const,
        sessionId: 'sess_1234567890_abcdefghi'
      };
      
      const result = validateFormData(bookingSchema, validBooking);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validBooking);
    });

    it('should reject invalid timezone', () => {
      const invalidBooking = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        selectedDate: '2024-12-01',
        selectedTime: '10:30',
        timezone: 'Invalid/Timezone',
        sessionId: 'sess_1234567890_abcdefghi'
      };
      
      const result = validateFormData(bookingSchema, invalidBooking);
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid session ID', () => {
      const invalidBooking = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        selectedDate: '2024-12-01',
        selectedTime: '10:30',
        timezone: 'America/Toronto' as const,
        sessionId: 'invalid-session-id'
      };
      
      const result = validateFormData(bookingSchema, invalidBooking);
      
      expect(result.success).toBe(false);
      expect(result.errors?.some(err => err.includes('Invalid session ID'))).toBe(true);
    });
  });

  describe('quizAnswerSchema', () => {
    it('should validate correct quiz answer', () => {
      const validAnswer = {
        questionId: 5,
        answerValue: 'Option A',
        answerScore: 8,
        timeSpent: 45
      };
      
      const result = validateFormData(quizAnswerSchema, validAnswer);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validAnswer);
    });

    it('should reject out-of-range values', () => {
      const invalidAnswer = {
        questionId: 25, // Too high
        answerValue: 'Option A',
        answerScore: 15, // Too high
        timeSpent: 700 // Too long
      };
      
      const result = validateFormData(quizAnswerSchema, invalidAnswer);
      
      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });
});

describe('Utility Functions', () => {
  describe('detectHoneypot', () => {
    it('should detect honeypot fields', () => {
      const dataWithHoneypot = {
        name: 'John Doe',
        email: 'john@example.com',
        website: 'http://spam.com' // Honeypot field
      };
      
      expect(detectHoneypot(dataWithHoneypot)).toBe(true);
    });

    it('should not flag clean data', () => {
      const cleanData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890'
      };
      
      expect(detectHoneypot(cleanData)).toBe(false);
    });

    it('should detect multiple honeypot field types', () => {
      expect(detectHoneypot({ url: 'http://spam.com' })).toBe(true);
      expect(detectHoneypot({ honeypot: 'bot' })).toBe(true);
      expect(detectHoneypot({ bot_field: 'filled' })).toBe(true);
    });
  });

  describe('validateTimezone', () => {
    it('should validate correct timezones', () => {
      expect(validateTimezone('America/Toronto')).toBe(true);
      expect(validateTimezone('America/Montreal')).toBe(true);
      expect(validateTimezone('America/Vancouver')).toBe(true);
      expect(validateTimezone('America/Edmonton')).toBe(true);
    });

    it('should reject invalid timezones', () => {
      expect(validateTimezone('Invalid/Timezone')).toBe(false);
      expect(validateTimezone('America/NewYork')).toBe(false);
      expect(validateTimezone('')).toBe(false);
    });
  });

  describe('validateBookingDate', () => {
    it('should validate future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      expect(validateBookingDate(tomorrow.toISOString().split('T')[0])).toBe(true);
    });

    it('should reject past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(validateBookingDate(yesterday.toISOString().split('T')[0])).toBe(false);
    });

    it('should reject dates too far in the future', () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 100);
      
      expect(validateBookingDate(farFuture.toISOString().split('T')[0])).toBe(false);
    });
  });

  describe('sanitizeUTMParams', () => {
    it('should preserve valid UTM parameters', () => {
      const input = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test',
        other: 'ignored'
      };
      
      const result = sanitizeUTMParams(input);
      
      expect(result).toEqual({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test'
      });
    });

    it('should truncate oversized parameters', () => {
      const longString = 'a'.repeat(300);
      const input = {
        utm_source: longString,
        utm_medium: 'valid'
      };
      
      const result = sanitizeUTMParams(input);
      
      expect(result.utm_medium).toBe('valid');
      expect(result.utm_source).toBeUndefined();
    });
  });
});

describe('Form Validation with Honeypot', () => {
  it('should detect honeypot and reject form', () => {
    const dataWithHoneypot = {
      name: 'John Doe',
      email: 'john@example.com',
      source: 'landing_page' as const,
      honeypot: 'filled by bot'
    };
    
    const result = validateFormData(leadSchema, dataWithHoneypot, true);
    
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Bot detected');
  });

  it('should skip honeypot check when disabled', () => {
    const dataWithHoneypot = {
      name: 'John Doe',
      email: 'john@example.com',
      source: 'landing_page' as const,
      website: 'filled by bot' // This would normally trigger honeypot
    };
    
    const result = validateFormData(leadSchema, dataWithHoneypot, false);
    
    expect(result.success).toBe(true);
  });
});