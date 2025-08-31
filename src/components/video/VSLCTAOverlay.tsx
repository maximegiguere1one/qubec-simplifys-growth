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
    <div className={`absolute inset-0 bg-black/80 flex items-center justify-center p-4 sm:p-6 ${className}`}>
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-md text-center shadow-elegant mx-2 sm:mx-0 max-w-full">
        <div className="mb-4 sm:mb-6">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-primary mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-bold mb-2">Prêt à automatiser votre business ?</h3>
          <p className="text-muted-foreground text-sm">
            Réservez votre diagnostic gratuit et découvrez comment économiser 15h par semaine
          </p>
        </div>
        
        <Button 
          onClick={onCTAClick}
          size="lg"
          className="w-full mb-3 sm:mb-4 btn-touch text-sm sm:text-base px-3 sm:px-4 max-w-full"
          variant="cta"
        >
          <span className="truncate">Réserver mon diagnostic gratuit</span>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 flex-shrink-0" />
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">30 minutes - 100% gratuit</span>
        </div>
      </div>
    </div>
  );
};