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

  return null;
};