export const ProblemAmplificationSection = () => {
  return (
    <section className="section-mobile bg-destructive/10">
      <div className="container mx-auto container-mobile max-w-4xl text-center">
        <h2 className="heading-responsive font-bold mb-8 text-destructive">
          Si rien ne change, voici ce qui vous attend...
        </h2>
        <div className="space-y-6 text-lg">
          <p className="leading-relaxed">
            • Vous continuerez à <strong>travailler tard le soir</strong> pendant que votre famille vous attend
          </p>
          <p className="leading-relaxed">
            • Vous <strong>perdrez des ventes</strong> à cause d'erreurs administratives évitables  
          </p>
          <p className="leading-relaxed">
            • Vos <strong>concurrents prendront de l'avance</strong> pendant que vous restez coincé dans la paperasse
          </p>
          <p className="leading-relaxed">
            • Le <strong>risque de burn-out</strong> augmentera chaque mois qui passe
          </p>
          <p className="text-responsive-base font-bold mt-8 text-destructive">
            🚨 Il est URGENT d'agir maintenant !
          </p>
        </div>
      </div>
    </section>
  );
};