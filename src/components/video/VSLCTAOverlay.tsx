import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { CTAOverlayProps } from '@/types/video';

export const VSLCTAOverlay = ({ 
  isVisible, 
  onCTAClick, 
  className = "" 
}: CTAOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 bg-black/80 flex items-center justify-center p-6 ${className}`}>
      <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-elegant">
        <div className="mb-6">
          <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Prêt à automatiser votre business ?</h3>
          <p className="text-muted-foreground">
            Réservez votre diagnostic gratuit et découvrez comment économiser 15h par semaine
          </p>
        </div>
        
        <Button 
          onClick={onCTAClick}
          size="lg"
          className="w-full mb-4"
          variant="cta"
        >
          Réserver mon diagnostic gratuit
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>30 minutes - 100% gratuit</span>
        </div>
      </div>
    </div>
  );
};