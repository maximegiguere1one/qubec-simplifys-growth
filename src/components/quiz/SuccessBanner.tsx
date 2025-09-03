import { CheckCircle } from 'lucide-react';

interface SuccessBannerProps {
  isVisible: boolean;
}

export const SuccessBanner = ({ isVisible }: SuccessBannerProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg border border-primary/20">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Parfait ! Récap envoyé...</p>
            <p className="text-sm opacity-90">Continue pour tes résultats personnalisés</p>
          </div>
        </div>
      </div>
    </div>
  );
};