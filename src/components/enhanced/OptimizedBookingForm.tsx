import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackBooking, trackEvent, getABVariant, trackABConversion } from "@/lib/analytics";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";
import { MultiStepBookingForm } from "./MultiStepBookingForm";
import { GuaranteeBlock } from "@/components/GuaranteeBlock";

interface OptimizedBookingFormProps {
  prefilledData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess?: (bookingId?: string) => void;
}

export const OptimizedBookingForm = ({ prefilledData, onSuccess }: OptimizedBookingFormProps) => {
  const [formData, setFormData] = useState({
    name: prefilledData?.name || "",
    email: prefilledData?.email || "",
    phone: prefilledData?.phone || "",
    company: "",
    challenge: "",
    selectedDate: "",
    selectedTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Toronto"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { isMobile, mobileButtonClass, animationClass } = useMobileOptimized();
  
  // A/B test for form layout
  const formVariant = getABVariant("booking_form_layout", ["single_step", "multi_step"]);
  const totalSteps = formVariant === "multi_step" ? 3 : 1;

  // Available time slots
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"
  ];

  // Generate next 14 days (excluding weekends)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1); // Start from tomorrow
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) return null;
    
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('fr-CA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  }).filter(Boolean) as { value: string; label: string }[];

  useEffect(() => {
    // Track A/B test exposure
    trackABConversion("booking_form_layout", formVariant, "view");
    
    // Track form start
    trackEvent('bookcall_view', { 
      form_variant: formVariant,
      prefilled: !!prefilledData?.email 
    });
  }, [formVariant, prefilledData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track form interaction
    trackEvent('bookcall_submit', { 
      action: 'field_interaction', 
      field, 
      step: currentStep 
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      trackEvent('bookcall_submit', { action: 'step_advance', step: currentStep + 1 });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.selectedDate || !formData.selectedTime) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const booking = await trackBooking(formData);
      
      if (booking) {
        toast({
          title: "🎉 Rendez-vous confirmé !",
          description: `Merci ${formData.name.split(' ')[0]} ! Vous recevrez un courriel de confirmation sous peu.`,
        });
        
        onSuccess?.();
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer ou nous appeler au (514) 555-AIDE.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSingleStepForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-base font-medium">
            Nom complet <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:border-primary"
            placeholder="Votre nom complet"
            required
            autoComplete="name"
          />
        </div>
        
        <div>
          <Label htmlFor="email" className="text-base font-medium">
            Adresse courriel <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:border-primary"
            placeholder="votre@email.com"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="text-base font-medium">
            Téléphone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:border-primary"
            placeholder="(514) 555-1234"
            autoComplete="tel"
          />
        </div>
        
        <div>
          <Label htmlFor="company" className="text-base font-medium">
            Nom de votre entreprise
          </Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:border-primary"
            placeholder="Nom de votre entreprise"
          />
        </div>
      </div>

      {/* Date and Time Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="text-base font-medium">
            Date souhaitée <span className="text-destructive">*</span>
          </Label>
          <Select onValueChange={(value) => handleInputChange('selectedDate', value)} required>
            <SelectTrigger className="mt-2 h-12 text-base btn-touch border-2 border-primary/30">
              <SelectValue placeholder="Choisir une date" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((date) => (
                <SelectItem key={date.value} value={date.value}>
                  {date.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="time" className="text-base font-medium">
            Heure préférée <span className="text-destructive">*</span>
          </Label>
          <Select onValueChange={(value) => handleInputChange('selectedTime', value)} required>
            <SelectTrigger className="mt-2 h-12 text-base btn-touch border-2 border-primary/30">
              <SelectValue placeholder="Choisir une heure" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Challenge Description */}
      <div>
        <Label htmlFor="challenge" className="text-base font-medium">
          Décrivez brièvement votre principal défi (optionnel)
        </Label>
        <Textarea
          id="challenge"
          value={formData.challenge}
          onChange={(e) => handleInputChange('challenge', e.target.value)}
          className="mt-2 min-h-[100px] text-base btn-touch border-2 border-primary/30 focus:border-primary"
          placeholder="Ex: Je perds trop de temps à faire mes factures et suivre mes inventaires..."
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="cta-large"
          disabled={isSubmitting}
          className={`w-full h-14 sm:h-16 ${mobileButtonClass} btn-touch text-base sm:text-lg font-semibold ${animationClass} shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          {isSubmitting ? "🔄 Confirmation en cours..." : "📞 Confirmer mon rendez-vous gratuit"}
        </Button>
      </div>
    </form>
  );

  const canProceedToNext = (): boolean => {
    if (currentStep === 1) return !!(formData.name && formData.email);
    if (currentStep === 2) return !!(formData.selectedDate && formData.selectedTime);
    if (currentStep === 3) return true;
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-foreground">
          📅 Réservez votre consultation gratuite
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          <strong className="text-foreground">30 minutes</strong> pour analyser vos besoins et vous proposer une solution sur mesure. 
          <span className="text-primary"> 100% gratuit, aucun engagement.</span>
        </p>
        
        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Réponse garantie sous 24h</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Équipe locale québécoise</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>200+ PME nous font confiance</span>
          </div>
        </div>
      </div>

      {/* Guarantee Block - Au-dessus du calendrier */}
      <GuaranteeBlock 
        location="bookcall_pre_calendar"
        variant="booking_guarantee"
        destination="#booking-form"
        onCTAClick={() => {
          const formElement = document.getElementById('booking-form');
          formElement?.scrollIntoView({ behavior: 'smooth' });
        }}
        ctaText="📞 Réserver mon appel"
        showCTA={false}
      />

      {/* Form Card */}
      <Card id="booking-form" className="p-6 sm:p-8 md:p-10 shadow-card border-2 border-primary/20">
        {formVariant === "multi_step" ? (
          <MultiStepBookingForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            availableDates={availableDates}
            timeSlots={timeSlots}
            currentStep={currentStep}
            totalSteps={totalSteps}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            canProceedToNext={canProceedToNext()}
          />
        ) : (
          renderSingleStepForm()
        )}
        
        {/* Contact & Privacy */}
        <div className="mt-8 space-y-4" role="region" aria-label="Contact et confidentialité">
          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Besoin d'aide immédiate ?</strong><br />
              📞 <a href="tel:+15145551234" className="text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">(514) 555-1234</a> (lun-ven 9h-17h)
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg" aria-live="polite">
            <p className="text-sm text-muted-foreground text-center">
              🔒 <strong>Vos données sont sécurisées</strong> et ne seront jamais vendues. 
              Consultez notre <a href="#" className="text-primary underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};