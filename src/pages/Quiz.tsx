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
      question: "Qu'est-ce qui vous fait perdre le plus de temps dans votre business?",
      options: [
        { value: "inventory", label: "Compter mon inventaire / mes stocks", score: 25, priority: "Gestion d'inventaire" },
        { value: "billing", label: "Faire mes factures et ma comptabilité", score: 20, priority: "Facturation" },
        { value: "hr", label: "Gérer les horaires et la paie", score: 15, priority: "Gestion des employés" },
        { value: "projects", label: "Suivre mes projets et mes deadlines", score: 20, priority: "Suivi de projets" },
        { value: "crm", label: "Tenir à jour mes contacts clients", score: 25, priority: "Gestion clients" }
      ]
    },
    {
      id: 1,
      question: "Combien d'heures par semaine vous passez dans la paperasse?",
      options: [
        { value: "low", label: "Moins de 5 heures (pas si pire)", score: 5 },
        { value: "medium", label: "5 à 15 heures (ça commence à être lourd)", score: 15 },
        { value: "high", label: "15 à 25 heures (c'est rendu ridicule)", score: 25 },
        { value: "very_high", label: "Plus de 25 heures (je passe ma vie là-dedans!)", score: 35 }
      ]
    },
    {
      id: 2,
      question: "Avez-vous déjà dit 'Si seulement il existait un logiciel qui...' ?",
      options: [
        { value: "never", label: "Non, jamais vraiment", score: 1 },
        { value: "sometimes", label: "Oui, quelques fois", score: 2 },
        { value: "often", label: "Oui, souvent même !", score: 3 },
        { value: "constantly", label: "Tout le temps ! C'est mon quotidien", score: 4 }
      ]
    },
    {
      id: 3,
      question: "Quelle serait votre réaction si on vous créait LE système parfait pour votre entreprise ?",
      options: [
        { value: "skeptical", label: "Je serais sceptique", score: 1 },
        { value: "interested", label: "Ça m'intéresserait", score: 2 },
        { value: "excited", label: "Je serais très enthousiaste !", score: 3 },
        { value: "dream", label: "Ce serait un rêve qui devient réalité !", score: 4 }
      ]
    },
    {
      id: 4,
      question: "Quel type de système révolutionnerait le plus votre entreprise ?",
      options: [
        { value: "automation", label: "Automatisation complète des processus", score: 2, type: "Système d'automatisation" },
        { value: "integration", label: "Unification de tous mes outils", score: 3, type: "Plateforme intégrée" },
        { value: "custom", label: "Quelque chose de 100% adapté à mes besoins", score: 4, type: "Solution sur mesure complète" },
        { value: "mobile", label: "Gestion mobile et en temps réel", score: 3, type: "Application mobile personnalisée" }
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
    // Get the main priority from first question
    const firstAnswer = questions[0].options.find(opt => opt.value === answers[0]);
    const mainPriority = (firstAnswer as any)?.priority || "Système sur mesure adapté";
    
    if (score >= 16) {
      return `🎯 PARFAIT ! Votre profil indique que vous avez besoin d'un système vraiment sur mesure. Nous pourrions créer pour vous : ${mainPriority}. Avec votre niveau de complexité actuel, un système personnalisé vous libérerait facilement 15-20 heures par semaine tout en éliminant ces frustrations quotidiennes !`;
    } else if (score >= 12) {
      return `✨ EXCELLENT ! Vous êtes un candidat idéal pour du développement sur mesure. Priorité détectée : ${mainPriority}. Un système conçu spécialement pour vos processus vous ferait gagner 10-15 heures par semaine et transformerait votre façon de travailler.`;
    } else if (score >= 8) {
      return `💡 INTÉRESSANT ! Vous pourriez grandement bénéficier d'un système personnalisé. Focus suggéré : ${mainPriority}. Même avec une bonne organisation actuelle, un outil créé exactement pour vos besoins vous donnerait 6-10 heures supplémentaires par semaine.`;
    } else {
      return `👌 Vous êtes bien organisé ! Mais imaginez un système conçu à 100% pour VOUS. Domaine ciblé : ${mainPriority}. Même les entreprises efficaces gagnent 3-5 heures par semaine avec du sur mesure - et surtout, zéro frustration avec des logiciels qui "ne font pas exactement ce qu'on veut".`;
    } 
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Combien d'heures par semaine vous pourriez récupérer?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            5 questions simples pour voir où vous perdez votre temps
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