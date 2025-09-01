import React, { memo } from "react";
import { Progress } from "@/components/ui/progress";

interface OptimizedQuizProgressProps {
  currentStep: number;
  totalSteps: number;
  variant: "numeric" | "visual_steps";
  timeSpent?: number;
}

export const OptimizedQuizProgress = memo<OptimizedQuizProgressProps>(({ 
  currentStep, 
  totalSteps, 
  variant,
  timeSpent = 0
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  if (variant === "visual_steps") {
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
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                index <= currentStep ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {index <= currentStep ? '✓' : index + 1}
              </div>
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
          {currentStep === 0 ? "Informations de contact" : `Question ${currentStep} sur ${totalSteps - 1}`}
        </span>
        <div className="flex items-center gap-2">
          {timeSpent > 0 && (
            <span className="text-xs text-muted-foreground">{timeSpent}s</span>
          )}
          <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
        </div>
      </div>
      <Progress value={progress} className="h-3" />
    </div>
  );
});

OptimizedQuizProgress.displayName = 'OptimizedQuizProgress';