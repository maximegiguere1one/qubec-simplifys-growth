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
import { MicroSurvey } from "@/components/MicroSurvey";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useOptimizedTimer } from "@/hooks/useOptimizedTimer";
import { QUIZ_QUESTIONS, QuestionOption } from "@/components/optimized/QuizQuestions";
import { OptimizedQuizProgress } from "@/components/optimized/OptimizedQuizProgress";
import { getCachedABVariant, quizAnalytics } from "@/lib/analytics/optimized";

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0 = contact capture, 1+ = quiz questions
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSurvey, setShowSurvey] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizSessionStarted, setQuizSessionStarted] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [currentDiagnostic, setCurrentDiagnostic] = useState("");
  
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
  const totalSteps = useMemo(() => questions.length + 1, [questions.length]);
  const progress = useMemo(() => ((currentStep + 1) / totalSteps) * 100, [currentStep, totalSteps]);
  const currentQuestion = useMemo(() => currentStep - 1, [currentStep]);
  
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
    // Only start quiz session once after contact capture
    if (currentStep > 0 && !quizSessionStarted) {
      startQuizSession();
      setQuizSessionStarted(true);
      resetTimer(); // Reset timer when starting quiz
    }
  }, [currentStep, quizSessionStarted, resetTimer]);
  
  // Track question views for analytics
  useEffect(() => {
    if (currentStep > 0) {
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

  const handleContactSubmit = async () => {
    if (!contactInfo.name.trim() || !contactInfo.email.trim() || !contactInfo.phone.trim()) {
      toast({
        title: "Information requise",
        description: "Veuillez remplir tous les champs avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
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
      const lead = await createLead(contactInfo.email, contactInfo.name, contactInfo.phone, 'quiz');
      
      if (!lead) {
        throw new Error('Failed to create lead');
      }
      
      // Track the opt-in event
      await trackEvent('lp_submit_optin', {
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        source: 'quiz'
      });

      console.log('Lead created successfully, moving to quiz');
      setCurrentStep(1); // Move to first quiz question
    } catch (error) {
      console.error('Contact submission error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.",
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

    if (currentStep < totalSteps - 1) {
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
    if (currentStep > 0) {
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

  return (
    <div className="min-h-[100dvh] bg-gradient-background py-6 sm:py-8 md:py-12">
      <div className="container mx-auto container-mobile max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          {currentStep === 0 && (
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Découvrons ensemble votre potentiel d'économie de temps
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
                Aidez-nous à comprendre votre réalité d'entrepreneur
              </p>
            </div>
          )}
          
          {/* Optimized Progress Bar with A/B test */}
          <OptimizedQuizProgress 
            currentStep={currentStep}
            totalSteps={totalSteps}
            variant={progressVariant}
            timeSpent={timeSpent}
          />
        </div>

        {/* Contact Capture or Question Card */}
        {currentStep === 0 ? (
          <Card id="contact-form" className="p-6 sm:p-8 md:p-10 shadow-card max-w-3xl mx-auto border-2 border-primary/20">
            <div className="space-y-6">
              <div>
                <Input
                  id="name"
                  placeholder="Prénom et nom"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="text-base sm:text-lg btn-touch"
                  autoComplete="name"
                  autoCapitalize="words"
                />
              </div>
              
              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Adresse email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="text-base sm:text-lg btn-touch"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                />
              </div>
              
              <div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={contactInfo.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    if (formatted.length <= 14) { // Max length for formatted phone
                      setContactInfo(prev => ({ ...prev, phone: formatted }));
                    }
                  }}
                  className="text-base sm:text-lg btn-touch"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Button
                variant="cta-large"
                onClick={handleContactSubmit}
                disabled={isSubmittingContact}
                className={`w-full h-14 sm:h-16 ${mobileButtonClass} btn-touch text-base sm:text-lg font-semibold ${animationClass} shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {isSubmittingContact ? "Un instant..." : "Commencer maintenant"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-4 sm:p-6 md:p-8 shadow-card max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="mb-4 sm:mb-6">
                <p className="text-sm font-medium text-primary mb-2">
                  {questions[currentQuestion].subtitle}
                </p>
                <h2 className="text-responsive-lg font-bold leading-relaxed">
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

        {/* Micro Survey for quiz abandonment */}
        {currentStep > 2 && !showSurvey && (
          <MicroSurvey
            surveyId="quiz_experience"
            question="Comment trouvez-vous ce quiz jusqu'à présent ?"
            options={[
              { value: 'easy', label: 'Facile à comprendre' },
              { value: 'relevant', label: 'Très pertinent' },
              { value: 'long', label: 'Un peu long' },
              { value: 'confusing', label: 'Quelques questions confuses' },
            ]}
            onComplete={() => setShowSurvey(true)}
            onDismiss={() => setShowSurvey(true)}
          />
        )}

        {/* Quiz Completion Message */}
        {showCompletionMessage && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Alert className="max-w-md mx-auto bg-card border-primary/20 shadow-lg">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-center space-y-4">
                <div>
                  <p className="font-semibold text-lg mb-2">Merci {contactInfo.name.split(' ')[0]} !</p>
                  <p className="text-muted-foreground">
                    Vos résultats personnalisés ont été envoyés à votre adresse email.
                  </p>
                </div>
                <div className="pt-2">
                  <Button 
                    variant="cta" 
                    onClick={() => NavigationService.goToVSL()}
                    className="w-full"
                  >
                    Voir votre analyse détaillée
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Redirection automatique dans quelques secondes...
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;