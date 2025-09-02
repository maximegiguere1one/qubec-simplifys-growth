import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Facebook, Instagram, Globe } from 'lucide-react';

interface SourceData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  visitors: number;
  leads: number;
  quiz_completions: number;
  bookings: number;
  conversion_rate: number;
  cost_per_lead: number;
  roi_score: number;
}

interface TopSourcesProps {
  daysBack: number;
}

export const TopSources = ({ daysBack }: TopSourcesProps) => {
  const [sourcesData, setSourcesData] = useState<SourceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSourcesData();
  }, [daysBack]);

  const fetchSourcesData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_attribution_analysis', { days_back: daysBack });

      if (error) throw error;
      
      // Get top 3 sources by bookings
      const topSources = (data || [])
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 3);
      
      setSourcesData(topSources);
    } catch (error) {
      console.error('Erreur lors du chargement des sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'fb':
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'ig':
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'fb':
      case 'facebook':
        return { text: 'FB Ads', variant: 'default' as const };
      case 'ig':
      case 'instagram':
        return { text: 'Instagram', variant: 'secondary' as const };
      case 'direct':
      case null:
        return { text: 'Direct', variant: 'outline' as const };
      default:
        return { text: source || 'Autre', variant: 'outline' as const };
    }
  };

  const getTrendIcon = (conversionRate: number) => {
    if (conversionRate >= 15) return <TrendingUp className="h-3 w-3 text-success" />;
    if (conversionRate <= 5) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pourquoi ça bouge?</CardTitle>
        <CardDescription>
          Top 3 sources de leads et rendez-vous
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sourcesData.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Pas encore de données de sources</p>
              <p className="text-xs">Ajoutez des paramètres UTM à vos liens</p>
            </div>
          ) : (
            sourcesData.map((source, index) => {
              const badge = getSourceBadge(source.utm_source);
              const trendIcon = getTrendIcon(source.conversion_rate);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(source.utm_source)}
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.text}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{source.leads} leads</p>
                      <p className="text-sm text-muted-foreground">
                        {source.utm_medium || 'organic'} • {source.bookings} rdv
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="font-bold text-success">
                        {source.conversion_rate.toFixed(1)}%
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {trendIcon}
                        <span>CR vers RDV</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Micro-insight */}
        {sourcesData.length > 0 && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">
                {sourcesData[0] ? getSourceBadge(sourcesData[0].utm_source).text : 'Source principale'}:
              </span>{" "}
              {sourcesData[0]?.conversion_rate > 10 
                ? `Excellent ${sourcesData[0].conversion_rate.toFixed(1)}% de conversion vers RDV`
                : `${sourcesData[0]?.conversion_rate.toFixed(1)}% de conversion - optimisable`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};