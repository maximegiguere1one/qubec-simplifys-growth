export const SolutionSection = () => {
  return (
    <section className="section-mobile bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto container-mobile max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="heading-responsive font-bold mb-8">
            Mais imaginez maintenant que...
          </h2>
          <p className="text-responsive-base leading-relaxed mb-8">
            🌅 <strong>Vous arrivez au bureau le matin</strong>, votre café à la main, et en quelques clics vous avez une vue complète sur vos ventes, votre inventaire et vos finances
          </p>
          <p className="text-responsive-base leading-relaxed mb-8">
            ⚡ <strong>Vos factures se génèrent automatiquement</strong> avec les bonnes taxes (TPS/TVQ), vos clients reçoivent leurs documents conformes sans que vous leviez le petit doigt
          </p>
          <p className="text-responsive-base leading-relaxed mb-8">
            🏠 <strong>À 17h, vous fermez votre ordinateur</strong> sereinement car vous savez que tout est à jour, synchronisé et conforme
          </p>
          <p className="text-responsive-base leading-relaxed mb-8">
            🎯 <strong>Vous dormez tranquille</strong> car vous savez qu'en cas d'audit fiscal, tout est parfaitement en ordre
          </p>
          <div className="bg-success/20 border border-success/50 rounded-lg p-6 mt-12">
            <p className="text-2xl font-bold text-success">
              ✅ C'est exactement ça, la liberté avec votre système sur mesure !
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};