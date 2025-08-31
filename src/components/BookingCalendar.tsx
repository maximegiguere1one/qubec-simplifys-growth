import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Phone } from "lucide-react";
import { SlotButton } from "@/components/booking/SlotButton";
import { TimeSlot } from "@/types/booking";
import { ANALYTICS_EVENTS, CTA_LOCATIONS } from "@/lib/constants/analytics";
import { trackEvent } from "@/lib/analytics";
import { NavigationService } from "@/lib/navigation";

export const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Prochains créneaux disponibles (simulation)
  const availableSlots: TimeSlot[] = [
    { date: "Aujourd'hui", time: "14:30", available: true },
    { date: "Demain", time: "10:00", available: true },
    { date: "Demain", time: "15:30", available: true },
    { date: "Vendredi", time: "09:00", available: true },
    { date: "Vendredi", time: "11:00", available: false },
    { date: "Lundi", time: "13:00", available: true },
  ];

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedDate(slot.date);
    setSelectedTime(slot.time);
  };

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      trackEvent(ANALYTICS_EVENTS.BOOKING.CALENDAR_CLICK, { 
        date: selectedDate, 
        time: selectedTime, 
        cta_location: CTA_LOCATIONS.CALENDAR 
      });
      // Redirection vers formulaire ou modal de booking
      NavigationService.goToBookCall();
    }
  };

  return (
    <Card className="p-4 sm:p-6 shadow-card max-w-md mx-auto">
      <div className="text-center mb-4 sm:mb-6">
        <Calendar className="w-10 h-10 text-primary mx-auto mb-3" />
        <h3 className="text-responsive-base font-bold mb-2">Réservez votre créneau</h3>
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-warning">
            ⚡ Seulement <strong>4 places restantes</strong> cette semaine
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4 sm:mb-6">
        {availableSlots.filter(slot => slot.available).slice(0, 6).map((slot, index) => (
          <SlotButton
            key={index}
            slot={slot}
            index={index}
            isSelected={selectedDate === slot.date && selectedTime === slot.time}
            onClick={() => handleSlotSelect(slot)}
          />
        ))}
      </div>

      <Button
        onClick={handleBooking}
        disabled={!selectedDate || !selectedTime}
        className="w-full mb-4 btn-touch"
        variant={selectedDate && selectedTime ? "cta" : "outline"}
      >
        {selectedDate && selectedTime 
          ? `Confirmer ${selectedDate} à ${selectedTime}` 
          : "Sélectionnez un créneau"
        }
      </Button>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>30 minutes - 100% gratuit</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3 h-3" />
          <span>Avec un expert québécois</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3" />
          <span>Par vidéoconférence ou téléphone</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          <span>Support local - Québec, Canada</span>
        </div>
      </div>
    </Card>
  );
};