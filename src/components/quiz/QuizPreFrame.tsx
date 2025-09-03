import { Card } from "@/components/ui/card";
import { Users, Heart, TrendingUp } from "lucide-react";
export const QuizPreFrame = () => {
  return <Card className="p-6 sm:p-8 mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="w-6 h-6 text-primary" />
          <Heart className="w-5 h-5 text-red-500" />
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold mb-4">
          🎯 Ce quiz a aidé <span className="text-primary">plusieurs propriétaires d'entreprise</span> comme toi
        </h3>
        
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          À comprendre ce qui leur <strong className="text-foreground">volait leur temps et leur énergie</strong> au quotidien. 
          <br />
          <span className="text-primary font-semibold">Découvre maintenant ce qui t'empêche vraiment de souffler…</span>
        </p>
      </div>
    </Card>;
};