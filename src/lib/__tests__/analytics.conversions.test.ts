import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackEvent, sendToConversionsAPI, trackMetaPixelEvent } from '../analytics';

// Mock Supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}));

// Mock analytics queue
vi.mock('../analyticsQueue', () => ({
  analyticsQueue: {
    add: vi.fn(),
  },
}));

describe('Conversions API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock Facebook Pixel
    global.window.fbq = vi.fn();
    
    // Set up localStorage with Facebook attribution data
    localStorage.setItem('_fbc', 'fb.1.1640995200000.AbCdEfGhIjKlMnOpQrStUvWxYz');
    localStorage.setItem('_fbp', 'fb.1.1640995200000.123456789');
  });

  describe('sendToConversionsAPI', () => {
    it('should send lead data to Facebook Conversions API', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      
      const leadData = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
      };
      
      await sendToConversionsAPI('Lead', leadData);
      
      expect(mockInvoke).toHaveBeenCalledWith('facebook-conversions-api', {
        body: expect.objectContaining({
          eventName: 'Lead',
          eventData: expect.objectContaining(leadData),
          fbc: 'fb.1.1640995200000.AbCdEfGhIjKlMnOpQrStUvWxYz',
          fbp: 'fb.1.1640995200000.123456789',
        }),
      });
    });

    it('should include user agent and IP in conversion data', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      
      const leadData = { email: 'test@example.com' };
      
      await sendToConversionsAPI('CompleteRegistration', leadData);
      
      const callData = mockInvoke.mock.calls[0][1].body;
      expect(callData).toHaveProperty('userAgent');
      expect(callData.userAgent).toBe(navigator.userAgent);
    });

    it('should handle Facebook API errors gracefully', async () => {
      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid access token' } 
      });
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await sendToConversionsAPI('Lead', { email: 'test@example.com' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Facebook Conversions API warning:',
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await sendToConversionsAPI('Lead', { email: 'test@example.com' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Facebook Conversions API warning:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('trackMetaPixelEvent', () => {
    it('should track standard Meta Pixel events with deduplication', () => {
      const eventData = { value: 100, currency: 'USD' };
      
      trackMetaPixelEvent('Purchase', eventData);
      
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'Purchase',
        expect.objectContaining({
          ...eventData,
          eventID: expect.any(String),
        })
      );
    });

    it('should track custom Meta Pixel events', () => {
      const eventData = { custom_parameter: 'test_value' };
      
      trackMetaPixelEvent('CustomEvent', eventData);
      
      expect(window.fbq).toHaveBeenCalledWith(
        'trackCustom',
        'CustomEvent',
        expect.objectContaining({
          ...eventData,
          eventID: expect.any(String),
        })
      );
    });

    it('should handle missing Facebook Pixel gracefully', () => {
      delete (global.window as any).fbq;
      
      expect(() => {
        trackMetaPixelEvent('Lead', { email: 'test@example.com' });
      }).not.toThrow();
    });
  });

  describe('Event Deduplication', () => {
    it('should use consistent event IDs for deduplication', async () => {
      const leadData = { email: 'test@example.com' };
      
      // Track same event twice
      trackEvent('Lead', leadData);
      trackEvent('Lead', leadData);
      
      // Should use different event IDs
      const fbqCalls = (window.fbq as any).mock.calls;
      const eventId1 = fbqCalls[0][2].eventID;
      const eventId2 = fbqCalls[1][2].eventID;
      
      expect(eventId1).not.toBe(eventId2);
    });

    it('should pass same event ID to both Pixel and Conversions API', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      
      trackEvent('CompleteRegistration', { email: 'test@example.com' });
      
      // Get event ID from Pixel call
      const pixelEventId = (window.fbq as any).mock.calls[0][2].eventID;
      
      // Check Conversions API call has same event ID
      const conversionCall = mockInvoke.mock.calls[0][1].body;
      expect(conversionCall.eventId).toBe(pixelEventId);
    });
  });

  describe('High-Intent Event Mapping', () => {
    it('should map quiz_complete to CompleteRegistration', () => {
      trackEvent('quiz_complete', { score: 85 });
      
      expect(mockInvoke).toHaveBeenCalledWith('facebook-conversions-api', 
        expect.objectContaining({
          body: expect.objectContaining({
            eventName: 'CompleteRegistration',
          }),
        })
      );
    });

    it('should map bookcall_submit to Schedule', () => {
      trackEvent('bookcall_submit', { 
        date: '2024-01-15',
        time: '14:00' 
      });
      
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'Schedule',
        expect.any(Object)
      );
    });

    it('should map vsl_cta_click to InitiateCheckout for high-intent CTAs', () => {
      trackEvent('vsl_cta_click', {
        cta_text: 'Book Consultation',
        video_completion: 95,
      });
      
      expect(window.fbq).toHaveBeenCalledWith(
        'track',
        'InitiateCheckout',
        expect.any(Object)
      );
    });
  });

  describe('Data Validation', () => {
    it('should sanitize email addresses', async () => {
      const leadData = { 
        email: '  TEST@EXAMPLE.COM  ',
        name: 'Test User' 
      };
      
      await sendToConversionsAPI('Lead', leadData);
      
      const callData = mockInvoke.mock.calls[0][1].body;
      expect(callData.eventData.email).toBe('test@example.com');
    });

    it('should validate phone numbers', async () => {
      const leadData = { 
        email: 'test@example.com',
        phone: '(123) 456-7890' 
      };
      
      await sendToConversionsAPI('Lead', leadData);
      
      const callData = mockInvoke.mock.calls[0][1].body;
      expect(callData.eventData.phone).toMatch(/^\+?[0-9\s-()]+$/);
    });

    it('should handle missing Facebook attribution gracefully', async () => {
      localStorage.clear();
      
      await sendToConversionsAPI('Lead', { email: 'test@example.com' });
      
      const callData = mockInvoke.mock.calls[0][1].body;
      expect(callData.fbc).toBe('');
      expect(callData.fbp).toBe('');
    });
  });
});