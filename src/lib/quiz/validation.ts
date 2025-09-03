import { EMAIL_REGEX, PHONE_REGEX } from './constants';

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(PHONE_REGEX);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return value;
};

export const validateQuizAnswer = (answer: string | undefined): boolean => {
  return !!answer && answer.trim().length > 0;
};