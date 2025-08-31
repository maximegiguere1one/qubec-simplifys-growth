import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { X, MessageCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface MicroSurveyProps {
  surveyId: string;
  question: string;
  options: { value: string; label: string }[];
  onComplete?: (answer: string) => void;
  onDismiss?: () => void;
  className?: string;
}

export const MicroSurvey = ({
  surveyId,
  question,
  options,
  onComplete,
  onDismiss,
  className = ''
}: MicroSurveyProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    trackEvent('quiz_question_answer', {
      survey_id: surveyId,
      question,
      answer: selectedAnswer,
    });
    
    setIsSubmitted(true);
    onComplete?.(selectedAnswer);
    
    // Auto-hide after 2 seconds
    setTimeout(() => setIsDismissed(true), 2000);
  };

  const handleDismiss = () => {
    trackEvent('quiz_question_answer', {
      survey_id: surveyId,
      question,
      answer: 'dismissed',
    });
    
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <div className={`fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-6 sm:transform-none z-50 w-[calc(100%-2rem)] sm:w-auto max-w-sm safe-area-inset-bottom ${className}`}>
      <Card className="p-4 sm:p-6 shadow-strong border-2 border-primary/20 mx-2 sm:mx-0">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Question rapide</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-destructive/10 btn-touch"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!isSubmitted ? (
          <div className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm font-medium" role="group" aria-labelledby="survey-question">{question}</p>
            
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-xs sm:text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              variant="cta"
              size="sm"
              className="w-full btn-touch"
            >
              Répondre
            </Button>
          </div>
        ) : (
          <div className="text-center py-2" role="status" aria-live="polite">
            <p className="text-xs sm:text-sm text-success font-medium">Merci pour votre réponse ! 🙏</p>
          </div>
        )}
      </Card>
    </div>
  );
};