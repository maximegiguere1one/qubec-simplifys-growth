import { CheckCircle2, Circle } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  className?: string;
}

export const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  stepLabels, 
  className = "" 
}: ProgressIndicatorProps) => {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            {index < currentStep ? (
              <CheckCircle2 className="w-8 h-8 text-success" />
            ) : index === currentStep ? (
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
            ) : (
              <Circle className="w-8 h-8 text-muted-foreground" />
            )}
            <span className={`text-xs mt-1 ${index === currentStep ? 'font-medium' : 'text-muted-foreground'}`}>
              {stepLabels[index]}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div className={`h-1 w-8 mx-2 rounded ${index < currentStep ? 'bg-success' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );
};