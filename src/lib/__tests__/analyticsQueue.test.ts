import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnalyticsQueue } from '../analyticsQueue';

// Mock fetch for analytics batch endpoint
global.fetch = vi.fn();

// Mock navigator.sendBeacon
Object.defineProperty(navigator, 'sendBeacon', {
  writable: true,
  value: vi.fn(),
});

describe('AnalyticsQueue', () => {
  let queue: AnalyticsQueue;
  
  beforeEach(() => {
    vi.clearAllMocks();
    queue = new AnalyticsQueue();
    
    // Mock supabase client
    vi.doMock('@/integrations/supabase/client', () => ({
      supabase: {
        functions: {
          invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
        },
      },
    }));
  });

  afterEach(() => {
    queue.destroy();
  });

  describe('Event Queuing', () => {
    it('should add events to queue', () => {
      queue.add('test_event', { value: 123 });
      
      expect(queue['queue']).toHaveLength(1);
      expect(queue['queue'][0]).toMatchObject({
        eventType: 'test_event',
        eventData: { value: 123 },
        timestamp: expect.any(Number),
      });
    });

    it('should include leadId when provided', () => {
      queue.add('test_event', { value: 123 }, 'lead-123');
      
      expect(queue['queue'][0]).toMatchObject({
        eventType: 'test_event',
        eventData: { value: 123 },
        leadId: 'lead-123',
        timestamp: expect.any(Number),
      });
    });

    it('should auto-flush when queue reaches batch size', async () => {
      const flushSpy = vi.spyOn(queue, 'flush');
      
      // Add events up to batch size (assume 10)
      for (let i = 0; i < 10; i++) {
        queue.add(`event_${i}`, { index: i });
      }
      
      expect(flushSpy).toHaveBeenCalled();
    });
  });

  describe('Batch Flushing', () => {
    it('should send batched events to analytics endpoint', async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: {
            invoke: mockInvoke,
          },
        },
      }));

      queue.add('event1', { data: 1 });
      queue.add('event2', { data: 2 });
      
      await queue.flush();
      
      expect(mockInvoke).toHaveBeenCalledWith('analytics-batch', {
        body: expect.arrayContaining([
          expect.objectContaining({ eventType: 'event1' }),
          expect.objectContaining({ eventType: 'event2' }),
        ]),
      });
      
      expect(queue['queue']).toHaveLength(0);
    });

    it('should handle network errors gracefully', async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: {
            invoke: mockInvoke,
          },
        },
      }));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      queue.add('event1', { data: 1 });
      await queue.flush();
      
      // Events should remain in queue for retry
      expect(queue['queue']).toHaveLength(1);
      
      consoleSpy.mockRestore();
    });

    it('should retry failed flushes with exponential backoff', async () => {
      vi.useFakeTimers();
      
      const mockInvoke = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: null, error: null });
        
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: {
            invoke: mockInvoke,
          },
        },
      }));

      queue.add('event1', { data: 1 });
      
      // First flush fails
      await queue.flush();
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(queue['queue']).toHaveLength(1);
      
      // Advance time to trigger retry
      vi.advanceTimersByTime(5000);
      
      // Second flush succeeds
      expect(mockInvoke).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });
  });

  describe('Page Unload Handling', () => {
    it('should use sendBeacon for page unload events', () => {
      const mockSendBeacon = vi.fn().mockReturnValue(true);
      navigator.sendBeacon = mockSendBeacon;
      
      queue.add('event1', { data: 1 });
      queue.flushWithBeacon();
      
      expect(mockSendBeacon).toHaveBeenCalledWith(
        expect.stringContaining('analytics-batch'),
        expect.any(String)
      );
      
      expect(queue['queue']).toHaveLength(0);
    });

    it('should fallback to regular flush if sendBeacon fails', async () => {
      const mockSendBeacon = vi.fn().mockReturnValue(false);
      navigator.sendBeacon = mockSendBeacon;
      
      const flushSpy = vi.spyOn(queue, 'flush');
      
      queue.add('event1', { data: 1 });
      queue.flushWithBeacon();
      
      expect(mockSendBeacon).toHaveBeenCalled();
      expect(flushSpy).toHaveBeenCalled();
    });
  });

  describe('Network Status Handling', () => {
    it('should pause flushing when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      queue.add('event1', { data: 1 });
      queue.flush();
      
      // Should not attempt to flush when offline
      expect(queue['queue']).toHaveLength(1);
      
      consoleSpy.mockRestore();
    });

    it('should resume flushing when back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      
      queue.add('event1', { data: 1 });
      
      // Come back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      
      // Trigger online event
      window.dispatchEvent(new Event('online'));
      
      // Should auto-flush queued events
      expect(queue['isFlushing']).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should limit queue size to prevent memory leaks', () => {
      // Add more events than max queue size
      for (let i = 0; i < 1000; i++) {
        queue.add(`event_${i}`, { index: i });
      }
      
      // Queue should not exceed reasonable limit
      expect(queue['queue'].length).toBeLessThan(500);
    });

    it('should clean up resources on destroy', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      queue.destroy();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(queue['queue']).toHaveLength(0);
    });
  });
});