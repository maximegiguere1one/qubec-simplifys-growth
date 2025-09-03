import { useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NavigationService } from "@/lib/navigation";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useOptimizedTimer } from "@/hooks/useOptimizedTimer";
import { QUIZ_QUESTIONS } from "@/components/optimized/QuizQuestions";
// Forcing module refresh - getCachedABVariant import
import { getABVariant } from "@/lib/analytics";
import { getCachedABVariant } from "@/lib/analytics/optimized";
import { OptimizedProgress } from "@/components/quiz/OptimizedProgress";
import { MidQuizEmailGate } from "@/components/quiz/MidQuizEmailGate";
import { StickyMobileCTA } from "@/components/quiz/StickyMobileCTA";
import { ToastAction } from "@/components/ui/toast";

// Refactored components
import { useQuizState } from "@/hooks/quiz/useQuizState";
import { useEmailGate } from "@/hooks/quiz/useEmailGate";
import { useQuizAnalytics } from "@/hooks/quiz/useQuizAnalytics";
import { QuizService } from "@/services/quiz/quizService";
import { QuizIntroSection } from "@/components/quiz/QuizIntroSection";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizNavigation } from "@/components/quiz/QuizNavigation";
import { SuccessBanner } from "@/components/quiz/SuccessBanner";
import { TrustIndicators } from "@/components/quiz/TrustIndicators";
import { validateQuizAnswer } from "@/lib/quiz/validation";
import { QUIZ_CONFIG } from "@/lib/quiz/constants";

const Quiz = () => {
  // State management
  const quizState = useQuizState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, mobileButtonClass, animationClass, touchTargetClass } = useMobileOptimized();
  
  // Timers and tracking
  const { timeSpent, reset: resetTimer } = useOptimizedTimer({ pauseOnHidden: true });
  const quizStartTime = useMemo(() => Date.now(), []);
  
  // Prefetching
  const { handleHover, prefetchRoute } = usePrefetch(['/vsl'], { 
    onIdle: true, 
    delay: QUIZ_CONFIG.PREFETCH_DELAY
  });
  
  // A/B test variants
  const progressVariant = useMemo(() => 
    getCachedABVariant("quiz_progress", ["numeric", "visual_steps"]) as "numeric" | "visual_steps", 
    []
  );
  
  const personalizationVariant = useMemo(() => 
    getABVariant("quiz_personalization", ["standard", "dynamic"]), 
    []
  );
  
  // Refs to prevent double-triggering
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAdvancingRef = useRef(false);
  const firstQuestionRef = useRef<HTMLDivElement>(null);

  // Analytics tracking
  const { trackAnswer } = useQuizAnalytics({
    currentStep: quizState.currentStep,
    currentQuestion: quizState.currentQuestion,
    quizSessionStarted: quizState.quizSessionStarted,
    quizStartTime,
    exitIntentShown: quizState.exitIntentShown,
    onSessionStart: () => {
      quizState.updateState({ quizSessionStarted: true });
      resetTimer();
    },
    onExitIntentShown: () => quizState.updateState({ exitIntentShown: true })
  });

  // Email gate handling
  const { isSubmitting: isSubmittingEmailGate, showSuccessBanner, handleSubmit: handleEmailGateSubmit } = useEmailGate({
    currentStep: quizState.currentStep,
    onSuccess: (email, name) => {
      quizState.setContactInfo({ name, email, phone: "" });
      quizState.updateState({ 
        hasPassedGate: true, 
        showEmailGate: false 
      });
    },
    onAdvance: () => {
      quizState.nextStep();
    },
    resetTimer
  });

  // Answer handling
  const handleAnswerChange = useCallback(async (value: string) => {
    // Prevent double-triggering
    if (isAdvancingRef.current) return;
    
    quizState.setAnswer(quizState.currentQuestion, value);
    
    // Track the answer
    await trackAnswer(quizState.currentQuestion, value, timeSpent);
    
    // Clear any existing timeout
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
    }

    // Auto-advance to next question after short delay for visual feedback
    advanceTimeoutRef.current = setTimeout(() => {
      quizState.resetFeedback();
      isAdvancingRef.current = true;
      handleNext();
      isAdvancingRef.current = false;
    }, QUIZ_CONFIG.AUTO_ADVANCE_DELAY);
  }, [quizState, timeSpent, trackAnswer]);

  // Navigation handlers
  const handleNext = async () => {
    // Check if we need to show email gate
    if (quizState.shouldShowEmailGate) {
      quizState.updateState({ showEmailGate: true });
      return;
    }

    // Only validate if this is a manual click (not auto-advance)
    if (!isAdvancingRef.current && !validateQuizAnswer(quizState.answers[quizState.currentQuestion])) {
      toast({
        title: "Réponse requise",
        description: "Veuillez sélectionner une réponse avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    // Clear any existing timeout
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    if (quizState.currentStep < quizState.totalSteps) {
      quizState.nextStep();
      resetTimer();
    } else {
      // Complete quiz
      await handleQuizCompletion();
    }
  };

  const handlePrevious = () => {
    if (quizState.currentStep > 1) {
      quizState.previousStep();
    }
  };

  const handleStartQuiz = () => {
    quizState.startQuiz();
    
    // Scroll to first question after state update
    setTimeout(() => {
      firstQuestionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Focus first answer option for accessibility
      setTimeout(() => {
        const firstOption = document.querySelector('[data-question-option="0"]') as HTMLElement;
        firstOption?.focus();
      }, 300);
    }, 100);
  };

  // Quiz completion
  const handleQuizCompletion = async () => {
    // Complete the quiz and get results
    const results = QuizService.completeSession(
      quizState.answers, 
      quizState.contactInfo, 
      quizStartTime
    );
    
    // Update state with diagnostic
    quizState.updateState({ currentDiagnostic: results.diagnostic });
    
    // Prefetch VSL page since user will likely go there next
    prefetchRoute('/vsl');

    // Send confirmation email in background
    const emailSent = await QuizService.sendConfirmationEmail(results);
    
    // Show appropriate toast
    if (emailSent) {
      toast({
        title: "Email de confirmation envoyé !",
        description: "Vérifiez votre boîte de réception pour votre diagnostic personnalisé.",
        action: <ToastAction altText="OK">OK</ToastAction>,
      });
    } else {
      toast({
        title: "Email non envoyé",
        description: "Votre diagnostic est quand même prêt dans la vidéo suivante !",
        variant: "destructive",
      });
    }
    
    // Auto-redirect to VSL
    setTimeout(() => {
      navigate("/vsl", { 
        state: { 
          fromQuiz: true, 
          emailSent, 
          userEmail: quizState.contactInfo.email,
          diagnostic: results.diagnostic 
        } 
      });
    }, QUIZ_CONFIG.REDIRECT_DELAY);
  };

  // Show email gate if needed
  if (quizState.showEmailGate) {
    return (
      <div className="min-h-[100dvh] bg-gradient-background py-6 sm:py-8 md:py-12">
        <div className="container mx-auto container-mobile max-w-4xl">
          <OptimizedProgress 
            currentStep={quizState.currentStep}
            totalSteps={quizState.totalSteps}
            timeSpent={timeSpent}
          />
          <MidQuizEmailGate 
            onSubmit={handleEmailGateSubmit}
            isSubmitting={isSubmittingEmailGate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-background py-6 sm:py-8 md:py-12 pb-20 md:pb-12">
      <div className="container mx-auto container-mobile max-w-4xl">
        {/* Quiz Introduction */}
        {quizState.currentStep === 0 && (
          <QuizIntroSection onStartQuiz={handleStartQuiz} />
        )}
        
        {/* Progress Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          {quizState.currentStep >= 1 && (
            <OptimizedProgress 
              currentStep={quizState.currentStep}
              totalSteps={quizState.totalSteps}
              timeSpent={timeSpent}
            />
          )}
        </div>

        {/* Success Banner */}
        <SuccessBanner isVisible={showSuccessBanner} />

        {/* Question Card */}
        {quizState.currentStep >= 1 && quizState.currentStep <= quizState.totalSteps && (
          <>
            <QuestionCard
              ref={firstQuestionRef}
              question={QUIZ_QUESTIONS[quizState.currentQuestion]}
              currentQuestion={quizState.currentQuestion}
              answers={quizState.answers}
              selectedAnswer={quizState.selectedAnswer}
              showFeedback={quizState.showFeedback}
              touchTargetClass={touchTargetClass}
              animationClass={animationClass}
              onAnswerSelect={handleAnswerChange}
            />

            {/* Navigation */}
            <div className="mt-8">
              <QuizNavigation
                currentStep={quizState.currentStep}
                totalSteps={quizState.totalSteps}
                canGoNext={!!quizState.answers[quizState.currentQuestion]}
                isAdvancing={isAdvancingRef.current}
                showFeedback={quizState.showFeedback}
                animationClass={animationClass}
                mobileButtonClass={mobileButtonClass}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </div>
          </>
        )}

        {/* Trust Indicators */}
        <TrustIndicators />

        {/* Sticky Mobile CTA */}
        <StickyMobileCTA 
          onAction={handleNext}
          isVisible={quizState.currentStep >= 1 && quizState.currentStep <= quizState.totalSteps}
          text={quizState.currentStep === quizState.totalSteps ? "Voir mes résultats" : "Question suivante"}
          isDisabled={!quizState.answers[quizState.currentQuestion] && !isAdvancingRef.current}
        />
      </div>
    </div>
  );
};

export default Quiz;