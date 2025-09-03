export interface QuizQuestion {
  readonly id: number;
  readonly subtitle: string;
  readonly question: string;
  readonly emoji: string;
  readonly options: readonly QuestionOption[];
}

export interface QuestionOption {
  readonly value: string;
  readonly emoji: string;
  readonly label: string;
  readonly score: number;
  readonly priority?: string;
  readonly type?: string;
}

export interface QuizAnswers {
  [questionId: number]: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface QuizState {
  currentStep: number;
  answers: QuizAnswers;
  contactInfo: ContactInfo;
  isSubmittingContact: boolean;
  exitIntentShown: boolean;
  selectedAnswer: string;
  showFeedback: boolean;
  quizSessionStarted: boolean;
  currentDiagnostic: string;
  showEmailGate: boolean;
  hasPassedGate: boolean;
  showSuccessBanner: boolean;
}

export interface DiagnosticResult {
  message: string;
  score: number;
  category: 'high' | 'excellent' | 'good' | 'organized';
}

export interface QuizResults {
  answers: QuizAnswers;
  totalScore: number;
  diagnostic: string;
  contactInfo: ContactInfo;
  timeSpent: number;
}

export interface ABTestVariants {
  progressVariant: 'numeric' | 'visual_steps';
  personalizationVariant: 'standard' | 'dynamic';
}