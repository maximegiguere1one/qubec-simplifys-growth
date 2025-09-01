import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VALID_TIMEZONES } from '@/lib/validation';

interface TimezoneHandlerProps {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
}

const TIMEZONE_LABELS = {
  'America/Toronto': 'Heure de l\'Est (Toronto)',
  'America/Montreal': 'Heure de l\'Est (Montréal)',
  'America/Vancouver': 'Heure du Pacifique (Vancouver)',
  'America/Edmonton': 'Heure des Rocheuses (Edmonton)'
} as const;

export function TimezoneHandler({ value, onChange, className }: TimezoneHandlerProps) {
  // Detect user's timezone and suggest the closest Canadian timezone
  const detectUserTimezone = (): string => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Map common US/International timezones to Canadian equivalents
      const timezoneMap: Record<string, string> = {
        'America/New_York': 'America/Toronto',
        'America/Detroit': 'America/Toronto',
        'America/Chicago': 'America/Toronto', // Default to Toronto for Central
        'America/Denver': 'America/Edmonton',
        'America/Phoenix': 'America/Edmonton',
        'America/Los_Angeles': 'America/Vancouver',
        'America/Seattle': 'America/Vancouver',
      };
      
      if (VALID_TIMEZONES.includes(userTimezone as any)) {
        return userTimezone;
      }
      
      return timezoneMap[userTimezone] || 'America/Toronto';
    } catch {
      return 'America/Toronto'; // Default fallback
    }
  };

  // Format time display for different timezones
  const formatCurrentTime = (timezone: string): string => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('fr-CA', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return `(${timeString} actuellement)`;
    } catch {
      return '';
    }
  };

  React.useEffect(() => {
    if (!value) {
      const detectedTimezone = detectUserTimezone();
      onChange(detectedTimezone);
    }
  }, [value, onChange]);

  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez votre fuseau horaire" />
        </SelectTrigger>
        <SelectContent>
          {VALID_TIMEZONES.map((timezone) => (
            <SelectItem key={timezone} value={timezone}>
              <div className="flex flex-col">
                <span>{TIMEZONE_LABELS[timezone]}</span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrentTime(timezone)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}