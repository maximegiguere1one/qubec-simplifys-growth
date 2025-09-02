import { Progress } from "@/components/ui/progress";

interface OptimizedProgressProps {
  currentStep: number;
  totalSteps: number;
  timeSpent?: number;
}

export const OptimizedProgress = ({ currentStep, totalSteps, timeSpent = 0 }: OptimizedProgressProps) => {
  const progress = ((currentStep) / (totalSteps - 1)) * 100;
  const questionNumber = currentStep;
  const totalQuestions = totalSteps - 1;
  
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-primary">
          Question {questionNumber} sur {totalQuestions} • ⏱️ 60 secondes
        </div>
        <div className="text-xs text-muted-foreground">
          {Math.floor(timeSpent)}s
        </div>
      </div>
      <Progress value={progress} className="h-3" />
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Plus que {totalQuestions - questionNumber} questions !
      </div>
    </div>
  );
};