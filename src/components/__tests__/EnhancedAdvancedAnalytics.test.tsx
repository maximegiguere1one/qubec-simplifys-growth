import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedAdvancedAnalytics } from '../analytics/EnhancedAdvancedAnalytics';

// Mock Supabase client
const mockRpc = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: mockRpc,
  },
}));

// Mock Recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock UI components
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, onValueChange }: any) => (
    <div data-testid="tabs" onClick={() => onValueChange && onValueChange('attribution')}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}));

describe('EnhancedAdvancedAnalytics', () => {
  const mockAttributionData = [
    {
      utm_source: 'facebook',
      utm_medium: 'cpc',
      utm_campaign: 'q1-2024',
      visitors: 500,
      leads: 50,
      bookings: 10,
      conversion_rate: 20,
      roi_score: 85,
    },
    {
      utm_source: 'google',
      utm_medium: 'organic',
      utm_campaign: 'seo',
      visitors: 300,
      leads: 45,
      bookings: 12,
      conversion_rate: 26.7,
      roi_score: 95,
    },
  ];

  const mockVslData = [
    {
      time_bucket: 'Matin (6h-11h)',
      play_events: 100,
      completion_events: 60,
      avg_watch_duration: 85,
      engagement_rate: 60,
      cta_clicks: 15,
      cta_conversion_rate: 25,
    },
    {
      time_bucket: 'Soir (18h-22h)',
      play_events: 150,
      completion_events: 120,
      avg_watch_duration: 95,
      engagement_rate: 80,
      cta_clicks: 30,
      cta_conversion_rate: 25,
    },
  ];

  const mockAdvancedMetrics = {
    total_visitors: 1000,
    lead_capture_rate: 15,
    quiz_completion_rate: 80,
    hot_leads_count: 25,
    warm_leads_count: 35,
    cold_leads_count: 40,
    qualified_leads_count: 10,
    consultation_booking_rate: 22,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful RPC responses
    mockRpc
      .mockResolvedValueOnce({ data: mockAttributionData, error: null })
      .mockResolvedValueOnce({ data: mockVslData, error: null })
      .mockResolvedValueOnce({ data: [mockAdvancedMetrics], error: null });
  });

  it('should render analytics tabs and content', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Analytiques avancées')).toBeInTheDocument();
    });

    // Should show tab navigation
    expect(screen.getByTestId('tab-attribution')).toBeInTheDocument();
    expect(screen.getByTestId('tab-vsl')).toBeInTheDocument();
    expect(screen.getByTestId('tab-segmentation')).toBeInTheDocument();
    expect(screen.getByTestId('tab-cohorts')).toBeInTheDocument();
  });

  it('should display attribution analysis with charts', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Attribution Marketing')).toBeInTheDocument();
    });

    // Should show attribution chart
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    // Should display attribution metrics
    expect(screen.getByText('facebook')).toBeInTheDocument();
    expect(screen.getByText('google')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument(); // visitors
    expect(screen.getByText('20%')).toBeInTheDocument(); // conversion rate
  });

  it('should display VSL engagement analysis', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    // Switch to VSL tab
    fireEvent.click(screen.getByTestId('tab-vsl'));
    
    await waitFor(() => {
      expect(screen.getByText('Engagement VSL')).toBeInTheDocument();
    });

    // Should show VSL chart
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    
    // Should display VSL metrics by time
    expect(screen.getByText('Matin (6h-11h)')).toBeInTheDocument();
    expect(screen.getByText('Soir (18h-22h)')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument(); // engagement rate
    expect(screen.getByText('80%')).toBeInTheDocument(); // higher engagement
  });

  it('should display lead segmentation with pie chart', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    // Switch to segmentation tab
    fireEvent.click(screen.getByTestId('tab-segmentation'));
    
    await waitFor(() => {
      expect(screen.getByText('Segmentation des Leads')).toBeInTheDocument();
    });

    // Should show pie chart
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    
    // Should display segmentation counts
    expect(screen.getByText('25')).toBeInTheDocument(); // hot leads
    expect(screen.getByText('35')).toBeInTheDocument(); // warm leads
    expect(screen.getByText('40')).toBeInTheDocument(); // cold leads
    expect(screen.getByText('10')).toBeInTheDocument(); // qualified leads
  });

  it('should handle tab switching correctly', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });
    
    // Should start with attribution tab active
    expect(screen.getByTestId('tab-content-attribution')).toBeInTheDocument();
    
    // Switch tabs
    fireEvent.click(screen.getByTestId('tab-vsl'));
    
    expect(screen.getByTestId('tab-content-vsl')).toBeInTheDocument();
  });

  it('should handle RPC errors for individual sections', async () => {
    mockRpc
      .mockRejectedValueOnce(new Error('Attribution error'))
      .mockResolvedValueOnce({ data: mockVslData, error: null })
      .mockResolvedValueOnce({ data: [mockAdvancedMetrics], error: null });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<EnhancedAdvancedAnalytics />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement de l\'attribution:',
        expect.any(Error)
      );
    });
    
    // Should still render other sections
    expect(screen.getByText('Analytiques avancées')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should display overview cards with key metrics', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Visiteurs Uniques')).toBeInTheDocument();
      expect(screen.getByText('Performance Quiz')).toBeInTheDocument();
      expect(screen.getByText('Consultations')).toBeInTheDocument();
    });
    
    // Should show metric values
    expect(screen.getByText('1,000')).toBeInTheDocument(); // total visitors
    expect(screen.getByText('80%')).toBeInTheDocument(); // quiz completion
    expect(screen.getByText('22%')).toBeInTheDocument(); // booking rate
  });

  it('should format attribution chart data correctly', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
    
    // Should format data for visualization
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('should display performance rate badges with correct colors', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    await waitFor(() => {
      // Should show rate indicators with appropriate styling
      const rateElements = screen.getAllByText(/\d+%/);
      expect(rateElements.length).toBeGreaterThan(0);
    });
  });

  it('should handle date range changes', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });
    
    // Simulate date range change
    fireEvent.click(screen.getByTestId('select'));
    
    await waitFor(() => {
      // Should refetch data with new date range
      expect(mockRpc).toHaveBeenCalledWith('get_attribution_analysis', { days_back: 7 });
    });
  });

  it('should refresh all data when refresh button clicked', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    await waitFor(() => {
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
    
    vi.clearAllMocks();
    
    fireEvent.click(screen.getByTestId('button'));
    
    await waitFor(() => {
      // Should refresh all three data sources
      expect(mockRpc).toHaveBeenCalledTimes(3);
    });
  });

  it('should display cohorts placeholder', async () => {
    render(<EnhancedAdvancedAnalytics />);
    
    fireEvent.click(screen.getByTestId('tab-cohorts'));
    
    await waitFor(() => {
      expect(screen.getByText('Analyse de cohortes')).toBeInTheDocument();
      expect(screen.getByText('Fonctionnalité à venir')).toBeInTheDocument();
    });
  });
});