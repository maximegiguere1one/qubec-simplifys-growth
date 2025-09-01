-- Add missing quiz_view event type to enum
ALTER TYPE funnel_event_type ADD VALUE IF NOT EXISTS 'quiz_view';