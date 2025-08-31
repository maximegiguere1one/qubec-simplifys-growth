import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Phone, Mail, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackBooking, getLeadId, getABVariant, trackABConversion } from '@/lib/analytics';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedBookingFormProps {
  prefilledData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess?: () => void;
}

export const EnhancedBookingForm = ({ prefilledData, onSuccess }: EnhancedBookingFormProps) => {
  const [formData, setFormData] = useState({
    name: prefilledData?.name || '',
    email: prefilledData?.email || '',
    phone: prefilledData?.phone || '',
    company: '',
    challenge: '',
    selectedDate: '',
    selectedTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { mobileButtonClass, touchTargetClass } = useMobileOptimized();
  
  // A/B test for form layout
  const formVariant = getABVariant("booking_form", ["simple", "detailed"]);
  const timeslotVariant = getABVariant("booking_timeslots", ["dropdown", "grid"]);

  // Load existing lead data
  useEffect(() => {
    const loadLeadData = async () => {
      const leadId = getLeadId();
      if (!leadId) return;

      try {
        const { data } = await supabase
          .from('leads')
          .select('name, email, phone')
          .eq('id', leadId)
          .single();

        if (data) {
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error('Error loading lead data:', error);
      }
    };

    loadLeadData();
  }, []);

  // Generate available time slots
  useEffect(() => {
    const generateSlots = () => {
      const slots = [];
      const today = new Date();
      
      // Generate slots for next 14 days, excluding weekends
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        // Generate slots between 9 AM and 5 PM
        for (let hour = 9; hour < 17; hour++) {
          const time = new Date(date);
          time.setHours(hour, 0, 0, 0);
          
          slots.push(time.toISOString());
        }
      }
      
      setAvailableSlots(slots.slice(0, 20)); // Limit to 20 slots
    };

    generateSlots();
  }, []);

  const formatTimeSlot = (isoString: string) => {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('fr-CA', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr} à ${timeStr}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.selectedDate || !formData.selectedTime) {
      toast({
        title: "Créneau requis",
        description: "Veuillez sélectionner un créneau horaire.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Track A/B test conversion
      await trackABConversion("booking_form", formVariant, "submit");
      await trackABConversion("booking_timeslots", timeslotVariant, "submit");

      // Submit booking
      const result = await trackBooking({
        ...formData,
        selectedDate: formData.selectedDate.split('T')[0],
        selectedTime: new Date(formData.selectedTime).toLocaleTimeString('fr-CA', {
          hour: '2-digit',
          minute: '2-digit'
        }),
      });

      if (result) {
        toast({
          title: "Réservation confirmée !",
          description: "Vous recevrez un email de confirmation sous peu.",
        });
        onSuccess?.();
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Réservez votre consultation gratuite</h2>
        <p className="text-muted-foreground">
          30 minutes pour analyser vos besoins et vous proposer une solution personnalisée
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nom complet *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={touchTargetClass}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={touchTargetClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Téléphone *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={touchTargetClass}
              required
            />
          </div>

          {formVariant === "detailed" && (
            <div>
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className={touchTargetClass}
              />
            </div>
          )}
        </div>

        {formVariant === "detailed" && (
          <div>
            <Label htmlFor="challenge">Votre principal défi (optionnel)</Label>
            <Input
              id="challenge"
              value={formData.challenge}
              onChange={(e) => setFormData(prev => ({ ...prev, challenge: e.target.value }))}
              placeholder="Ex: Gestion d'inventaire, facturation..."
              className={touchTargetClass}
            />
          </div>
        )}

        <div>
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Choisir un créneau *
          </Label>
          
          {timeslotVariant === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {availableSlots.slice(0, 8).map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={formData.selectedTime === slot ? "default" : "outline"}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      selectedDate: slot.split('T')[0],
                      selectedTime: slot,
                    }));
                  }}
                  className={`${touchTargetClass} text-left justify-start h-auto py-3 px-4`}
                >
                  <div className="text-sm">
                    {formatTimeSlot(slot)}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <Select
              value={formData.selectedTime}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  selectedDate: value.split('T')[0],
                  selectedTime: value,
                }));
              }}
            >
              <SelectTrigger className={touchTargetClass}>
                <SelectValue placeholder="Sélectionner un créneau" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {formatTimeSlot(slot)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button
          type="submit"
          variant="cta-large"
          disabled={isSubmitting}
          className={`${mobileButtonClass} ${touchTargetClass}`}
        >
          {isSubmitting ? "Réservation en cours..." : "Confirmer ma réservation"}
        </Button>
      </form>
    </Card>
  );
};