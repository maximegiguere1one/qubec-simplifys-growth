import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
export const SocialProofSection = () => {
  const testimonials = [{
    name: "Marie Dubois",
    company: "Restaurant Le Québécois",
    text: "J'ai récupéré 12 heures par semaine grâce à l'automatisation. Plus de temps pour mes clients !",
    rating: 5
  }, {
    name: "Pierre Lavoie",
    company: "Garage Lavoie & Fils",
    text: "Fini les erreurs de facturation. Le système gère tout automatiquement.",
    rating: 5
  }, {
    name: "Sophie Martin",
    company: "Clinique Dentaire Moderne",
    text: "Les rendez-vous se gèrent tout seuls. Mes patients adorent la simplicité.",
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