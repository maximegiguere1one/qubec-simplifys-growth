import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startQuizSession, trackQuizAnswer, completeQuizSession, trackEvent, createLead, getABVariant, trackABConversion, sendQuizConfirmationEmail, getLeadId } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { MicroSurvey } from "@/components/MicroSurvey";
import { EnhancedQuizProgress } from "@/components/enhanced/EnhancedQuizProgress";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";
import { QuizCompletionDialog } from "@/components/QuizCompletionDialog";

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0 = contact capture, 1+ = quiz questions
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [quizStartTime] = useState(Date.now());
  const [showSurvey, setShowSurvey] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizSessionStarted, setQuizSessionStarted] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string>("");
  const [currentDiagnostic, setCurrentDiagnostic] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, mobileButtonClass, animationClass } = useMobileOptimized();
  
  // Refs to prevent double-triggering
  const advanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAdvancingRef = useRef(false);
  
  // A/B test for personalization
  const personalizationVariant = getABVariant("quiz_personalization", ["standard", "dynamic"]);
  
  // Track quiz abandonment
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 0 && currentStep < questions.length && !exitIntentShown) {
        trackEvent('quiz_question_answer', { 
          event_type: 'quiz_abandonment', 
          current_step: currentStep,
          answers_completed: Object.keys(answers).length 
        });
        setExitIntentShown(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, answers, exitIntentShown]);
  
  // Track page view and start quiz session
  usePageTracking();
  
  useEffect(() => {
    // Only start quiz session once after contact capture
    if (currentStep > 0 && !quizSessionStarted) {
      startQuizSession();
      setQuizSessionStarted(true);
    }
  }, [currentStep, quizSessionStarted]);

  const questions = [
    {
      id: 1,
      question: "En ce moment, qu'est-ce qui vous fait perdre le plus de temps dans votre quotidien d'entrepreneur ?",
      subtitle: "Question 1 sur 5 - Identifions votre plus gros défi",
      options: [
        { value: "inventory", label: "Compter mon inventaire et suivre mes stocks", score: 25, priority: "Gestion d'inventaire" },
        { value: "billing", label: "Faire mes factures et tenir mes livres à jour", score: 20, priority: "Facturation" },
        { value: "hr", label: "Gérer les horaires et calculer la paie", score: 15, priority: "Gestion des employés" },
        { value: "projects", label: "Suivre mes projets et respecter mes échéances", score: 20, priority: "Suivi de projets" },
        { value: "crm", label: "Tenir à jour mes contacts et suivre mes clients", score: 25, priority: "Gestion clients" }
      ]
    },
    {
      id: 2,
      question: "Quand vous pensez aux heures que vous passez dans la paperasse chaque semaine, que ressentez-vous ?",
      subtitle: "Question 2 sur 5 - Quantifions le temps perdu",
      options: [
        { value: "low", label: "Moins de 5 heures - c'est gérable", score: 5 },
        { value: "medium", label: "5 à 15 heures - ça commence à peser", score: 15 },
        { value: "high", label: "15 à 25 heures - c'est vraiment trop", score: 25 },
        { value: "very_high", label: "Plus de 25 heures - j'en ai assez !", score: 35 }
      ]
    },
    {
      id: 3,
      question: "Avez-vous déjà pensé : 'Si seulement il existait un outil qui faisait exactement ce dont j'ai besoin' ?",
      subtitle: "Question 3 sur 5 - Évaluons votre besoin de solution personnalisée",
      options: [
        { value: "never", label: "Non, mes outils actuels me conviennent", score: 1 },
        { value: "sometimes", label: "Oui, de temps en temps", score: 2 },
        { value: "often", label: "Oui, assez souvent même !", score: 3 },
        { value: "constantly", label: "Tout le temps ! C'est frustrant", score: 4 }
      ]
    },
    {
      id: 4,
      question: "Si quelqu'un pouvait créer pour vous l'outil parfait adapté à votre entreprise, comment réagiriez-vous ?",
      subtitle: "Question 4 sur 5 - Mesurons votre intérêt pour une solution personnalisée",
      options: [
        { value: "skeptical", label: "Je serais prudent, ça semble trop beau", score: 1 },
        { value: "interested", label: "Ça m'intéresserait vraiment", score: 2 },
        { value: "excited", label: "Je serais très enthousiaste !", score: 3 },
        { value: "dream", label: "Ce serait un rêve qui se réalise !", score: 4 }
      ]
    },
    {
      id: 5,
      question: "Quel type de solution transformerait le plus votre façon de travailler ?",
      subtitle: "Question 5 sur 5 - Définissons votre solution idéale",
      options: [
        { value: "automation", label: "Que tout se fasse automatiquement", score: 2, type: "Système d'automatisation" },
        { value: "integration", label: "Avoir tous mes outils dans un seul endroit", score: 3, type: "Plateforme intégrée" },
        { value: "custom", label: "Quelque chose conçu spécifiquement pour moi", score: 4, type: "Solution sur mesure complète" },
        { value: "mobile", label: "Pouvoir tout gérer depuis mon téléphone", score: 3, type: "Application mobile personnalisée" }
      ]
    }
  ];

  const totalSteps = questions.length + 1; // +1 for contact capture
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentQuestion = currentStep - 1; // Adjust for contact capture step

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
      // Create lead in database
      const lead = await createLead(contactInfo.email, contactInfo.name, contactInfo.phone, 'quiz');
      
      // Track the opt-in event
      await trackEvent('lp_submit_optin', {
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        source: 'quiz'
      });

      // Removed toast notification as requested

      setCurrentStep(1); // Move to first quiz question
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    // Prevent double-triggering
    if (isAdvancingRef.current) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
    
    setSelectedAnswer(value);
    setShowFeedback(true);
    
    // Track time spent on question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const question = questions[currentQuestion];
    const option = question.options.find(opt => opt.value === value);
    
    if (option) {
      trackQuizAnswer(currentQuestion + 1, value, option.score, timeSpent); // +1 to adjust for 0-based index
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
  };

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
      setQuestionStartTime(Date.now());
    } else {
      // Calculate total score and time
      const totalScore = Object.entries(answers).reduce((sum, [questionId, answerValue]) => {
        const question = questions[parseInt(questionId)];
        const option = question.options.find(opt => opt.value === answerValue);
        return sum + (option?.score || 0);
      }, 0);
      
      const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

      // Complete quiz session
      completeQuizSession(totalScore, totalTimeSpent);

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

      // Show completion dialog immediately
      setShowCompletionDialog(true);

      // Send confirmation email asynchronously
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
          setEmailSent(true);
        } catch (error) {
          setEmailError(error instanceof Error ? error.message : "Erreur inconnue");
          console.error("Failed to send confirmation email:", error);
        }
      } else {
        setEmailError("Impossible de récupérer l'ID du lead");
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
          
          {/* Enhanced Progress Bar with A/B test */}
          <EnhancedQuizProgress 
            currentStep={currentStep}
            totalSteps={totalSteps}
            questions={questions}
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

              <RadioGroup 
                value={answers[currentQuestion] || ""} 
                onValueChange={handleAnswerChange}
                className="space-y-4"
              >
                {questions[currentQuestion].options.map((option) => {
                  const isSelected = answers[currentQuestion] === option.value;
                  const isCurrentSelection = selectedAnswer === option.value;
                  
                  return (
                    <div 
                      key={option.value} 
                      className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border transition-all duration-300 cursor-pointer btn-touch
                        ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent/50'}
                        ${isCurrentSelection && showFeedback ? 'bg-green-50 border-green-400 scale-[1.02]' : ''}
                        ${animationClass}`}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label 
                        htmlFor={option.value} 
                        className="text-base sm:text-lg cursor-pointer flex-1 leading-relaxed"
                      >
                        {option.label}
                      </Label>
                      {isCurrentSelection && showFeedback && (
                        <CheckCircle className="w-5 h-5 text-green-600 animate-scale-in" />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
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

        {/* Quiz Completion Dialog */}
        <QuizCompletionDialog
          isOpen={showCompletionDialog}
          onClose={() => setShowCompletionDialog(false)}
          diagnostic={currentDiagnostic}
          contactName={contactInfo.name}
          totalScore={Object.entries(answers).reduce((sum, [questionId, answerValue]) => {
            const question = questions[parseInt(questionId)];
            const option = question.options.find(opt => opt.value === answerValue);
            return sum + (option?.score || 0);
          }, 0)}
          emailSent={emailSent}
          emailError={emailError}
        />
      </div>
    </div>
  );
};

export default Quiz;