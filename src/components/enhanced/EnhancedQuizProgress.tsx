import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { getABVariant, trackABConversion } from "@/lib/analytics";
import { CheckCircle2, Circle } from "lucide-react";

interface EnhancedQuizProgressProps {
  currentStep: number;
  totalSteps: number;
  questions: any[];
}

export const EnhancedQuizProgress = ({ currentStep, totalSteps, questions }: EnhancedQuizProgressProps) => {
  const [progressVariant] = useState(() => getABVariant("quiz_progress", ["numeric", "visual_steps"]));
  
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    // Track engagement with progress indicator
    trackABConversion("quiz_progress", progressVariant, "view");
  }, [progressVariant]);

  if (progressVariant === "visual_steps") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            {currentStep === 0 ? "Informations" : `Question ${currentStep}`}
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}% complété
          </span>
        </div>
        
        {/* Visual step indicators */}
        <div className="flex items-center space-x-2 mb-4">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div key={index} className="flex items-center">
              {index <= currentStep ? (
                <CheckCircle2 className="w-6 h-6 text-success" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground" />
              )}
              {index < totalSteps - 1 && (
                <div className={`h-0.5 w-8 mx-2 ${index < currentStep ? 'bg-success' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium">
          {currentStep === 0 ? "Informations de contact" : `Question ${currentStep} sur ${questions.length}`}
        </span>
        <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-3" />
    </div>
  );
};