import { Card } from "@/components/ui/card";

export const SocialProofSection = () => {
  return (
    <section className="section-mobile bg-secondary/20">
      <div className="container mx-auto container-mobile">
        {/* Logos section */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground mb-6">Utilisé par des entreprises québécoises comme :</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            <div className="bg-muted/50 rounded-lg p-4 w-full h-16 flex items-center justify-center">
              <span className="font-bold text-foreground">Restaurant Le Patio</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 w-full h-16 flex items-center justify-center">
              <span className="font-bold text-foreground">Garage Pro-Mécanique</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 w-full h-16 flex items-center justify-center">
              <span className="font-bold text-foreground">Clinique Santé Plus</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 w-full h-16 flex items-center justify-center">
              <span className="font-bold text-foreground">Services Comptables JL</span>
            </div>
          </div>
        </div>
        
        <h2 className="heading-responsive font-bold text-center mb-4">
          Plus de 200 PME québécoises nous font déjà confiance
        </h2>
        <p className="text-center text-muted-foreground mb-16">Voici leurs résultats concrets après seulement quelques semaines</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 shadow-card border-l-4 border-success">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="w-5 h-5 bg-warning rounded-full"></div>
                ))}
              </div>
              <p className="text-lg italic mb-4">"Martin, propriétaire d'une boutique à Québec, économisait déjà 10 heures par semaine après 15 jours avec One Système. Ses ventes ont augmenté de 15% car il peut enfin se concentrer sur ses clients plutôt que sur sa paperasse."</p>
            </div>
            <div className="border-t pt-6">
              <p className="font-bold text-lg">Martin Dubois</p>
              <p className="text-muted-foreground">Boutique Sport Plus, Québec</p>
              <div className="mt-3 inline-block bg-success/20 text-success px-4 py-2 rounded-full font-semibold">
                10h économisées/semaine + 15% de ventes
              </div>
            </div>
          </Card>
          
          <Card className="p-8 shadow-card border-l-4 border-primary">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="w-5 h-5 bg-warning rounded-full"></div>
                ))}
              </div>
              <p className="text-lg italic mb-4">"Julie, comptable à Sherbrooke, nous a dit : 'Je dormais mal avant chaque période de déclarations. Maintenant, avec One Système, tout est automatique et conforme. Je peux enfin profiter de mes weekends !'"</p>
            </div>
            <div className="border-t pt-6">
              <p className="font-bold text-lg">Julie Lavoie</p>
              <p className="text-muted-foreground">Services Comptables JL, Sherbrooke</p>
              <div className="mt-3 inline-block bg-primary/20 text-primary px-4 py-2 rounded-full font-semibold">
                Stress fiscal éliminé + weekends libres
              </div>
            </div>
          </Card>
        </div>
        
        <div className="text-center mt-12">
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-primary/20 border border-primary/30 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary mb-1">15h</p>
              <p className="text-sm text-muted-foreground">économisées par semaine en moyenne</p>
            </div>
            <div className="bg-gradient-primary/20 border border-primary/30 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary mb-1">9.4/10</p>
              <p className="text-sm text-muted-foreground">note de satisfaction client</p>
            </div>
            <div className="bg-gradient-primary/20 border border-primary/30 rounded-lg p-4">
              <p className="text-2xl font-bold text-primary mb-1">200+</p>
              <p className="text-sm text-muted-foreground">PME québécoises satisfaites</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};