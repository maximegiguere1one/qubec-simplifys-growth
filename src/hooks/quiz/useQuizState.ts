import { useState, useCallback, useMemo } from 'react';
import { QuizState, QuizAnswers, ContactInfo } from '@/types/quiz';
import { QUIZ_QUESTIONS } from '@/components/optimized/QuizQuestions';
import { QUIZ_CONFIG } from '@/lib/quiz/constants';

const initialContactInfo: ContactInfo = { name: "", email: "", phone: "" };

const initialState: QuizState = {
  currentStep: 0,
  answers: {},
  contactInfo: initialContactInfo,
  isSubmittingContact: false,
  exitIntentShown: false,
  selectedAnswer: "",
  showFeedback: false,
  quizSessionStarted: false,
  currentDiagnostic: "",
  showEmailGate: false,
  hasPassedGate: false,
  showSuccessBanner: false,
};

export const useQuizState = () => {
  const [state, setState] = useState<QuizState>(initialState);

  // Memoized values
  const totalSteps = useMemo(() => QUIZ_QUESTIONS.length, []);
  const currentQuestion = useMemo(() => state.currentStep - 1, [state.currentStep]);
  const progress = useMemo(() => (state.currentStep / totalSteps) * 100, [state.currentStep, totalSteps]);
  
  const shouldShowEmailGate = useMemo(() => 
    state.currentStep === QUIZ_CONFIG.EMAIL_GATE_STEP && 
    !state.hasPassedGate && 
    !state.contactInfo.email, 
    [state.currentStep, state.hasPassedGate, state.contactInfo.email]
  );

  // State update methods
  const updateState = useCallback((updates: Partial<QuizState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setAnswer = useCallback((questionIndex: number, value: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionIndex]: value },
      selectedAnswer: value,
      showFeedback: true,
    }));
  }, []);

  const setContactInfo = useCallback((contactInfo: ContactInfo) => {
    setState(prev => ({ ...prev, contactInfo }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      currentStep: prev.currentStep + 1,
      showFeedback: false,
      selectedAnswer: "",
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      currentStep: Math.max(1, prev.currentStep - 1) 
    }));
  }, []);

  const startQuiz = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: 1 }));
  }, []);

  const resetFeedback = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showFeedback: false, 
      selectedAnswer: "" 
    }));
  }, []);

  return {
    // State
    ...state,
    
    // Computed values
    totalSteps,
    currentQuestion,
    progress,
    shouldShowEmailGate,
    
    // Actions
    updateState,
    setAnswer,
    setContactInfo,
    nextStep,
    previousStep,
    startQuiz,
    resetFeedback,
  };
};