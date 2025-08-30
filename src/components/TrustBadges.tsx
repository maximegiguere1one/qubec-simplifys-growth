import { Shield, MapPin, Users, Award, CheckCircle2, Phone } from "lucide-react";

export const TrustBadges = () => {
  const badges = [
    {
      icon: MapPin,
      title: "100% Québécois",
      subtitle: "Entreprise locale"
    },
    {
      icon: Shield,
      title: "Conformité TPS/TVQ",
      subtitle: "Normes québécoises"
    },
    {
      icon: Users,
      title: "200+ PME",
      subtitle: "Nous font confiance"
    },
    {
      icon: Award,
      title: "Note 9.4/10",
      subtitle: "Satisfaction client"
    },
    {
      icon: CheckCircle2,
      title: "Support local",
      subtitle: "Équipe au Québec"
    },
    {
      icon: Phone,
      title: "Support 9h-17h",
      subtitle: "Lundi au vendredi"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-6">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-4 bg-white/50 border border-primary/20 rounded-lg hover:bg-white/70 transition-colors"
        >
          <badge.icon className="w-6 h-6 text-primary mb-2" />
          <div className="text-xs">
            <p className="font-semibold text-foreground">{badge.title}</p>
            <p className="text-muted-foreground">{badge.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};