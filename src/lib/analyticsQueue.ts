import { supabase } from "@/integrations/supabase/client";
import { PERFORMANCE_CONFIG } from "@/lib/constants/performance";

interface QueuedEvent {
  eventType: string;
  eventData: Record<string, any>;
  leadId?: string | null;
  timestamp: number;
}

class AnalyticsQueue {
  private queue: QueuedEvent[] = [];
  private flushInterval: number | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.setupEventListeners();
    this.startFlushInterval();
  }

  private setupEventListeners() {
    // Handle network status changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flush();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Use sendBeacon on page unload to prevent data loss
    window.addEventListener('beforeunload', () => {
      this.flushWithBeacon();
    });

    // Also handle visibility change for better mobile support
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushWithBeacon();
      }
    });
  }

  private startFlushInterval() {
    this.flushInterval = window.setInterval(() => {
      if (this.queue.length > 0 && this.isOnline) {
        this.flush();
      }
    }, 5000); // 5 seconds interval
  }

  public add(eventType: string, eventData: Record<string, any> = {}, leadId?: string | null) {
    this.queue.push({
      eventType,
      eventData,
      leadId,
      timestamp: Date.now(),
    });

    // Flush immediately if queue is full
    if (this.queue.length >= PERFORMANCE_CONFIG.ANALYTICS_BATCH_SIZE) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0 || !this.isOnline) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      // Use analytics-batch Edge Function for reliable persistence
      const { data, error } = await supabase.functions.invoke('analytics-batch', {
        body: {
          events: eventsToSend.map(event => ({
            event_type: event.eventType,
            event_data: {
              ...event.eventData,
              referrer: document.referrer,
              page_url: window.location.href
            },
            lead_id: event.leadId,
            session_id: event.eventData.session_id || '',
            created_at: new Date(event.timestamp).toISOString(),
          }))
        }
      });

      if (error) {
        console.error('Failed to flush analytics events:', error);
        // Re-add failed events to queue for retry
        this.queue.unshift(...eventsToSend);
      } else {
        console.log(`Successfully flushed ${eventsToSend.length} events`);
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      // Re-add failed events to queue for retry
      this.queue.unshift(...eventsToSend);
    }
  }

  private flushWithBeacon() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    // Use sendBeacon for reliable delivery on page unload
    if ('sendBeacon' in navigator) {
      const payload = JSON.stringify({
        events: eventsToSend.map(event => ({
          event_type: event.eventType,
          event_data: {
            ...event.eventData,
            referrer: document.referrer,
            page_url: window.location.href
          },
          lead_id: event.leadId,
          session_id: event.eventData.session_id || '',
          created_at: new Date(event.timestamp).toISOString(),
        }))
      });

      try {
        const url = `https://lbwjesrgernvjiorktia.supabase.co/functions/v1/analytics-batch`;
        navigator.sendBeacon(url, payload);
      } catch (error) {
        console.error('sendBeacon failed:', error);
      }
    }
  }

  public destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush(); // Final flush
  }
}

// Singleton instance
export const analyticsQueue = new AnalyticsQueue();