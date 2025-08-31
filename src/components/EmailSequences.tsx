import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle,
  ArrowRight,
  Calendar,
  Star
} from "lucide-react";
import { emailSequences, type EmailSequence } from "@/lib/emailSequences";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";

interface EmailSequencesProps {
  leadSegment?: 'qualified' | 'hot' | 'warm' | 'cold';
  leadName?: string;
  className?: string;
}

export const EmailSequences = ({ 
  leadSegment = 'warm', 
  leadName = 'Marie',
  className = "" 
}: EmailSequencesProps) => {
  const { mobileButtonClass, touchTargetClass, animationClass } = useMobileOptimized();
  const [activeSequence, setActiveSequence] = useState<EmailSequence>(emailSequences[leadSegment]);
  
  useEffect(() => {
    setActiveSequence(emailSequences[leadSegment]);
  }, [leadSegment]);

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'qualified': return 'bg-green-100 text-green-800 border-green-200';
      case 'hot': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warm': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cold': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDelayText = (hours: number) => {
    if (hours < 24) return `${hours}h après inscription`;
    const days = Math.floor(hours / 24);
    return `${days} jour${days > 1 ? 's' : ''} après inscription`;
  };

  const personalizeContent = (content: string) => {
    return content
      .replace(/\{\{name\}\}/g, leadName)
      .replace(/\{\{company_type\}\}/g, 'entreprises comme la vôtre')
      .replace(/\{\{time_savings\}\}/g, '15-20')
      .replace(/\{\{error_reduction\}\}/g, '75')
      .replace(/\{\{roi_estimate\}\}/g, '340%');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mail className="w-6 h-6 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold">
            Séquences Email Personnalisées
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Découvrez comment nous nurturons vos prospects avec des messages hautement personnalisés 
          pour maximiser l'engagement et les conversions.
        </p>
      </div>

      {/* Segment Selector */}
      <div className="flex flex-wrap justify-center gap-3">
        {Object.entries(emailSequences).map(([segment, sequence]) => (
          <button
            key={segment}
            onClick={() => setActiveSequence(sequence)}
            className={`px-4 py-2 rounded-lg border transition-all duration-200 ${touchTargetClass}
              ${activeSequence.segment === segment 
                ? getSegmentColor(segment) + ' ring-2 ring-primary/20' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
          >
            <Badge variant="outline" className={getSegmentColor(segment)}>
              {sequence.name.split(' - ')[0]}
            </Badge>
          </button>
        ))}
      </div>

      {/* Active Sequence Overview */}
      <Card className="p-6 border-2 border-primary/10">
        <div className="space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{activeSequence.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {activeSequence.emails.length} email{activeSequence.emails.length > 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Segment {activeSequence.segment}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Leads qualifiés
                </div>
              </div>
            </div>
            <Badge className={`${getSegmentColor(activeSequence.segment)} px-3 py-1`}>
              {activeSequence.segment.toUpperCase()}
            </Badge>
          </div>

          {/* Triggers */}
          <div className="bg-accent/30 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Déclencheurs automatiques
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeSequence.triggers.map((trigger, index) => (
                <span key={index} className="text-xs bg-white px-2 py-1 rounded border">
                  {trigger.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Email Timeline */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center mb-6">
          Timeline des Communications
        </h3>
        
        {activeSequence.emails.map((email, index) => (
          <Card key={email.id} className={`relative overflow-hidden ${animationClass}`}>
            {/* Timeline connector */}
            {index < activeSequence.emails.length - 1 && (
              <div className="absolute left-8 top-20 w-0.5 h-8 bg-gradient-to-b from-primary to-transparent z-10" />
            )}
            
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
                
                <div className="flex-1 space-y-4">
                  {/* Email header */}
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        {personalizeContent(email.subject)}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getDelayText(email.delay)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Email #{index + 1}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Personnalisé</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Email preview */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="text-sm">
                      <strong>Objet :</strong> {personalizeContent(email.subject)}
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {personalizeContent(email.content).substring(0, 300)}
                      {email.content.length > 300 && '...'}
                    </div>
                    
                    {/* CTA Preview */}
                    <div className="pt-3 border-t border-gray-200">
                      <Button 
                        variant="cta" 
                        className={`${mobileButtonClass} ${touchTargetClass}`}
                        size="sm"
                      >
                        {email.cta.text}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Email metrics preview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="font-semibold text-green-800">92%</div>
                      <div className="text-green-600">Taux de livraison</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="font-semibold text-blue-800">45%</div>
                      <div className="text-blue-600">Taux d'ouverture</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="font-semibold text-purple-800">18%</div>
                      <div className="text-purple-600">Taux de clic</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="font-semibold text-orange-800">8%</div>
                      <div className="text-orange-600">Conversions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold">Performance Globale</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">78%</div>
              <div className="text-sm text-muted-foreground">Engagement moyen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">340%</div>
              <div className="text-sm text-muted-foreground">ROI moyen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">15h</div>
              <div className="text-sm text-muted-foreground">Temps économisé/semaine</div>
            </div>
          </div>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nos séquences email personnalisées transforment vos prospects en clients satisfaits 
            grâce à des messages pertinents et un timing parfait.
          </p>
        </div>
      </Card>
    </div>
  );
};