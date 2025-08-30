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
      question: "Combien d'heures par semaine passez-vous sur la paperasse administrative ?",
      options: [
        { value: "less-than-3", label: "Moins de 3 heures", score: 1 },
        { value: "3-to-8", label: "3 à 8 heures", score: 2 },
        { value: "8-to-15", label: "8 à 15 heures", score: 3 },
        { value: "more-than-15", label: "Plus de 15 heures (je n'en peux plus !)", score: 4 }
      ]
    },
    {
      id: 1,
      question: "Utilisez-vous plus de 3 logiciels différents pour gérer votre entreprise ?",
      options: [
        { value: "one-system", label: "Non, j'ai un système unifié", score: 1 },
        { value: "two-three", label: "Oui, 2 ou 3 logiciels", score: 2 },
        { value: "four-six", label: "Oui, 4 à 6 logiciels différents", score: 3 },
        { value: "too-many", label: "Trop ! J'ai perdu le compte...", score: 4 }
      ]
    },
    {
      id: 2,
      question: "À quel point vous arrive-t-il de repousser des tâches importantes faute de temps ?",
      options: [
        { value: "never", label: "Jamais, je suis très organisé(e)", score: 1 },
        { value: "sometimes", label: "Parfois, quand c'est très chargé", score: 2 },
        { value: "often", label: "Souvent, je cours toujours", score: 3 },
        { value: "constantly", label: "Constamment ! Je suis débordé(e)", score: 4 }
      ]
    },
    {
      id: 3,
      question: "Quelle est votre plus grande préoccupation en fin d'année fiscale ?",
      options: [
        { value: "confident", label: "Tout est sous contrôle", score: 1 },
        { value: "some-stress", label: "Un peu de stress avec les déclarations", score: 2 },
        { value: "very-stressful", label: "C'est très stressant, j'ai peur des erreurs", score: 3 },
        { value: "nightmare", label: "C'est un cauchemar ! TPS, TVQ... je panique", score: 4 }
      ]
    },
    {
      id: 4,
      question: "Si vous pouviez récupérer 10 heures par semaine, que feriez-vous ?",
      options: [
        { value: "rest", label: "Me reposer enfin", score: 2 },
        { value: "family", label: "Passer plus de temps en famille", score: 3 },
        { value: "growth", label: "Développer mon entreprise", score: 4 },
        { value: "strategy", label: "Me concentrer sur la stratégie", score: 4 }
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

      // Generate personalized diagnostic message
      const diagnosticMessage = generateDiagnostic(totalScore, answers);
      
      // Store quiz results with diagnostic
      localStorage.setItem("quizResults", JSON.stringify({ 
        answers, 
        totalScore, 
        diagnostic: diagnosticMessage 
      }));
      
      toast({
        title: "Analyse terminée !",
        description: "Découvrez votre diagnostic personnalisé.",
      });
      
      navigate("/vsl");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const generateDiagnostic = (score: number, answers: Record<number, string>) => {
    if (score >= 16) {
      return "🚨 Votre situation est critique ! Vous passez visiblement énormément de temps sur des tâches manuelles répétitives qui freinent complètement la croissance de votre entreprise. La bonne nouvelle ? Il existe des moyens simples d'automatiser tout ça et de vous libérer au moins 15-20 heures par semaine. Imaginez ce que vous pourriez accomplir avec tout ce temps retrouvé !";
    } else if (score >= 12) {
      return "⚠️ Attention ! Votre gestion actuelle vous fait perdre beaucoup trop de temps et d'argent. Entre la paperasse, les multiples logiciels et le stress administratif, vous pourriez facilement récupérer 10-15 heures par semaine avec les bons outils. Il est temps d'agir avant que ça vous épuise complètement.";
    } else if (score >= 8) {
      return "📈 Vous vous débrouillez, mais vous pourriez faire tellement mieux ! Vos réponses montrent qu'il y a encore pas mal de place à l'amélioration. En optimisant votre gestion, vous pourriez récupérer 6-10 heures par semaine et surtout, éliminer ce stress administratif qui vous pèse.";
    } else {
      return "✅ Vous êtes déjà bien organisé, bravo ! Cependant, même les entreprises bien gérées peuvent bénéficier d'une optimisation. Il y a sûrement encore 3-5 heures par semaine à récupérer, et surtout, vous pourriez avoir l'esprit encore plus tranquille avec une gestion entièrement automatisée.";
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Marre de perdre votre temps sur la paperasse ?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Répondez à ces 5 questions simples et découvrez combien d'heures vous pourriez récupérer chaque semaine
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