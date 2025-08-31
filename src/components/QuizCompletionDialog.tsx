import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, ArrowRight, Clock, Zap, Target } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(0);
  const firstName = contactName.split(' ')[0];

  useEffect(() => {
    if (isOpen) {
      // Animation en 3 étapes pour engagement maximum
      const timers = [
        setTimeout(() => setCurrentStep(1), 500),   // Score badge
        setTimeout(() => setCurrentStep(2), 1500),  // Diagnostic
        setTimeout(() => setCurrentStep(3), 2500),  // CTA
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isOpen]);

  const getAnalysisData = () => {
    if (totalScore >= 16) return {
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
      badge: "URGENCE DÉTECTÉE",
      timeGain: "20-30h",
      roi: "400%",
      priority: "CRITIQUE",
      icon: <Zap className="w-5 h-5" />
    };
    if (totalScore >= 12) return {
      color: "text-orange-600", 
      bgColor: "bg-orange-50 border-orange-200",
      badge: "FORT POTENTIEL",
      timeGain: "15-20h",
      roi: "300%", 
      priority: "ÉLEVÉE",
      icon: <TrendingUp className="w-5 h-5" />
    };
    if (totalScore >= 8) return {
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 border-yellow-200", 
      badge: "BON POTENTIEL",
      timeGain: "10-15h",
      roi: "250%",
      priority: "MODÉRÉE",
      icon: <Target className="w-5 h-5" />
    };
    return {
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      badge: "OPTIMISÉ",
      timeGain: "5-10h",
      roi: "200%",
      priority: "PRÉVENTIVE",
      icon: <CheckCircle className="w-5 h-5" />
    };
  };

  const analysisData = getAnalysisData();

  const handleContinue = () => {
    onClose();
    navigate("/vsl");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[95vh] overflow-y-auto p-0 gap-0">
        {/* Header mobile-optimized */}
        <div className="bg-gradient-to-r from-primary to-primary-glow text-white p-4 sm:p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-lg sm:text-xl font-bold">Analyse terminée !</h2>
          </div>
          <p className="text-sm opacity-90">{firstName}, voici votre diagnostic expert</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Score Analysis */}
          <div className={`transition-all duration-500 transform ${currentStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className={`${analysisData.bgColor} border-2 rounded-xl p-4 text-center`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {analysisData.icon}
                <span className={`font-bold text-sm ${analysisData.color}`}>
                  {analysisData.badge}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className={`font-bold text-lg ${analysisData.color}`}>{totalScore}/20</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
                <div>
                  <div className={`font-bold text-lg ${analysisData.color}`}>+{analysisData.timeGain}</div>
                  <div className="text-xs text-muted-foreground">Économie/sem</div>
                </div>
                <div>
                  <div className={`font-bold text-lg ${analysisData.color}`}>{analysisData.roi}</div>
                  <div className="text-xs text-muted-foreground">ROI potentiel</div>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Diagnostic */}
          <div className={`transition-all duration-500 transform ${currentStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-gradient-to-br from-primary/5 to-secondary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📋</span>
                </div>
                <h3 className="font-bold text-sm">Diagnostic expert personnalisé</h3>
              </div>
              <div className="bg-white/80 rounded-lg p-3 mb-3">
                <p className="text-sm leading-relaxed text-foreground">{diagnostic}</p>
              </div>
              
              {/* Valeur concrète ajoutée */}
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Temps libéré :</strong> {analysisData.timeGain}/semaine soit {totalScore >= 16 ? '80-120h' : totalScore >= 12 ? '60-80h' : totalScore >= 8 ? '40-60h' : '20-40h'}/mois</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span><strong>Valeur économique :</strong> {totalScore >= 16 ? '12-18k$' : totalScore >= 12 ? '8-12k$' : totalScore >= 8 ? '5-8k$' : '3-5k$'}/an en temps récupéré</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span><strong>Impact :</strong> Réduction de {totalScore >= 12 ? '70-85%' : '50-70%'} des tâches répétitives</span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Status - compact */}
          {emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-xs text-green-700">
                ✅ Diagnostic détaillé envoyé par email
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className={`transition-all duration-500 transform ${currentStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Étape suivante (2 min)</span>
              </div>
              <h4 className="font-bold text-base mb-2">
                🎯 Solution personnalisée prête !
              </h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Découvrez maintenant comment <strong>+200 entrepreneurs québécois</strong> ont automatisé leurs opérations avec notre système sur mesure.
              </p>
              
              <Button 
                onClick={handleContinue}
                className="w-full h-12 text-sm font-semibold gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                variant="cta-large"
              >
                🎥 Voir ma stratégie personnalisée
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <div className="flex justify-center items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>🔒 100% confidentiel</span>
                <span>⚡ Prêt en 30 jours</span>
                <span>🎯 Sur mesure</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};