import { Card } from "@/components/ui/card";

export const ObjectionsSection = () => {
  return (
    <section className="section-mobile bg-background">
      <div className="container mx-auto container-mobile max-w-4xl">
        <h2 className="heading-responsive font-bold text-center mb-16">
          "Oui mais... j'ai des inquiétudes"
        </h2>
        <div className="space-y-8">
          <Card className="p-8 shadow-card">
            <h3 className="text-2xl font-bold mb-4 text-warning">
              💭 "Je ne suis pas doué avec les ordinateurs..."
            </h3>
            <p className="text-lg leading-relaxed">
              <strong>Rassurez-vous !</strong> Chaque système que nous créons est conçu pour être intuitif. 95% de nos clients apprennent à l'utiliser en moins d'une journée. Et si vous avez la moindre question, notre équipe québécoise est là pour vous guider pas à pas.
            </p>
          </Card>
          
          <Card className="p-8 shadow-card">
            <h3 className="text-2xl font-bold mb-4 text-warning">
              💰 "Ça va sûrement me coûter cher..."
            </h3>
            <p className="text-lg leading-relaxed">
              <strong>Au contraire !</strong> Un système sur mesure coûte moins cher que vous pensez. Si on vous dit que chaque mois vous économiserez au moins 500$ en temps et erreurs évitées, et que l'investissement se paie en 6 mois maximum... c'est rentable, non ?
            </p>
          </Card>
          
          <Card className="p-8 shadow-card">
            <h3 className="text-2xl font-bold mb-4 text-warning">
              🔒 "Je vais perdre le contrôle sur mes données..."
            </h3>
            <p className="text-lg leading-relaxed">
              <strong>Tout le contraire !</strong> Avec votre système sur mesure, vous GARDEZ le contrôle total. Toutes vos infos vitales au bout des doigts, hébergé où vous voulez, avec vos règles de sécurité. Plus jamais de "le logiciel ne fait pas ce que je veux".
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};