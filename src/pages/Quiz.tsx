import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startQuizSession, trackQuizAnswer, completeQuizSession, trackEvent, createLead, sendQuizConfirmationEmail, getLeadId, getABVariant } from "@/lib/analytics";
import { NavigationService } from "@/lib/navigation";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useOptimizedTimer } from "@/hooks/useOptimizedTimer";
import { QUIZ_QUESTIONS, QuestionOption } from "@/components/optimized/QuizQuestions";
import { getCachedABVariant, quizAnalytics } from "@/lib/analytics/optimized";
import { QuizHero } from "@/components/quiz/QuizHero";
import { QuizStoryOffer } from "@/components/quiz/QuizStoryOffer";
import { MobileStoryOffer } from "@/components/quiz/MobileStoryOffer";
import { QuizScarcityCounter } from "@/components/quiz/QuizScarcityCounter";
import { QuizPreFrame } from "@/components/quiz/QuizPreFrame";
import { OptimizedProgress } from "@/components/quiz/OptimizedProgress";
import { MidQuizEmailGate } from "@/components/quiz/MidQuizEmailGate";
import { StickyMobileCTA } from "@/components/quiz/StickyMobileCTA";

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(1); // Start directly at quiz, no initial contact capture
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizSessionStarted, setQuizSessionStarted] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [currentDiagnostic, setCurrentDiagnostic] = useState("");
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [hasPassedGate, setHasPassedGate] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, mobileButtonClass, animationClass, touchTargetClass } = useMobileOptimized();
  
  // Optimized timer for question tracking
  const { timeSpent, reset: resetTimer } = useOptimizedTimer({ pauseOnHidden: true });
  
  // Prefetch VSL page when user starts quiz or hovers CTA
  const { handleHover, prefetchRoute } = usePrefetch(['/vsl'], { 
    onIdle: true, 
    delay: 5000 // Wait 5s before prefetching in background
  });
  
  // Memoized constants to prevent recreations
  const questions = useMemo(() => QUIZ_QUESTIONS, []);
  const totalSteps = useMemo(() => questions.length, [questions.length]); // Remove +1 since no initial contact step
  const progress = useMemo(() => (currentStep / totalSteps) * 100, [currentStep, totalSteps]);
  const currentQuestion = useMemo(() => currentStep - 1, [currentStep]);
  
  // Email gate trigger (after question 2)
  const shouldShowEmailGate = useMemo(() => 
    currentStep === 3 && !hasPassedGate && !contactInfo.email, 
    [currentStep, hasPassedGate, contactInfo.email]
  );
  
  // Cached A/B test variant
  const progressVariant = useMemo(() => 
    getCachedABVariant("quiz_progress", ["numeric", "visual_steps"]) as "numeric" | "visual_steps", 
    []
  );
  
  // Refs to prevent double-triggering
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAdvancingRef = useRef(false);
  
  // A/B test for personalization
  const personalizationVariant = useMemo(() => 
    getABVariant("quiz_personalization", ["standard", "dynamic"]), 
    []
  );
  
  // Track start time for timing calculations
  const [quizStartTime] = useState(Date.now());
  
  // Track quiz abandonment (optimized)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentStep > 0 && currentStep < questions.length && !exitIntentShown) {
        quizAnalytics.flush();
        setExitIntentShown(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, questions.length, exitIntentShown]);

  // Auto-redirect to VSL after completion message
  useEffect(() => {
    if (showCompletionMessage) {
      const timer = setTimeout(() => {
        NavigationService.goToVSL();
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, [showCompletionMessage]);
  
  // Track page view and start quiz session
  usePageTracking();
  
  useEffect(() => {
    // Start quiz session immediately since we start with questions
    if (!quizSessionStarted) {
      startQuizSession();
      setQuizSessionStarted(true);
      resetTimer();
    }
  }, [quizSessionStarted, resetTimer]);
  
  // Track question views for analytics
  useEffect(() => {
    if (currentStep >= 1) {
      quizAnalytics.trackQuestionView(currentQuestion);
    }
  }, [currentStep, currentQuestion]);

  // Questions moved to separate file for better organization

  // Constants moved to memoized values above

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handleEmailGateSubmit = async (email: string, name: string) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingContact(true);
    try {
      // Create lead using reliable Edge Function
      const lead = await createLead(email, name, "", 'quiz_mid');
      
      if (!lead) {
        throw new Error('Failed to create lead');
      }
      
      // Update contact info and pass the gate
      setContactInfo({ name, email, phone: "" });
      setHasPassedGate(true);
      setShowEmailGate(false);
      
      // Track the mid-quiz opt-in event
      await trackEvent('lp_submit_optin', {
        name,
        email,
        source: 'quiz_mid',
        question_number: currentStep
      });

      toast({
        title: "Parfait !",
        description: "Continue le quiz pour découvrir tes résultats personnalisés.",
      });

    } catch (error) {
      console.error('Email gate submission error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleAnswerChange = useCallback((value: string) => {
    // Prevent double-triggering
    if (isAdvancingRef.current) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
    
    setSelectedAnswer(value);
    setShowFeedback(true);
    
    // Use optimized timer value and track with analytics manager
    const question = questions[currentQuestion];
    const option = question.options.find(opt => opt.value === value);
    
    if (option) {
      // Track with optimized analytics
      quizAnalytics.trackAnswer(currentQuestion, value, timeSpent);
      trackQuizAnswer(currentQuestion + 1, value, option.score, timeSpent);
    }

    // Clear any existing timeout
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
    }

    // Auto-advance to next question after short delay for visual feedback
    advanceTimeoutRef.current = setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer("");
      isAdvancingRef.current = true;
      handleNext();
      isAdvancingRef.current = false;
    }, 600);
  }, [currentQuestion, questions, timeSpent]);

  const handleNext = async () => {
    // Check if we need to show email gate
    if (shouldShowEmailGate) {
      setShowEmailGate(true);
      return;
    }

    // Only validate if this is a manual click (not auto-advance)
    if (!isAdvancingRef.current && !answers[currentQuestion]) {
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

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      resetTimer(); // Reset timer for next question
    } else {
      // Calculate total score and time
      const totalScore = Object.entries(answers).reduce((sum, [questionId, answerValue]) => {
        const question = questions[parseInt(questionId)];
        const option = question.options.find(opt => opt.value === answerValue);
        return sum + (option?.score || 0);
      }, 0);
      
      const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

      // Complete quiz session and prefetch VSL
      completeQuizSession(totalScore, totalTimeSpent);
      
      // Prefetch VSL page since user will likely go there next
      prefetchRoute('/vsl');

      // Generate personalized diagnostic message including name
      const diagnosticMessage = generateDiagnostic(totalScore, answers);
      setCurrentDiagnostic(diagnosticMessage);
      
      // Store quiz results with diagnostic and contact info
      localStorage.setItem("quizResults", JSON.stringify({ 
        answers, 
        totalScore, 
        diagnostic: diagnosticMessage,
        contactInfo 
      }));

      // Show completion message
      setShowCompletionMessage(true);

      // Send confirmation email asynchronously (keep analytics)
      const leadId = getLeadId();
      if (leadId) {
        try {
          await sendQuizConfirmationEmail(
            leadId,
            totalScore,
            totalTimeSpent,
            answers,
            diagnosticMessage,
            contactInfo
          );
          console.log("Quiz confirmation email sent successfully");
        } catch (error) {
          console.error("Failed to send confirmation email:", error);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateDiagnostic = (score: number, answers: Record<number, string>) => {
    // Get the main priority from first question (now question id 1)
    const firstAnswer = questions[0].options.find(opt => opt.value === answers[0]);
    const mainPriority = (firstAnswer as any)?.priority || "Système sur mesure adapté";
    const firstName = contactInfo.name.split(' ')[0];
    
    if (score >= 16) {
      return `🎯 PARFAIT ${firstName} ! Votre profil indique que vous avez besoin d'un système vraiment sur mesure. Nous pourrions créer pour vous : ${mainPriority}. Avec votre niveau de complexité actuel, un système personnalisé vous libérerait facilement 15-20 heures par semaine tout en éliminant ces frustrations quotidiennes !`;
    } else if (score >= 12) {
      return `✨ EXCELLENT ${firstName} ! Vous êtes un candidat idéal pour du développement sur mesure. Priorité détectée : ${mainPriority}. Un système conçu spécialement pour vos processus vous ferait gagner 10-15 heures par semaine et transformerait votre façon de travailler.`;
    } else if (score >= 8) {
      return `💡 INTÉRESSANT ${firstName} ! Vous pourriez grandement bénéficier d'un système personnalisé. Focus suggéré : ${mainPriority}. Même avec une bonne organisation actuelle, un outil créé exactement pour vos besoins vous donnerait 6-10 heures supplémentaires par semaine.`;
    } else {
      return `👌 Vous êtes bien organisé ${firstName} ! Mais imaginez un système conçu à 100% pour VOUS. Domaine ciblé : ${mainPriority}. Même les entreprises efficaces gagnent 3-5 heures par semaine avec du sur mesure - et surtout, zéro frustration avec des logiciels qui "ne font pas exactement ce qu'on veut".`;
    } 
  };

  const scrollToForm = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show email gate if needed
  if (showEmailGate) {
    return (
      <div className="min-h-[100dvh] bg-gradient-background py-6 sm:py-8 md:py-12">
        <div className="container mx-auto container-mobile max-w-4xl">
          <OptimizedProgress 
            currentStep={currentStep}
            totalSteps={totalSteps}
            timeSpent={timeSpent}
          />
          <MidQuizEmailGate 
            onSubmit={handleEmailGateSubmit}
            isSubmitting={isSubmittingContact}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-background py-6 sm:py-8 md:py-12 pb-20 md:pb-12">
      <div className="container mx-auto container-mobile max-w-4xl">
        {currentStep === 1 && (
          <>
            {/* Hero Section */}
            <QuizHero onStartQuiz={() => setCurrentStep(1)} />
            
            {/* Story-Offer Section - Desktop vs Mobile */}
            <div className="hidden md:block">
              <QuizStoryOffer />
            </div>
            <div className="md:hidden">
              <MobileStoryOffer />
            </div>
            
            {/* Scarcity Counter */}
            <QuizScarcityCounter />
            
            {/* Pre-frame */}
            <QuizPreFrame />
          </>
        )}
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          {currentStep >= 1 && (
            /* Optimized Progress Bar */
            <OptimizedProgress 
              currentStep={currentStep}
              totalSteps={totalSteps}
              timeSpent={timeSpent}
            />
          )}
        </div>

        {/* Question Card */}
        {currentStep >= 1 && currentStep <= totalSteps && (
          <Card className="p-4 sm:p-6 md:p-8 shadow-card max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="mb-4 sm:mb-6">
                <p className="text-sm font-medium text-primary mb-2">
                  {questions[currentQuestion].subtitle}
                </p>
                <h2 className="text-responsive-lg font-bold leading-relaxed flex items-center gap-3">
                  <span className="text-3xl">{questions[currentQuestion].emoji}</span>
                  {questions[currentQuestion].question}
                </h2>
              </div>

              <div className="space-y-4">
                {questions[currentQuestion].options.map((option) => (
                  <QuestionOption
                    key={option.value}
                    option={option}
                    isSelected={answers[currentQuestion] === option.value}
                    isCurrentSelection={selectedAnswer === option.value}
                    showFeedback={showFeedback}
                    touchTargetClass={touchTargetClass}
                    animationClass={animationClass}
                    onSelect={handleAnswerChange}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 btn-touch ${animationClass}`}
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </Button>

              <Button
                variant="cta"
                onClick={handleNext}
                disabled={!answers[currentQuestion] || isAdvancingRef.current}
                className={`flex items-center gap-2 px-6 sm:px-8 btn-touch ${mobileButtonClass} ${animationClass} ${isAdvancingRef.current ? 'opacity-50' : ''}`}
                style={{ display: showFeedback ? 'none' : 'flex' }}
              >
                {currentStep === totalSteps - 1 ? "Voir mes résultats" : "Suivant"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Trust indicators */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            ✓ Vos réponses restent confidentielles • ✓ Aucune information vendue • ✓ Analyse gratuite
          </p>
        </div>


        {/* Sticky Mobile CTA */}
        <StickyMobileCTA 
          onAction={handleNext}
          isVisible={currentStep >= 1 && currentStep <= totalSteps && !showCompletionMessage}
          text={currentStep === totalSteps ? "Voir mes résultats" : "Question suivante"}
          isDisabled={!answers[currentQuestion] && !isAdvancingRef.current}
        />
      </div>
    </div>
  );
};

export default Quiz;