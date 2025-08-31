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
  
  // Track page view
  usePageTracking();

  // Get quiz results for personalization
  const quizResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
  const leadId = localStorage.getItem('lead_id');
  
  // A/B test for booking flow
  const bookingVariant = getABVariant("booking_flow", ["enhanced", "simple"]);

  return (
    <div className="min-h-[100dvh] bg-gradient-background py-6 sm:py-8 md:py-12">
      <div className="container mx-auto container-mobile max-w-7xl">
        {bookingVariant === "simple" ? (
          <OptimizedBookingForm 
            prefilledData={{
              name: quizResults?.contactInfo?.name,
              email: quizResults?.contactInfo?.email,
              phone: quizResults?.contactInfo?.phone,
            }}
            onSuccess={() => {
              // Navigate to thank you page or show success message
              window.location.href = '/?success=booking';
            }}
          />
        ) : (
          <EnhancedBookingFlow 
            leadId={leadId}
            quizResults={quizResults}
          />
        )}
      </div>
    </div>
  );
};

export default BookCall;