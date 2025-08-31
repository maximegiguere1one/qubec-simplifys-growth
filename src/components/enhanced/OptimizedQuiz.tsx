import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { getABVariant, trackQuizAnswer, trackABConversion } from "@/lib/analytics";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";

interface OptimizedQuizProps {
  questions: any[];
  currentQuestion: number;
  answers: Record<number, string>;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  totalSteps: number;
  isLastQuestion: boolean;
}

export const OptimizedQuiz = ({
  questions,
  currentQuestion,
  answers,
  onAnswerChange,
  onNext,
  onPrevious,
  totalSteps,
  isLastQuestion
}: OptimizedQuizProps) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime] = useState(Date.now());
  const { mobileButtonClass, touchTargetClass, animationClass } = useMobileOptimized();
  
  // A/B test for progress indicator style
  const progressVariant = getABVariant("quiz_progress", ["numeric", "visual"]);
  
  // Track time spent on question
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [questionStartTime]);

  const progress = ((currentQuestion + 1) / totalSteps) * 100;
  const question = questions[currentQuestion];

  const handleAnswerSelect = (value: string) => {
    onAnswerChange(value);
    
    // Track A/B test conversion for engagement
    if (currentQuestion === 0) {
      trackABConversion("quiz_progress", progressVariant, "first_answer");
    }
  };

  return (
    <Card className="p-4 sm:p-6 md:p-8 shadow-card max-w-3xl mx-auto">
      {/* Enhanced Progress Indicator */}
      <div className="mb-6 sm:mb-8">
        {progressVariant === "visual" ? (
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {timeSpent}s - Question {currentQuestion + 1} sur {totalSteps}
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              Question {currentQuestion + 1} sur {totalSteps}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
        )}
        <Progress value={progress} className="h-3" />
      </div>

      {/* Question Content */}
      <div className="mb-8">
        <div className="mb-4 sm:mb-6">
          <p className="text-sm font-medium text-primary mb-2">
            {question.subtitle}
          </p>
          <h2 className="text-responsive-lg font-bold leading-relaxed">
            {question.question}
          </h2>
        </div>

        <RadioGroup 
          value={answers[currentQuestion] || ""} 
          onValueChange={handleAnswerSelect}
          className="space-y-4"
        >
          {question.options.map((option: any) => (
            <div 
              key={option.value} 
              className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border hover:bg-accent/50 ${animationClass} cursor-pointer ${touchTargetClass}`}
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <Label 
                htmlFor={option.value} 
                className="text-base sm:text-lg cursor-pointer flex-1 leading-relaxed"
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
          onClick={onPrevious}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-2 ${touchTargetClass}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Précédent
        </Button>

        <Button
          variant="cta"
          onClick={onNext}
          disabled={!answers[currentQuestion]}
          className={`flex items-center gap-2 px-6 sm:px-8 ${touchTargetClass} ${mobileButtonClass}`}
        >
          {isLastQuestion ? "Voir mes résultats" : "Suivant"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};