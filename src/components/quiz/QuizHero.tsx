import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface QuizHeroProps {
  onStartQuiz: () => void;
}

export const QuizHero = ({ onStartQuiz }: QuizHeroProps) => {
  return (
    <div className="text-center mb-8 sm:mb-12">
      {/* Hero Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
        Découvre en 60 secondes pourquoi tu perds des heures chaque semaine…
        <br />
        <span className="text-primary">et comment automatiser tout ça pour enfin souffler.</span>
      </h1>
      
      {/* Social Proof Subtitle */}
      <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-4xl mx-auto">
        <strong>+3 200 dirigeants québécois</strong> ont déjà utilisé ce quiz pour reprendre le contrôle de leur entreprise 
        et <span className="text-primary font-semibold">sauver des dizaines d'heures par mois</span>.
      </p>
      
      {/* CTA Button */}
      <Button
        variant="cta-large"
        onClick={onStartQuiz}
        className="text-lg sm:text-xl px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-subtle"
      >
        👉 Commencer le Quiz Gratuit
        <ArrowRight className="w-6 h-6 ml-3" />
      </Button>
    </div>
  );
};