import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MultiStepBookingFormProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  availableDates: { value: string; label: string }[];
  timeSlots: string[];
  currentStep: number;
  totalSteps: number;
  handleNext: () => void;
  handlePrevious: () => void;
  canProceedToNext: boolean;
}

export const MultiStepBookingForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isSubmitting,
  availableDates,
  timeSlots,
  currentStep,
  totalSteps,
  handleNext,
  handlePrevious,
  canProceedToNext
}: MultiStepBookingFormProps) => {
  
  const renderStepIndicator = () => (
    <div className="mb-8">
      <Progress value={(currentStep / totalSteps) * 100} className="mb-4" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>
          Informations
        </span>
        <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>
          Horaire
        </span>
        <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>
          Confirmation
        </span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">📝 Vos informations</h2>
        <p className="text-muted-foreground">Dites-nous comment vous joindre</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-base font-medium">
            Nom complet <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Votre nom complet"
            required
            autoComplete="name"
            aria-describedby="name-error"
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
            className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="votre@email.com"
            required
            autoComplete="email"
            aria-describedby="email-error"
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
            className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
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
            className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Nom de votre entreprise"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">📅 Choisissez votre créneau</h2>
        <p className="text-muted-foreground">Sélectionnez la date et l'heure qui vous conviennent</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="date" className="text-base font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date souhaitée <span className="text-destructive">*</span>
          </Label>
          <Select onValueChange={(value) => handleInputChange('selectedDate', value)} required>
            <SelectTrigger className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:ring-2 focus:ring-primary/20">
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
          <Label htmlFor="time" className="text-base font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Heure préférée <span className="text-destructive">*</span>
          </Label>
          <Select onValueChange={(value) => handleInputChange('selectedTime', value)} required>
            <SelectTrigger className="mt-2 h-12 text-base btn-touch border-2 border-primary/30 focus:ring-2 focus:ring-primary/20">
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

      <div>
        <Label htmlFor="challenge" className="text-base font-medium">
          Décrivez brièvement votre principal défi (optionnel)
        </Label>
        <Textarea
          id="challenge"
          value={formData.challenge}
          onChange={(e) => handleInputChange('challenge', e.target.value)}
          className="mt-2 min-h-[100px] text-base btn-touch border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Ex: Je perds trop de temps à faire mes factures et suivre mes inventaires..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">✅ Confirmez votre rendez-vous</h2>
        <p className="text-muted-foreground">Vérifiez vos informations avant de confirmer</p>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Contact</h3>
            <p className="font-medium">{formData.name}</p>
            <p className="text-sm text-muted-foreground">{formData.email}</p>
            {formData.phone && <p className="text-sm text-muted-foreground">{formData.phone}</p>}
            {formData.company && <p className="text-sm text-muted-foreground">{formData.company}</p>}
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Rendez-vous</h3>
            <p className="font-medium">{formData.selectedDate ? new Date(formData.selectedDate).toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
            <p className="text-sm text-muted-foreground">{formData.selectedTime}</p>
            <p className="text-sm text-muted-foreground">30 minutes - Consultation gratuite</p>
          </div>
        </div>
        
        {formData.challenge && (
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Votre défi principal</h3>
            <p className="text-sm italic">{formData.challenge}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => e.preventDefault()}>
      {renderStepIndicator()}
      {renderCurrentStep()}
      
      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="btn-touch"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        
        {currentStep < totalSteps ? (
          <Button
            type="button"
            variant="cta"
            onClick={handleNext}
            disabled={!canProceedToNext}
            className="btn-touch"
          >
            Suivant
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="submit"
            variant="cta-large"
            disabled={isSubmitting || !canProceedToNext}
            className="btn-touch"
          >
            {isSubmitting ? "🔄 Confirmation..." : "📞 Confirmer mon rendez-vous"}
          </Button>
        )}
      </div>
    </form>
  );
};