import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent, getABVariant, confirmBooking } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ConversionOptimizer } from "@/components/enhanced/ConversionOptimizer";
import { EnhancedBookingFlow } from "@/components/EnhancedBookingFlow";
import { OptimizedBookingForm } from "@/components/enhanced/OptimizedBookingForm";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";

const BookCall = () => {
  const { isMobile } = useMobileOptimized();
  const { toast } = useToast();
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  // Track page view
  usePageTracking();

  // Get quiz results for personalization
  const quizResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
  const leadId = localStorage.getItem('lead_id');
  
  // A/B test for booking flow
  const bookingVariant = getABVariant("booking_flow", ["enhanced", "simple"]);

  return (
    <div className="min-h-[100dvh] bg-gradient-background py-8 sm:py-12 md:py-16">
      <div className="container mx-auto container-mobile max-w-4xl">
        {/* Progress indicator */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-muted-foreground">Analyse</span>
              <div className="w-8 h-1 bg-success rounded"></div>
              <div className="w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-muted-foreground">Vidéo</span>
              <div className="w-8 h-1 bg-success rounded"></div>
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="font-medium">Réservation</span>
            </div>
          </div>
          
          {/* Validation title and benefits */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              🎉 Félicitations – vous êtes éligible à votre appel stratégique personnalisé (gratuit)
            </h1>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 max-w-3xl mx-auto mb-6">
              <h3 className="text-lg font-bold mb-4">📞 Cet appel vous permettra de :</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-left">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Identifier vos gaspillages de temps cachés</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Voir comment automatiser votre entreprise</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Découvrir nos systèmes sur mesure québécois</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Obtenir un plan d'action personnalisé</span>
                </div>
              </div>
            </div>
            
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 max-w-2xl mx-auto mb-4">
              <p className="font-medium text-warning">
                ⚠️ Places limitées cette semaine : 3 appels disponibles
              </p>
            </div>
            
            {/* Social proof */}
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">💬 "Excellent service, vraiment à l'écoute de nos besoins" - Marie T., Entreprise locale</p>
              <p>"En 30 minutes, j'ai eu plus de clarté qu'en 6 mois de recherche" - Pierre L., PME Montréal</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Dernière étape : réservez votre consultation personnalisée
          </p>
        </div>

        <ConversionOptimizer page="booking">
          {bookingConfirmed ? (
            // Thank you state
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">🎉 Consultation confirmée !</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Merci ! Vous recevrez un courriel de confirmation sous peu avec tous les détails.
              </p>
              <div className="bg-muted/50 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-sm">
                  <strong>Prochaines étapes :</strong><br />
                  1. Vous recevrez un email de confirmation<br />
                  2. Nous vous enverrons un questionnaire préparatoire<br />
                  3. Rendez-vous à l'heure convenue !
                </p>
              </div>
            </div>
          ) : (
            // Conditional A/B test rendering
            bookingVariant === "enhanced" ? (
              <EnhancedBookingFlow
                leadId={leadId}
                quizResults={quizResults}
                prefilledData={{
                  name: quizResults?.contactInfo?.name,
                  email: quizResults?.contactInfo?.email,
                  phone: quizResults?.contactInfo?.phone,
                }}
                onSuccess={(id: string) => {
                  setBookingId(id);
                  setBookingConfirmed(true);
                  if (id) confirmBooking(id);
                }}
              />
            ) : (
              <OptimizedBookingForm 
                prefilledData={{
                  name: quizResults?.contactInfo?.name,
                  email: quizResults?.contactInfo?.email,
                  phone: quizResults?.contactInfo?.phone,
                }}
                onSuccess={(id?: string) => {
                  setBookingId(id || null);
                  setBookingConfirmed(true);
                  if (id) confirmBooking(id);
                }}
              />
            )
          )}
        </ConversionOptimizer>
      </div>
    </div>
  );
};

export default BookCall;