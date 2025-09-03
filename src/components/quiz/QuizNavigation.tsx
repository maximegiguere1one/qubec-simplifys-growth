import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuizNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  isAdvancing: boolean;
  showFeedback: boolean;
  animationClass: string;
  mobileButtonClass: string;
  onPrevious: () => void;
  onNext: () => void;
}

export const QuizNavigation = ({
  currentStep,
  totalSteps,
  canGoNext,
  isAdvancing,
  showFeedback,
  animationClass,
  mobileButtonClass,
  onPrevious,
  onNext
}: QuizNavigationProps) => {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className={`flex items-center gap-2 btn-touch ${animationClass}`}
      >
        <ArrowLeft className="w-4 h-4" />
        Précédent
      </Button>

      <Button
        variant="cta"
        onClick={onNext}
        disabled={!canGoNext || isAdvancing}
        className={`flex items-center gap-2 px-6 sm:px-8 btn-touch ${mobileButtonClass} ${animationClass} ${isAdvancing ? 'opacity-50' : ''}`}
        style={{ display: showFeedback ? 'none' : 'flex' }}
      >
        {currentStep === totalSteps ? "Voir mes résultats" : "Suivant"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};