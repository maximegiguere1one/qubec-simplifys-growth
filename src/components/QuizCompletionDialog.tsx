import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuizCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostic: string;
  contactName: string;
  totalScore: number;
  emailSent: boolean;
  emailError?: string;
}

export const QuizCompletionDialog = ({
  isOpen,
  onClose,
  diagnostic,
  contactName,
  totalScore,
  emailSent,
  emailError
}: QuizCompletionDialogProps) => {
  const navigate = useNavigate();
  const [showFullDiagnostic, setShowFullDiagnostic] = useState(false);
  const firstName = contactName.split(' ')[0];

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowFullDiagnostic(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getScoreColor = () => {
    if (totalScore >= 16) return "text-red-600";
    if (totalScore >= 12) return "text-orange-600";
    if (totalScore >= 8) return "text-yellow-600";
    return "text-green-600";
  };

  const getScoreLabel = () => {
    if (totalScore >= 16) return "PRIORITÉ URGENTE";
    if (totalScore >= 12) return "FORTE PRIORITÉ";
    if (totalScore >= 8) return "PRIORITÉ MOYENNE";
    return "BIEN ORGANISÉ";
  };

  const handleContinue = () => {
    onClose();
    navigate("/vsl");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            Analyse terminée, {firstName} !
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-2">
          {/* Score Badge */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getScoreColor()} border-current bg-current/10`}>
              <span className="font-bold text-lg">{totalScore}/20</span>
              <span className="font-semibold">{getScoreLabel()}</span>
            </div>
          </div>

          {/* Email Status */}
          <div className="bg-muted/50 border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className={`w-5 h-5 ${emailSent ? 'text-green-600' : emailError ? 'text-red-600' : 'text-yellow-600'}`} />
              <span className="font-semibold">
                {emailSent ? "✅ Email de confirmation envoyé" : 
                 emailError ? "⚠️ Erreur d'envoi d'email" :
                 "📧 Envoi en cours..."}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {emailSent ? 
                "Vérifiez votre boîte email pour votre diagnostic détaillé et les prochaines étapes." :
                emailError ? 
                "Pas de souci ! Vous pouvez continuer et recevoir vos résultats dans la prochaine étape." :
                "Votre diagnostic personnalisé va arriver dans votre boîte email."}
            </p>
          </div>

          {/* Diagnostic Preview */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3 text-primary">🎯 Votre diagnostic personnalisé :</h3>
            <div className={`transition-all duration-1000 ${showFullDiagnostic ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-foreground leading-relaxed">{diagnostic}</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-secondary/20 to-primary/10 border rounded-lg p-6">
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Prochaine étape (2 minutes)
            </h4>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
              <p className="text-primary font-medium text-center">
                🎥 Bravo ! On vous a préparé une vidéo personnalisée avec les prochaines étapes.
              </p>
            </div>
            <p className="text-muted-foreground mb-4">
              Découvrez maintenant comment nous pourrions transformer votre quotidien avec une solution sur mesure.
            </p>
            <Button 
              onClick={handleContinue}
              className="w-full h-12 text-lg font-semibold gap-2"
              variant="cta-large"
            >
              🎥 Voir ma solution personnalisée
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Trust Elements */}
          <div className="text-center text-sm text-muted-foreground">
            <p>🔒 Vos données sont sécurisées • 📧 Pas de spam • 🎯 100% personnalisé</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};