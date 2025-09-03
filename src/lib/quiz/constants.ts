export const QUIZ_CONFIG = {
  EMAIL_GATE_STEP: 3,
  AUTO_ADVANCE_DELAY: 600,
  SUCCESS_BANNER_DURATION: 4000,
  REDIRECT_DELAY: 2000,
  PREFETCH_DELAY: 5000,
} as const;

export const QUIZ_ANALYTICS_EVENTS = {
  QUIZ_ABANDONED: 'quiz_abandoned',
  QUIZ_QUESTION_ANSWER: 'quiz_question_answer',
  QUIZ_COMPLETE: 'quiz_complete',
  EMAIL_GATE_SUBMIT: 'lp_submit_optin',
} as const;

export const QUIZ_STORAGE_KEYS = {
  QUIZ_RESULTS: 'quizResults',
  SESSION_ID: 'session_id',
} as const;

export const PHONE_REGEX = /^(\d{3})(\d{3})(\d{4})$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;