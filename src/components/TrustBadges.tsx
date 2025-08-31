import { Shield, MapPin, Users, Award, CheckCircle2, Phone } from "lucide-react";
export const TrustBadges = () => {
  const badges = [{
    icon: MapPin,
    title: "100% Québécois",
    subtitle: "Entreprise locale"
  }, {
    icon: Shield,
    title: "Conformité TPS/TVQ",
    subtitle: "Normes québécoises"
  }, {
    icon: Users,
    title: "200+ PME",
    subtitle: "Nous font confiance"
  }, {
    icon: Award,
    title: "Note 9.4/10",
    subtitle: "Satisfaction client"
  }, {
    icon: CheckCircle2,
    title: "Support local",
    subtitle: "Équipe au Québec"
  }, {
    icon: Phone,
    title: "Support 9h-17h",
    subtitle: "Lundi au vendredi"
  }];
  return (
    <div className="py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <Icon className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-semibold text-sm mb-1">{badge.title}</h4>
              <p className="text-xs text-muted-foreground">{badge.subtitle}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};