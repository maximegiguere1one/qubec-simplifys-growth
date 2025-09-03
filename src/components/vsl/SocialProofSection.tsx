import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
export const SocialProofSection = () => {
  const testimonials = [{
    name: "Karl Thivierge",
    company: "Climat Distinction",
    text: "Le système de gestion d'inventaire pour nos thermopompes a complètement transformé nos opérations en back-end. On gagne un temps fou, c'est structuré, puis ça nous permet de mieux servir nos clients. Je recommande ONE. Système.",
    benefits: "Inventaire optimisé • Gain de temps",
    rating: 5
  }, {
    name: "Philippe Jacob",
    company: "Pro Remorque",
    text: "Honnêtement, j'aurais dû faire ça il y a 5 ans. Avec le site transactionnel de ONE. Système, la location de nos remorques est rendue simple et rapide, autant pour nous que pour nos clients.",
    benefits: "Transactionnel rapide • Location simplifiée",
    rating: 5
  }, {
    name: "Jessy Sioui",
    company: "Élite",
    text: "Mon site web, c'est exactement ce qu'il me fallait. J'ai reçu un service impeccable, ça m'a déjà rapporté de nouveaux clients et en plus, l'image de mon entreprise est beaucoup plus professionnelle.",
    benefits: "Image pro renforcée • Nouveaux clients",
    rating: 5
  }];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ce que disent nos clients québécois</h2>
          <p className="text-muted-foreground text-lg">Plus de 500 entreprises nous font confiance</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-primary">{testimonial.benefits}</p>
              </div>
              
              <div className="border-t pt-4">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.company}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};