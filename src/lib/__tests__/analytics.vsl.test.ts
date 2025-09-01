import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackVSLEvent, trackEvent, getSessionId, generateEventId } from '../analytics';
import { analyticsQueue } from '../analyticsQueue';

// Mock dependencies
vi.mock('../analyticsQueue', () => ({
  analyticsQueue: {
    add: vi.fn(),
  },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('VSL Analytics Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock window.fbq for Facebook Pixel
    global.window.fbq = vi.fn();
    
    // Mock window.location for UTM params
    delete (window as any).location;
    window.location = { search: '' } as any;
  });

  describe('trackVSLEvent', () => {
    it('should track vsl_play event with duration', () => {
      const eventData = { duration: 30, percentage: 25 };
      
      trackVSLEvent('play', eventData);
      
      expect(analyticsQueue.add).toHaveBeenCalledWith(
        'vsl_play',
        expect.objectContaining({
          duration: 30,
          percentage: 25,
          timestamp: expect.any(Number),
        }),
        null
      );
    });

    it('should track vsl_complete event', () => {
      trackVSLEvent('complete', { duration: 120 });
      
      expect(analyticsQueue.add).toHaveBeenCalledWith(
        'vsl_complete',
        expect.objectContaining({
          duration: 120,
          timestamp: expect.any(Number),
        }),
        null
      );
    });

    it('should track vsl_cta_click event with CTA data', () => {
      const ctaData = { 
        cta_text: 'Book Now', 
        cta_position: 'overlay',
        video_duration: 90 
      };
      
      trackVSLEvent('cta_click', ctaData);
      
      expect(analyticsQueue.add).toHaveBeenCalledWith(
        'vsl_cta_click',
        expect.objectContaining({
          cta_text: 'Book Now',
          cta_position: 'overlay',
          video_duration: 90,
          timestamp: expect.any(Number),
        }),
        null
      );
    });
  });

  describe('Session Management', () => {
    it('should generate consistent session ID', () => {
      const sessionId1 = getSessionId();
      const sessionId2 = getSessionId();
      
      expect(sessionId1).toBe(sessionId2);
      expect(sessionId1).toMatch(/^sess_\d+_[a-zA-Z0-9]{9}$/);
    });

    it('should generate unique event IDs', () => {
      const eventId1 = generateEventId();
      const eventId2 = generateEventId();
      
      expect(eventId1).not.toBe(eventId2);
      expect(eventId1).toMatch(/^[a-zA-Z0-9_-]+$/);
    });
  });

  describe('Event Validation', () => {
    it('should handle missing event data gracefully', () => {
      expect(() => {
        trackVSLEvent('play');
      }).not.toThrow();
      
      expect(analyticsQueue.add).toHaveBeenCalledWith(
        'vsl_play',
        expect.objectContaining({
          timestamp: expect.any(Number),
        }),
        null
      );
    });

    it('should sanitize event data', () => {
      const maliciousData = {
        duration: 30,
        '<script>': 'alert(1)',
        'normal_field': 'safe_value'
      };
      
      trackVSLEvent('play', maliciousData);
      
      const [, eventData] = (analyticsQueue.add as any).mock.calls[0];
      expect(eventData).not.toHaveProperty('<script>');
      expect(eventData.normal_field).toBe('safe_value');
    });
  });

  describe('Error Handling', () => {
    it('should handle analytics queue errors', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (analyticsQueue.add as any).mockImplementationOnce(() => {
        throw new Error('Queue full');
      });
      
      expect(() => {
        trackVSLEvent('play', { duration: 30 });
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle Facebook Pixel errors gracefully', () => {
      window.fbq = vi.fn().mockImplementationOnce(() => {
        throw new Error('FB not loaded');
      });
      
      expect(() => {
        trackEvent('vsl_complete', { duration: 120 });
      }).not.toThrow();
    });
  });
});