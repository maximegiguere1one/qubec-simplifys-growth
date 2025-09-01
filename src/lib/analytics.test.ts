import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getSessionId, 
  generateEventId, 
  getFacebookParams, 
  getUTMParams,
  validateSessionId,
  sanitizeUTMParams
} from './analytics';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    search: '?utm_source=google&utm_medium=cpc&utm_campaign=test',
    href: 'https://test.com'
  }
});

// Mock document
Object.defineProperty(window, 'document', {
  value: {
    cookie: '_fbc=fb.1.1234567890.123; _fbp=fb.1.1234567890.456',
    referrer: 'https://google.com'
  }
});

describe('Analytics Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSessionId', () => {
    it('should return existing session ID from localStorage', () => {
      const existingSessionId = 'sess_1234567890_abcdefghi';
      localStorageMock.getItem.mockReturnValue(existingSessionId);
      
      const sessionId = getSessionId();
      
      expect(sessionId).toBe(existingSessionId);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('session_id');
    });

    it('should generate new session ID if none exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const sessionId = getSessionId();
      
      expect(sessionId).toMatch(/^sess_\d+_[a-zA-Z0-9]{9}$/);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('session_id', sessionId);
    });
  });

  describe('generateEventId', () => {
    it('should generate unique event ID with correct format', () => {
      const eventId = generateEventId();
      
      expect(eventId).toMatch(/^evt_\d+_[a-zA-Z0-9]{9}$/);
    });

    it('should generate different IDs on subsequent calls', () => {
      const eventId1 = generateEventId();
      const eventId2 = generateEventId();
      
      expect(eventId1).not.toBe(eventId2);
    });
  });

  describe('getFacebookParams', () => {
    it('should extract Facebook cookies from localStorage first', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('fb.1.1234567890.123')
        .mockReturnValueOnce('fb.1.1234567890.456');
      
      const params = getFacebookParams();
      
      expect(params.fbc).toBe('fb.1.1234567890.123');
      expect(params.fbp).toBe('fb.1.1234567890.456');
    });

    it('should fallback to document cookies if localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const params = getFacebookParams();
      
      expect(params.fbc).toBe('fb.1.1234567890.123');
      expect(params.fbp).toBe('fb.1.1234567890.456');
    });
  });

  describe('getUTMParams', () => {
    it('should extract UTM parameters from URL', () => {
      const params = getUTMParams();
      
      expect(params.utm_source).toBe('google');
      expect(params.utm_medium).toBe('cpc');
      expect(params.utm_campaign).toBe('test');
    });
  });
});

// Validation utilities tests
describe('Validation Utilities', () => {
  describe('validateSessionId', () => {
    it('should validate correct session ID format', () => {
      expect(validateSessionId('sess_1234567890_abcdefghi')).toBe(true);
      expect(validateSessionId('sess_9876543210_zyxwvutsr')).toBe(true);
    });

    it('should reject invalid session ID formats', () => {
      expect(validateSessionId('invalid_session')).toBe(false);
      expect(validateSessionId('sess_123_abc')).toBe(false);
      expect(validateSessionId('')).toBe(false);
      expect(validateSessionId('sess_1234567890_abcdefghijk')).toBe(false);
    });
  });

  describe('sanitizeUTMParams', () => {
    it('should sanitize valid UTM parameters', () => {
      const input = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test campaign',
        other_param: 'ignored'
      };
      
      const result = sanitizeUTMParams(input);
      
      expect(result).toEqual({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test campaign'
      });
    });

    it('should handle oversized UTM parameters', () => {
      const longString = 'a'.repeat(300);
      const input = {
        utm_source: longString,
        utm_medium: 'valid',
        utm_campaign: longString
      };
      
      const result = sanitizeUTMParams(input);
      
      expect(result).toEqual({
        utm_medium: 'valid'
      });
    });

    it('should handle missing parameters', () => {
      const input = {
        utm_source: 'google',
        other_param: 'ignored'
      };
      
      const result = sanitizeUTMParams(input);
      
      expect(result).toEqual({
        utm_source: 'google'
      });
    });
  });
});

// Integration tests
describe('Analytics Integration', () => {
  it('should track events with proper data structure', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    
    global.fetch = mockFetch;
    
    // Test would require importing trackEvent and mocking supabase
    // This is a placeholder for integration testing structure
  });
});