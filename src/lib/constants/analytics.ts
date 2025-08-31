export const ANALYTICS_EVENTS = {
  VSL: {
    CTA_CLICK: 'vsl_cta_click',
    PLAY: 'vsl_play',
    VIEW: 'vsl_view',
  },
  BOOKING: {
    CALENDAR_CLICK: 'vsl_cta_click',
    SUBMIT: 'bookcall_submit',
    CONFIRM: 'bookcall_confirm',
  },
} as const;

export const CTA_LOCATIONS = {
  PRIMARY: 'primary',
  CALENDAR: 'calendar',
  OVERLAY: 'overlay',
  VIDEO: 'video',
} as const;