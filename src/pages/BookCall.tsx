import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Shield, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackBooking, trackEvent, getABVariant } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ABTest } from "@/components/ABTest";
import { EnhancedBookingFlow } from "@/components/EnhancedBookingFlow";
import { EnhancedBookingForm } from "@/components/enhanced/EnhancedBookingForm";
import { OptimizedBookingForm } from "@/components/enhanced/OptimizedBookingForm";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";

const BookCall = () => {
  const { isMobile } = useMobileOptimized();
  const { toast } = useToast();
  
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
          <p className="text-sm text-muted-foreground">
            Dernière étape : réservez votre consultation personnalisée
          </p>
        </div>

        <OptimizedBookingForm 
          prefilledData={{
            name: quizResults?.contactInfo?.name,
            email: quizResults?.contactInfo?.email,
            phone: quizResults?.contactInfo?.phone,
          }}
          onSuccess={() => {
            // Track successful booking
            trackBooking({
              name: quizResults?.contactInfo?.name || '',
              email: quizResults?.contactInfo?.email || '',
              phone: quizResults?.contactInfo?.phone || '',
              selectedDate: '',
              selectedTime: ''
            });
            // Show success state instead of redirect
            toast({
              title: "✓ Consultation réservée !",
              description: "Vous recevrez un email de confirmation sous peu.",
            });
          }}
        />
      </div>
    </div>
  );
};

export default BookCall;