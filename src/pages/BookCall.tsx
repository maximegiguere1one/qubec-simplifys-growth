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

const BookCall = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    challenge: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Track page view
  usePageTracking();

  const availableDates = [
    "2024-09-02",
    "2024-09-03", 
    "2024-09-04",
    "2024-09-05",
    "2024-09-06",
    "2024-09-09",
    "2024-09-10"
  ];

  const availableTimes = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Track booking in Supabase
    const booking = await trackBooking({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      challenge: formData.challenge,
      selectedDate,
      selectedTime,
    });
    
    if (booking) {
      toast({
        title: "Rendez-vous confirmé ! 🎉",
        description: `Nous vous contacterons le ${formatDate(selectedDate)} à ${selectedTime}.`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  const benefits = [
    {
      icon: Clock,
      title: "Consultation de 30 minutes",
      description: "Analyse complète de vos besoins actuels"
    },
    {
      icon: Shield,
      title: "100% gratuit et sans engagement",
      description: "Aucune obligation d'achat ou de contrat"
    },
    {
      icon: CheckCircle2,
      title: "Plan d'action personnalisé",
      description: "Stratégie sur mesure pour votre entreprise"
    }
  ];

  const testimonials = [
    {
      name: "Caroline Lapointe",
      company: "Clinique Dentaire Lapointe",
      text: "La consultation gratuite m'a fait réaliser tout le potentiel d'optimisation de ma clinique. En 2 mois, nous avons doublé notre efficacité.",
    },
    {
      name: "François Dion", 
      company: "Électricité Dion & Fils",
      text: "L'équipe de One Système a rapidement identifié nos points faibles. Aujourd'hui, nous économisons 12 heures par semaine !",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Réservez votre consultation{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              gratuite
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            En 30 minutes, découvrez comment One Système peut vous faire gagner du temps, économiser de l'argent et simplifier votre gestion
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-card">
              <h2 className="text-3xl font-bold mb-8">Choisissez votre créneau</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-lg font-semibold mb-3">
                    <Calendar className="inline w-5 h-5 mr-2" />
                    Sélectionnez une date
                  </label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Choisissez une date disponible" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map((date) => (
                        <SelectItem key={date} value={date}>
                          {formatDate(date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-lg font-semibold mb-3">
                    <Clock className="inline w-5 h-5 mr-2" />
                    Sélectionnez l'heure
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "cta" : "outline"}
                        onClick={() => setSelectedTime(time)}
                        className="h-12"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Vos coordonnées</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="Nom complet *"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-12"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Adresse courriel *"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="h-12"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="tel"
                        placeholder="Numéro de téléphone *"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="h-12"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Nom de votre entreprise"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="h-12"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="Décrivez brièvement votre principal défi (optionnel)"
                      value={formData.challenge}
                      onChange={(e) => setFormData({...formData, challenge: e.target.value})}
                      rows={4}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="cta-large"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Confirmation en cours..." : "Confirmer mon rendez-vous gratuit"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>✓ Aucun engagement requis • ✓ Consultation 100% gratuite • ✓ Annulation possible 24h avant</p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Benefits */}
            <Card className="p-6 shadow-card">
              <h3 className="text-2xl font-bold mb-6">Ce que vous obtenez</h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <benefit.icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6 shadow-card">
              <h3 className="text-xl font-bold mb-4">Nous contacter</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>1-800-ONE-SYST</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>contact@onesysteme.ca</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Montréal, Québec</span>
                </div>
              </div>
            </Card>

            {/* Testimonials */}
            <Card className="p-6 shadow-card">
              <h3 className="text-xl font-bold mb-4">Témoignages clients</h3>
              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <p className="text-sm italic mb-2">"{testimonial.text}"</p>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCall;