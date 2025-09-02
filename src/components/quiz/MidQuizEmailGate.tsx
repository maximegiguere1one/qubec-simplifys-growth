import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Lock } from "lucide-react";

interface MidQuizEmailGateProps {
  onSubmit: (email: string, name: string) => Promise<void>;
  isSubmitting: boolean;
}

export const MidQuizEmailGate = ({ onSubmit, isSubmitting }: MidQuizEmailGateProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !name.trim()) return;
    await onSubmit(email, name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Card className="p-6 sm:p-8 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold mb-3">
          🎯 Débloque tes résultats personnalisés !
        </h3>
        
        <p className="text-muted-foreground mb-6">
          Tu viens de répondre aux <strong className="text-foreground">questions les plus importantes</strong>.
          <br />
          Laisse ton email pour recevoir <span className="text-primary font-semibold">ton diagnostic complet</span> 
          et découvrir comment <strong className="text-foreground">automatiser exactement ce qui te fait chier</strong>.
        </p>

        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/20 mb-6">
          <p className="text-sm text-muted-foreground">
            ✨ <strong className="text-primary">Bonus :</strong> Une vidéo de 5 min qui te montre comment sauver 
            <strong className="text-foreground"> +10h/semaine</strong> dès le premier mois.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Ton prénom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-base h-12"
            autoComplete="given-name"
          />
        </div>
        
        <div>
          <Input
            type="email"
            placeholder="Ton adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-base h-12"
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <Button
          variant="cta"
          onClick={handleSubmit}
          disabled={!email.trim() || !name.trim() || isSubmitting}
          className="w-full h-auto py-4 text-base sm:text-lg font-semibold mt-6 leading-tight"
        >
          <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <span className="text-center flex-1 px-1">
            {isSubmitting ? "Un instant..." : "Débloquer mes résultats et continuer"}
          </span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 flex-shrink-0" />
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-3">
          Tu pourras continuer le quiz tout de suite après. Pas de spam.
        </p>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        🔒 Tes informations sont protégées et ne seront jamais partagées.
      </p>
    </Card>
  );
};