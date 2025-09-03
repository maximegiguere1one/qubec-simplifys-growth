import { QuizHero } from './QuizHero';
import { QuizStoryOffer } from './QuizStoryOffer';
import { MobileStoryOffer } from './MobileStoryOffer';
import { QuizScarcityCounter } from './QuizScarcityCounter';
import { QuizPreFrame } from './QuizPreFrame';

interface QuizIntroSectionProps {
  onStartQuiz: () => void;
}

export const QuizIntroSection = ({ onStartQuiz }: QuizIntroSectionProps) => {
  return (
    <>
      {/* Hero Section */}
      <QuizHero onStartQuiz={onStartQuiz} />
      
      {/* Story-Offer Section - Desktop vs Mobile */}
      <div className="hidden md:block">
        <QuizStoryOffer />
      </div>
      <div className="md:hidden">
        <MobileStoryOffer />
      </div>
      
      {/* Scarcity Counter */}
      <QuizScarcityCounter />
      
      {/* Pre-frame */}
      <QuizPreFrame />
    </>
  );
};