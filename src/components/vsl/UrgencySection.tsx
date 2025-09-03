import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { openCal, getCalDataAttributes } from "@/lib/cal";
interface UrgencySectionProps {
  onCTAClick?: () => void;
}
export const UrgencySection = ({
  onCTAClick
}: UrgencySectionProps) => {
  const handleCTAClick = () => {
    trackEvent('vsl_cta_click', {
      cta_location: 'final'
    });
    if (onCTAClick) {
      onCTAClick();
    } else {
      openCal('urgency_section');
    }
  };
  return <section className="py-20 bg-gradient-hero text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Chaque jour passé sans automatiser vous coûte du temps et de l'argent
        </h2>
        <p className="text-xl mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed">
          Pendant que vous hésitez, vos concurrents optimisent déjà leurs opérations. Pendant que vous perdez 15 heures par semaine sur de la paperasse, eux se concentrent sur la croissance. <strong>Il est temps de reprendre les rênes.</strong>
        </p>
        <div className="bg-white/10 border border-white/20 rounded-lg p-6 max-w-2xl mx-auto mb-8">
          <p className="text-lg font-semibold mb-2">🎯 Consultation 100% gratuite et sans engagement</p>
          <p className="text-base opacity-90">30 minutes qui peuvent changer la trajectoire de votre entreprise</p>
        </div>
        <Button variant="cta-large" size="xl" onClick={handleCTAClick} className="w-full max-w-[560px] mx-auto whitespace-normal break-words text-base sm:text-lg px-4 sm:px-8 py-4 hover:scale-100 sm:hover:scale-105 transition-all duration-300" {...getCalDataAttributes()}>
          Je réserve ma consultation MAINTENANT
        </Button>
        <p className="text-sm opacity-75 mt-6">⚠️ Places limitées - Ne laissez pas passer cette opportunité</p>
      </div>
    </section>;
};