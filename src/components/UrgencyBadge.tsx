import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Users } from "lucide-react";

interface UrgencyBadgeProps {
  type: "calendar" | "spots" | "time" | "custom";
  message?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
  className?: string;
}

export const UrgencyBadge = ({ 
  type, 
  message, 
  variant = "destructive", 
  className = "" 
}: UrgencyBadgeProps) => {
  const getIcon = () => {
    switch (type) {
      case "calendar":
        return <Calendar className="w-4 h-4 mr-2" />;
      case "spots":
        return <Users className="w-4 h-4 mr-2" />;
      case "time":
        return <AlertTriangle className="w-4 h-4 mr-2" />;
      default:
        return <AlertTriangle className="w-4 h-4 mr-2" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case "calendar":
        return "⚠️ Calendrier limité – 4 créneaux dispo cette semaine";
      case "spots":
        return "⚠️ Places limitées cette semaine : 3 appels disponibles";
      case "time":
        return "⚠️ Offre limitée dans le temps";
      default:
        return message || "⚠️ Places limitées";
    }
  };

  return (
    <Badge 
      variant={variant} 
      className={`inline-flex items-center font-medium px-3 py-1 animate-pulse-gentle ${className}`}
    >
      {getIcon()}
      {message || getDefaultMessage()}
    </Badge>
  );
};