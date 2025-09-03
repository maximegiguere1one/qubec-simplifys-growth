import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
export const QuizScarcityCounter = () => {
  const [completedToday, setCompletedToday] = useState(74);
  const totalLimit = 100;
  useEffect(() => {
    // Simulate real-time counter updates
    const interval = setInterval(() => {
      setCompletedToday(prev => {
        const newCount = Math.min(prev + Math.floor(Math.random() * 3), totalLimit - 5);
        return newCount;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);
  const remaining = totalLimit - completedToday;
  const isLowAvailability = remaining <= 20;
  return <Card className={`p-4 sm:p-6 mb-8 border-2 text-center ${isLowAvailability ? 'border-destructive/40 bg-gradient-to-r from-destructive/5 to-orange-500/10' : 'border-orange-500/40 bg-gradient-to-r from-orange-500/5 to-orange-500/10'}`}>
      <div className="flex items-center justify-center gap-3 mb-3">
        <AlertTriangle className={`w-6 h-6 ${isLowAvailability ? 'text-destructive' : 'text-orange-500'}`} />
        <h3 className="font-bold text-lg">
          {isLowAvailability ? '⚠️ Attention : Places limitées !' : '🔥 Offre limitée'}
        </h3>
      </div>
      
      <p className="text-sm sm:text-base mb-4">
        <strong>Seulement 100 diagnostics offerts chaque semaine.</strong>
      </p>
      
      

      {isLowAvailability}
    </Card>;
};