import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startQuizSession, trackQuizAnswer, completeQuizSession, trackEvent } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { MicroSurvey } from "@/components/MicroSurvey";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [quizStartTime] = useState(Date.now());
  const [showSurvey, setShowSurvey] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Track page view and start quiz session
  usePageTracking();
  
  useEffect(() => {
    startQuizSession();
  }, []);

  const questions = [
    {
      id: 0,
      question: "Combien de temps perdez-vous chaque semaine à gérer vos systèmes actuels ?",
      options: [
        { value: "less-than-5", label: "Moins de 5 heures", score: 1 },
        { value: "5-to-10", label: "5 à 10 heures", score: 2 },
        { value: "10-to-20", label: "10 à 20 heures", score: 3 },
        { value: "more-than-20", label: "Plus de 20 heures", score: 4 }
      ]
    },
    {
      id: 1,
      question: "Quels sont vos principaux défis actuels ? (Choisissez le plus important)",
      options: [
        { value: "manual-processes", label: "Trop de processus manuels", score: 3 },
        { value: "data-silos", label: "Données éparpillées dans plusieurs systèmes", score: 4 },
        { value: "errors", label: "Erreurs fréquentes et coûteuses", score: 3 },
        { value: "time-waste", label: "Perte de temps sur des tâches répétitives", score: 4 }
      ]
    },
    {
      id: 2,
      question: "Quelle est la taille de votre équipe ?",
      options: [
        { value: "solo", label: "Travailleur autonome", score: 1 },
        { value: "small", label: "2 à 10 employés", score: 2 },
        { value: "medium", label: "11 à 50 employés", score: 3 },
        { value: "large", label: "Plus de 50 employés", score: 4 }
      ]
    },
    {
      id: 3,
      question: "À quel point souhaitez-vous une solution clé en main ?",
      options: [
        { value: "minimal", label: "Je préfère tout configurer moi-même", score: 1 },
        { value: "partial", label: "Un mélange de configuration et d'assistance", score: 2 },
        { value: "mostly", label: "Principalement clé en main avec quelques ajustements", score: 3 },
        { value: "complete", label: "100% clé en main, je veux juste que ça marche", score: 4 }
      ]
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
    
    // Track time spent on question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const question = questions[currentQuestion];
    const option = question.options.find(opt => opt.value === value);
    
    if (option) {
      trackQuizAnswer(currentQuestion, value, option.score, timeSpent);
    }
  };

  const handleNext = () => {
    if (!answers[currentQuestion]) {
      toast({
        title: "Réponse requise",
        description: "Veuillez sélectionner une réponse avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
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

      // Store quiz results
      localStorage.setItem("quizResults", JSON.stringify({ answers, totalScore }));
      
      toast({
        title: "Quiz complété !",
        description: "Découvrez vos résultats personnalisés.",
      });
      
      navigate("/vsl");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Découvrez votre potentiel d'optimisation
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Répondez à ces 4 questions simples pour recevoir une analyse personnalisée de vos besoins
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Question {currentQuestion + 1} sur {questions.length}</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 shadow-card max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 leading-relaxed">
              {currentQ.question}
            </h2>

            <RadioGroup 
              value={answers[currentQuestion] || ""} 
              onValueChange={handleAnswerChange}
              className="space-y-4"
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="text-lg cursor-pointer flex-1 leading-relaxed"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Précédent
            </Button>

            <Button
              variant="cta"
              onClick={handleNext}
              className="flex items-center gap-2 px-8"
            >
              {currentQuestion === questions.length - 1 ? "Voir mes résultats" : "Suivant"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Trust indicators */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            ✓ Vos réponses restent confidentielles • ✓ Aucune information vendue • ✓ Analyse gratuite
          </p>
        </div>

        {/* Micro Survey for quiz abandonment */}
        {currentQuestion > 1 && !showSurvey && (
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
      </div>
    </div>
  );
};

export default Quiz;