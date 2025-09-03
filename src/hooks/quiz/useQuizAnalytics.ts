import { useEffect, useRef, useCallback } from 'react';
import { QuizService } from '@/services/quiz/quizService';
import { usePageTracking } from '@/hooks/usePageTracking';

interface UseQuizAnalyticsProps {
  currentStep: number;
  currentQuestion: number;
  quizSessionStarted: boolean;
  quizStartTime: number;
  exitIntentShown: boolean;
  onSessionStart: () => void;
  onExitIntentShown: () => void;
}

export const useQuizAnalytics = ({
  currentStep,
  currentQuestion,
  quizSessionStarted,
  quizStartTime,
  exitIntentShown,
  onSessionStart,
  onExitIntentShown
}: UseQuizAnalyticsProps) => {
  
  // Track page view
  usePageTracking();

  // Start quiz session when user begins
  useEffect(() => {
    if (currentStep >= 1 && !quizSessionStarted) {
      QuizService.startSession();
      onSessionStart();
    }
  }, [currentStep, quizSessionStarted, onSessionStart]);

  // Track question views
  useEffect(() => {
    if (currentStep >= 1) {
      QuizService.trackQuestionView(currentQuestion);
      
      // Add performance mark for question view
      if ('performance' in window) {
        performance.mark(`quiz_question_${currentQuestion}_viewed`);
      }
    }
  }, [currentStep, currentQuestion]);

  // Track quiz abandonment
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentStep > 0 && currentStep < 4 && !exitIntentShown) { // Assuming 4 total questions
        QuizService.trackAbandonment(currentStep, quizStartTime);
        onExitIntentShown();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, quizStartTime, exitIntentShown, onExitIntentShown]);

  // Track answer selection
  const trackAnswer = useCallback(async (
    questionIndex: number, 
    value: string, 
    timeSpent: number
  ) => {
    // Add performance marks
    if ('performance' in window) {
      performance.mark('quiz_step_start');
      performance.mark('quiz_step_complete');
    }
    
    await QuizService.trackAnswer(questionIndex, value, timeSpent);
  }, []);

  return {
    trackAnswer,
  };
};