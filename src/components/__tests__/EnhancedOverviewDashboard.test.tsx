import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedOverviewDashboard } from '../analytics/EnhancedOverviewDashboard';

// Mock Supabase client
const mockRpc = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: mockRpc,
  },
}));

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
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
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select" onClick={() => onValueChange('7')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

describe('EnhancedOverviewDashboard', () => {
  const mockTrendData = [
    {
      date: '2024-01-01',
      total_leads: 10,
      bookings: 2,
      conversion_rate: 20,
    },
    {
      date: '2024-01-02',
      total_leads: 15,
      bookings: 3,
      conversion_rate: 20,
    },
  ];

  const mockFunnelData = [
    {
      step_name: 'Visiteurs',
      total_entries: 1000,
      conversions: 100,
      conversion_rate: 10,
      drop_off_rate: 90,
      bottleneck_score: 0,
    },
    {
      step_name: 'Capture Lead',
      total_entries: 100,
      conversions: 50,
      conversion_rate: 50,
      drop_off_rate: 50,
      bottleneck_score: 20,
    },
  ];

  const mockHealthData = [
    {
      metric_name: 'Evenements Totaux',
      metric_value: 1500,
      status: 'Bon',
      recommendation: 'Bon volume',
    },
    {
      metric_name: 'Sessions Invalides',
      metric_value: 2,
      status: 'OK',
      recommendation: 'RAS',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful RPC responses
    mockRpc
      .mockResolvedValueOnce({ data: mockTrendData, error: null })
      .mockResolvedValueOnce({ data: mockFunnelData, error: null })
      .mockResolvedValueOnce({ data: mockHealthData, error: null });
  });

  it('should render loading state initially', () => {
    // Mock pending promises
    mockRpc.mockReturnValue(new Promise(() => {}));
    
    render(<EnhancedOverviewDashboard />);
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    // Should show skeleton loading elements
  });

  it('should render dashboard data after loading', async () => {
    render(<EnhancedOverviewDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Vue d\'ensemble avancée')).toBeInTheDocument();
    });

    // Should display KPI cards
    expect(screen.getAllByTestId('card')).toHaveLength(4); // KPI cards
    
    // Should display trend chart
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should handle RPC errors gracefully', async () => {
    mockRpc
      .mockRejectedValueOnce(new Error('Database error'))
      .mockResolvedValueOnce({ data: mockFunnelData, error: null })
      .mockResolvedValueOnce({ data: mockHealthData, error: null });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<EnhancedOverviewDashboard />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des données:',
        expect.any(Error)
      );
    });
    
    // Should still render other sections that loaded successfully
    expect(screen.getByText('Vue d\'ensemble avancée')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should update date range when selector changes', async () => {
    render(<EnhancedOverviewDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });
    
    // Simulate changing date range
    fireEvent.click(screen.getByTestId('select'));
    
    await waitFor(() => {
      // Should make new RPC calls with updated date range
      expect(mockRpc).toHaveBeenCalledWith('get_trended_dashboard_metrics', { days_back: 7 });
    });
  });

  it('should refresh data when refresh button clicked', async () => {
    render(<EnhancedOverviewDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
    
    // Clear previous calls
    vi.clearAllMocks();
    
    // Click refresh button
    fireEvent.click(screen.getByTestId('button'));
    
    await waitFor(() => {
      // Should make fresh RPC calls
      expect(mockRpc).toHaveBeenCalledTimes(3);
    });
  });

  it('should display funnel analysis with conversion rates', async () => {
    render(<EnhancedOverviewDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Analyse de l\'entonnoir')).toBeInTheDocument();
    });
    
    // Should show funnel steps
    expect(screen.getByText('Visiteurs')).toBeInTheDocument();
    expect(screen.getByText('Capture Lead')).toBeInTheDocument();
    
    // Should show conversion metrics
    expect(screen.getByText('1,000')).toBeInTheDocument(); // Total entries
    expect(screen.getByText('10%')).toBeInTheDocument(); // Conversion rate
  });

  it('should display tracking health metrics', async () => {
    render(<EnhancedOverviewDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Santé du tracking')).toBeInTheDocument();
    });
    
    // Should show health metrics
    expect(screen.getByText('Evenements Totaux')).toBeInTheDocument();
    expect(screen.getByText('Sessions Invalides')).toBeInTheDocument();
    
    // Should show recommendations
    expect(screen.getByText('Bon volume')).toBeInTheDocument();
    expect(screen.getByText('RAS')).toBeInTheDocument();
  });

  it('should calculate and display trend indicators', async () => {
    render(<EnhancedOverviewDashboard />);
    
    await waitFor(() => {
      // Should calculate trends based on data
      const trendElements = screen.getAllByTestId('card-content');
      expect(trendElements.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty data gracefully', async () => {
    mockRpc
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null });
    
    render(<EnhancedOverviewDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Vue d\'ensemble avancée')).toBeInTheDocument();
    });
    
    // Should handle empty data without crashing
    expect(screen.getByText('Aucune donnée disponible')).toBeInTheDocument();
  });

  it('should format chart data correctly for visualization', async () => {
    render(<EnhancedOverviewDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    
    // Chart should be rendered with proper data structure
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});