import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { QuizService } from '@/services/quiz/quizService';
import { validateEmail, validateName } from '@/lib/quiz/validation';
import { QUIZ_CONFIG } from '@/lib/quiz/constants';

interface UseEmailGateProps {
  currentStep: number;
  onSuccess: (email: string, name: string) => void;
  onAdvance: () => void;
  resetTimer: () => void;
}

export const useEmailGate = ({
  currentStep,
  onSuccess,
  onAdvance,
  resetTimer
}: UseEmailGateProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const { toast } = useToast();

  const handleSubmit = useCallback(async (email: string, name: string) => {
    // Validation
    if (!validateEmail(email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      return;
    }

    if (!validateName(name)) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer votre nom.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create lead using service
      const lead = await QuizService.createLeadFromEmailGate(email, name);
      
      if (!lead) {
        throw new Error('Failed to create lead');
      }
      
      // Track the submission
      await QuizService.trackEmailGateSubmission(name, email, currentStep);
      
      // Call success callback
      onSuccess(email, name);
      
      // Show success banner and auto-advance
      setShowSuccessBanner(true);
      setTimeout(() => {
        setShowSuccessBanner(false);
        onAdvance();
        resetTimer();
        
        // Smooth scroll and focus management
        setTimeout(() => {
          const firstQuestionRef = document.querySelector('[data-question-ref]');
          firstQuestionRef?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          
          setTimeout(() => {
            const firstOption = document.querySelector('[data-question-option="0"]') as HTMLElement;
            firstOption?.focus();
          }, 300);
        }, 100);
      }, QUIZ_CONFIG.SUCCESS_BANNER_DURATION);

    } catch (error) {
      console.error('Email gate submission error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, onSuccess, onAdvance, resetTimer, toast]);

  return {
    isSubmitting,
    showSuccessBanner,
    handleSubmit,
  };
};