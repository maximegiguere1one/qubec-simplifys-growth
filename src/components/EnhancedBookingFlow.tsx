import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Star, Phone, MapPin, Briefcase, Target } from 'lucide-react';
import { calculateLeadScore, LeadScore } from '@/lib/leadScoring';
import { trackBooking } from '@/lib/analytics';
import { OneSystemeTracking } from '@/lib/pixelTracking';
import { useToast } from '@/hooks/use-toast';

interface EnhancedBookingFlowProps {
  leadId?: string;
  quizResults?: any;
  prefilledData?: {
    name?: string;
    email?: string;
    company?: string;
  };
}

export const EnhancedBookingFlow = ({ leadId, quizResults, prefilledData }: EnhancedBookingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [leadScore, setLeadScore] = useState<LeadScore | null>(null);
  const [formData, setFormData] = useState({
    name: prefilledData?.name || '',
    email: prefilledData?.email || '',
    phone: '',
    company: prefilledData?.company || '',
    position: '',
    challenge: '',
    urgency: '',
    budget: '',
    selectedDate: '',
    selectedTime: '',
    preferredContact: 'phone',
    timezone: 'America/Toronto'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Available time slots (would be dynamic in production)
  const availableSlots = [
    { date: '2024-09-02', times: ['09:00', '10:30', '14:00', '15:30'] },
    { date: '2024-09-03', times: ['09:00', '11:00', '13:00', '16:00'] },
    { date: '2024-09-04', times: ['10:00', '14:30', '16:00'] },
    { date: '2024-09-05', times: ['09:30', '11:30', '15:00'] },
    { date: '2024-09-06', times: ['09:00', '10:00', '14:00', '15:30'] }
  ];

  useEffect(() => {
    if (quizResults) {
      const score = calculateLeadScore(quizResults);
      setLeadScore(score);
    }
  }, [quizResults]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPersonalizedMessage = () => {
    if (!leadScore) return null;

    const messages = {
      qualified: {
        title: "🎯 Priorité Maximum - Consultation Immédiate",
        description: "Votre profil indique un potentiel de transformation majeur. Nos experts senior vous contactent dans l'heure.",
        benefits: ["Analyse personnalisée approfondie", "ROI projeté sur 12 mois", "Plan d'implémentation express"],
        urgency: "Créneaux limités cette semaine"
      },
      hot: {
        title: "🔥 Consultation Stratégique Recommandée", 
        description: "Votre situation présente d'excellentes opportunités d'optimisation.",
        benefits: ["Audit de vos processus actuels", "Roadmap de transformation", "Estimation des gains"],
        urgency: "Réservation rapide conseillée"
      },
      warm: {
        title: "📈 Consultation Découverte",
        description: "Explorons ensemble les possibilités pour votre entreprise.",
        benefits: ["Évaluation de vos besoins", "Solutions adaptées", "Prochaines étapes claires"],
        urgency: "Plusieurs créneaux disponibles"
      },
      cold: {
        title: "💡 Consultation Éducative",
        description: "Découvrez comment l'automatisation peut transformer votre business.",
        benefits: ["Introduction aux possibilités", "Questions-réponses", "Ressources personnalisées"],
        urgency: "Aucune pression, discussion ouverte"
      }
    };

    return messages[leadScore.segment];
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
            ${currentStep >= step 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'}
          `}>
            {step}
          </div>
          {step < 3 && (
            <div className={`
              w-16 h-0.5 mx-2
              ${currentStep > step ? 'bg-primary' : 'bg-muted'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => {
    const message = getPersonalizedMessage();
    
    return (
      <div className="space-y-6">
        {message && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">{message.title}</CardTitle>
              <CardDescription>{message.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm font-medium">Cette consultation vous permettra de :</div>
                <ul className="space-y-1">
                  {message.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-primary mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                {leadScore && (
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-muted-foreground">Votre score de qualification :</span>
                    <Badge variant={
                      leadScore.segment === 'qualified' ? 'default' :
                      leadScore.segment === 'hot' ? 'destructive' : 'secondary'
                    }>
                      {leadScore.score}/100 - {leadScore.segment}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informations de Contact</CardTitle>
            <CardDescription>Nous personnaliserons la consultation selon votre profil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email professionnel *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="vous@entreprise.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(514) 123-4567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Entreprise *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Nom de votre entreprise"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="position">Votre rôle</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Président, Directeur, Gestionnaire..."
              />
            </div>

            <div>
              <Label htmlFor="challenge">Principal défi à résoudre</Label>
              <Textarea
                id="challenge"
                value={formData.challenge}
                onChange={(e) => handleInputChange('challenge', e.target.value)}
                placeholder="Décrivez brièvement votre principal défi opérationnel..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Choisir Date & Heure
        </CardTitle>
        <CardDescription>Consultations de 30 minutes par vidéoconférence</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {availableSlots.map((slot) => (
            <div key={slot.date} className="space-y-2">
              <div className="font-medium">
                {new Date(slot.date).toLocaleDateString('fr-CA', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {slot.times.map((time) => (
                  <Button
                    key={time}
                    variant={
                      formData.selectedDate === slot.date && formData.selectedTime === time 
                        ? "default" 
                        : "outline"
                    }
                    className="justify-start"
                    onClick={() => {
                      handleInputChange('selectedDate', slot.date);
                      handleInputChange('selectedTime', time);
                    }}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {formData.selectedDate && formData.selectedTime && (
          <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center text-success font-medium">
              <Calendar className="h-4 w-4 mr-2" />
              Créneau sélectionné
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {new Date(formData.selectedDate).toLocaleDateString('fr-CA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} à {formData.selectedTime}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Confirmation de votre Consultation</CardTitle>
        <CardDescription>Vérifiez les détails avant de confirmer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">{formData.email}</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              <span className="font-medium">{formData.company}</span>
            </div>
            <div className="text-sm text-muted-foreground">{formData.position}</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium">
                {new Date(formData.selectedDate).toLocaleDateString('fr-CA', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{formData.selectedTime}</div>
          </div>
        </div>

        {formData.challenge && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-start">
              <Target className="h-4 w-4 mr-2 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Défi principal :</div>
                <div className="text-sm text-muted-foreground mt-1">{formData.challenge}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="font-medium text-primary">Ce que vous recevrez :</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Invitation Zoom envoyée par email</li>
            <li>• Rappel 24h avant le rendez-vous</li>
            <li>• Questionnaire préparatoire personnalisé</li>
            <li>• Ressources selon votre profil</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.selectedDate || !formData.selectedTime) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Track booking in our system
      const bookingData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        challenge: formData.challenge,
        selectedDate: formData.selectedDate,
        selectedTime: formData.selectedTime
      };

      await trackBooking(bookingData);

      // Track pixel events
      if (leadId) {
        OneSystemeTracking.trackBookingConversion(leadId, leadScore?.score || 0 > 70 ? 5000 : 2500);
      }

      toast({
        title: "Consultation confirmée !",
        description: "Vous recevrez un email de confirmation sous peu.",
      });

      // Reset form or redirect
      setCurrentStep(1);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        challenge: '',
        urgency: '',
        budget: '',
        selectedDate: '',
        selectedTime: '',
        preferredContact: 'phone',
        timezone: 'America/Toronto'
      });

    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = () => {
    return formData.name && formData.email && formData.phone && formData.company;
  };

  const canProceedToStep3 = () => {
    return formData.selectedDate && formData.selectedTime;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderStepIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Précédent
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={
              (currentStep === 1 && !canProceedToStep2()) ||
              (currentStep === 2 && !canProceedToStep3())
            }
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-cta hover:bg-cta-hover"
          >
            {isSubmitting ? 'Confirmation...' : 'Confirmer la Consultation'}
          </Button>
        )}
      </div>
    </div>
  );
};