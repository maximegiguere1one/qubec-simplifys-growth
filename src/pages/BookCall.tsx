import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Shield, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackBooking, trackEvent } from "@/lib/analytics";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ABTest } from "@/components/ABTest";
import { EnhancedBookingFlow } from "@/components/EnhancedBookingFlow";

const BookCall = () => {
  // Track page view
  usePageTracking();

  // Get quiz results for personalization
  const quizResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
  const leadId = localStorage.getItem('lead_id');

  return (
    <div className="min-h-[100dvh] bg-gradient-background py-6 sm:py-8 md:py-12">
      <div className="container mx-auto container-mobile max-w-7xl">
        <EnhancedBookingFlow 
          leadId={leadId}
          quizResults={quizResults}
        />
      </div>
    </div>
  );
};

export default BookCall;