import { forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { QuestionOption } from '@/components/optimized/QuizQuestions';
import { QuizQuestion, QuizAnswers } from '@/types/quiz';

interface QuestionCardProps {
  question: QuizQuestion;
  currentQuestion: number;
  answers: QuizAnswers;
  selectedAnswer: string;
  showFeedback: boolean;
  touchTargetClass: string;
  animationClass: string;
  onAnswerSelect: (value: string) => void;
}

export const QuestionCard = forwardRef<HTMLDivElement, QuestionCardProps>(({
  question,
  currentQuestion,
  answers,
  selectedAnswer,
  showFeedback,
  touchTargetClass,
  animationClass,
  onAnswerSelect
}, ref) => {
  return (
    <Card 
      ref={ref} 
      className="p-4 sm:p-6 md:p-8 shadow-card max-w-3xl mx-auto"
      data-question-ref
    >
      <div className="mb-8">
        <div className="mb-4 sm:mb-6">
          <p className="text-sm font-medium text-primary mb-2">
            {question.subtitle}
          </p>
          <h2 className="text-responsive-lg font-bold leading-relaxed flex items-center gap-3">
            <span className="text-3xl">{question.emoji}</span>
            {question.question}
          </h2>
        </div>

        <div className="space-y-4">
          {question.options.map((option, index) => (
            <QuestionOption
              key={option.value}
              option={option}
              isSelected={answers[currentQuestion] === option.value}
              isCurrentSelection={selectedAnswer === option.value}
              showFeedback={showFeedback}
              touchTargetClass={touchTargetClass}
              animationClass={animationClass}
              onSelect={onAnswerSelect}
              data-question-option={index}
            />
          ))}
        </div>
      </div>
    </Card>
  );
});

QuestionCard.displayName = 'QuestionCard';