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
          
          {/* 1. Titre fort (qualification + exclusivité) */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              🎯 Félicitations – vous vous qualifiez pour un appel stratégique prioritaire 🚀
            </h1>
            
            {/* 2. Rappel de la garantie */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-3xl mx-auto mb-6">
              <p className="text-sm md:text-base text-green-700 font-medium text-center">
                🔒 Durant cet appel, on vous montre comment gagner au moins 10h/mois… et si ce n'est pas le cas, on vous rembourse + on vous vire <span className="font-bold text-red-600">1 000 $ cash</span>.
              </p>
            </div>
          </div>

          {/* 3. Bénéfices de l'appel */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 max-w-4xl mx-auto mb-8">
            <h3 className="text-lg font-bold mb-6 text-center">📞 Ce qu'on va faire ensemble dans cet appel :</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">📊</span>
                <span><strong>Identifier vos gaspillages de temps</strong> (10 à 25h/mois)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">🛠️</span>
                <span><strong>Vous montrer un système</strong> qui les élimine automatiquement</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">💰</span>
                <span><strong>Calculer vos économies réelles</strong> et mesurables</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">🎯</span>
                <span><strong>Vérifier si vous êtes admissible</strong> à notre programme garanti</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            Choisissez votre créneau pour cet appel stratégique personnalisé :
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

        {/* 5. Bloc d'urgence / rareté sous le calendrier */}
        {!bookingConfirmed && (
          <div className="mt-8 text-center">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-2xl mx-auto mb-6">
              <p className="text-sm md:text-base font-medium text-orange-700">
                ⚠️ Les appels stratégiques sont limités à <strong>5 nouveaux entrepreneurs par mois</strong>. Réservez vite votre créneau.
              </p>
            </div>

            {/* 6. Social proof / confiance */}
            <div className="bg-muted/30 border border-border/50 rounded-lg p-6 max-w-3xl mx-auto">
              <div className="grid sm:grid-cols-3 gap-4 text-center text-sm">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span><strong>Déjà utilisé par +247 PME québécoises</strong></span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span><strong>Solution 100 % locale, en français</strong></span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span><strong>Taux de satisfaction : 100 %</strong><br /><span className="text-muted-foreground">(0 client remboursé à ce jour)</span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCall;