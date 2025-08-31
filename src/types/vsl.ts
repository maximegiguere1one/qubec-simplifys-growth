// Type definitions for VSL page components and data structures

export interface QuizResults {
  totalScore: number;
  mainPriority?: string;
  answers?: Record<string, any>;
  timeSpent?: number;
}

export interface PersonalizedMessage {
  title: string;
  description: string;
  benefits: string[];
  urgency: string;
}

export interface VSLSectionProps {
  className?: string;
  onCTAClick?: () => void;
}

export interface TestimonialData {
  name: string;
  company: string;
  text: string;
  result: string;
  rating?: number;
}

export interface BenefitItem {
  icon: any; // LucideIcon type
  title: string;
  description: string;
}