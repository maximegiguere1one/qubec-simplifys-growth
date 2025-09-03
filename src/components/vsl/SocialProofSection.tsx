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
    name: "Stéphanie Tremblay",
    company: "il y a 9 mois",
    text: "Un énorme merci à l'équipe de ONE qui nous transforme en une version améliorée de nous-mêmes ! Leur programme de croissance est top, et mention spéciale à Max pour son professionnalisme et sa rigueur (et sa patience, avouons le 🙃). Si vous cherchez des pros qui vous font évoluer avec le sourire, c'est eux qu'il vous faut !",
    benefits: "Programme de croissance • Transformation",
    rating: 5
  }, {
    name: "Jessy Sioui",
    company: "Élite",
    text: "Mon système web, c'est exactement ce qu'il me fallait. J'ai reçu un service impeccable, ça m'a déjà rapporté de nouveaux clients et en plus, l'image de mon entreprise est beaucoup plus professionnelle.",
    benefits: "Image pro renforcée • Nouveaux clients",
    rating: 5
  }];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ce que disent nos clients Québécois</h2>
          <p className="text-muted-foreground text-lg">Devenez notre prochain témoignage à succès</p>
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