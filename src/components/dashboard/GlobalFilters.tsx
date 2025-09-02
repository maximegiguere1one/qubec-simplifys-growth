import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, RefreshCw, Globe, Clock } from 'lucide-react';

export interface GlobalFiltersState {
  dateRange: number;
  timezone: string;
  comparison: boolean;
  autoRefresh: boolean;
}

interface GlobalFiltersProps {
  filters: GlobalFiltersState;
  onFiltersChange: (filters: GlobalFiltersState) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const TIMEZONES = [
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'America/Montreal', label: 'Montréal (EST/EDT)' },
  { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)' },
  { value: 'America/Edmonton', label: 'Edmonton (MST/MDT)' },
];

const DATE_RANGES = [
  { value: 7, label: '7 derniers jours' },
  { value: 30, label: '30 derniers jours' },
  { value: 90, label: '90 derniers jours' },
  { value: 365, label: '1 année' },
];

export const GlobalFilters = ({ 
  filters, 
  onFiltersChange, 
  onRefresh, 
  isLoading = false 
}: GlobalFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof GlobalFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== 30 && v !== 'America/Toronto' && v !== false
  ).length;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Date range quick selector */}
            <select 
              value={filters.dateRange} 
              onChange={(e) => updateFilter('dateRange', Number(e.target.value))}
              className="px-3 py-1 border rounded-md bg-background text-sm"
            >
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Comparison toggle */}
            <Button
              variant={filters.comparison ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('comparison', !filters.comparison)}
            >
              Comparaison
            </Button>

            {/* Auto-refresh toggle */}
            <Button
              variant={filters.autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('autoRefresh', !filters.autoRefresh)}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Auto
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Timezone Selector */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Fuseau Horaire
                </label>
                <select 
                  value={filters.timezone} 
                  onChange={(e) => updateFilter('timezone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Details */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Période Analysée
                </label>
                <div className="text-sm text-muted-foreground">
                  {filters.dateRange === 7 && 'Du ' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}
                  {filters.dateRange === 30 && 'Du ' + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}
                  {filters.dateRange === 90 && 'Du ' + new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}
                  {filters.dateRange === 365 && 'Du ' + new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-CA')}
                  {' au ' + new Date().toLocaleDateString('fr-CA')}
                </div>
              </div>

              {/* Comparison Period */}
              {filters.comparison && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Période de Comparaison
                  </label>
                  <div className="text-sm text-muted-foreground">
                    Période précédente de même durée
                    <br />
                    ({filters.dateRange} jours avant)
                  </div>
                </div>
              )}
            </div>

            {/* Filter summary */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline">
                {DATE_RANGES.find(r => r.value === filters.dateRange)?.label}
              </Badge>
              <Badge variant="outline">
                {TIMEZONES.find(tz => tz.value === filters.timezone)?.label}
              </Badge>
              {filters.comparison && (
                <Badge variant="secondary">Comparaison activée</Badge>
              )}
              {filters.autoRefresh && (
                <Badge variant="secondary">Actualisation auto</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};