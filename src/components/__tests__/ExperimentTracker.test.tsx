import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExperimentTracker } from '../ExperimentTracker';

// Mock Supabase client
const mockRpc = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: mockRpc,
  },
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
  Select: ({ children, onValueChange, defaultValue }: any) => (
    <div 
      data-testid="select" 
      data-default={defaultValue}
      onClick={() => onValueChange && onValueChange('30')}
    >
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, ...props }: any) => (
    <div data-testid="progress" data-value={value} {...props} />
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} {...props}>
      {children}
    </span>
  ),
}));

describe('ExperimentTracker', () => {
  const mockExperimentData = [
    {
      test_name: 'landing_cta',
      variant: 'control',
      total_views: 500,
      conversions: 50,
      conversion_rate: 10,
    },
    {
      test_name: 'landing_cta',
      variant: 'variant_a',
      total_views: 520,
      conversions: 65,
      conversion_rate: 12.5,
    },
    {
      test_name: 'vsl_cta_overlay',
      variant: 'control',
      total_views: 300,
      conversions: 30,
      conversion_rate: 10,
    },
    {
      test_name: 'vsl_cta_overlay',
      variant: 'variant_b',
      total_views: 280,
      conversions: 42,
      conversion_rate: 15,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ data: mockExperimentData, error: null });
  });

  it('should render experiment tracker with data', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('Suivi des Expériences A/B')).toBeInTheDocument();
    });

    // Should display experiment groups
    expect(screen.getByText('landing_cta')).toBeInTheDocument();
    expect(screen.getByText('vsl_cta_overlay')).toBeInTheDocument();
  });

  it('should display variant performance metrics', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      // Should show control and variant data
      expect(screen.getByText('control')).toBeInTheDocument();
      expect(screen.getByText('variant_a')).toBeInTheDocument();
      expect(screen.getByText('variant_b')).toBeInTheDocument();
    });

    // Should show conversion metrics
    expect(screen.getByText('500')).toBeInTheDocument(); // views
    expect(screen.getByText('50')).toBeInTheDocument(); // conversions
    expect(screen.getByText('10%')).toBeInTheDocument(); // conversion rate
  });

  it('should calculate statistical significance', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      // Should show significance indicators
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });

    // Should show confidence levels
    expect(screen.getByText(/Significatif|Non significatif/)).toBeInTheDocument();
  });

  it('should handle date range selection', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });
    
    // Simulate date range change
    fireEvent.click(screen.getByTestId('select'));
    
    await waitFor(() => {
      // Should call RPC with new date range
      expect(mockRpc).toHaveBeenCalledWith('get_experiment_results', { days_back: 30 });
    });
  });

  it('should handle RPC errors gracefully', async () => {
    mockRpc.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error', code: '42000' } 
    });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des expériences:',
        expect.objectContaining({ message: 'Database error' })
      );
    });
    
    // Should show error state
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should refresh data when refresh button clicked', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
    
    vi.clearAllMocks();
    
    fireEvent.click(screen.getByTestId('button'));
    
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('get_experiment_results', 
        expect.objectContaining({ days_back: expect.any(Number) })
      );
    });
  });

  it('should group experiments by test name', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      // Should group variants under test names
      const testCards = screen.getAllByTestId('card');
      expect(testCards.length).toBeGreaterThanOrEqual(2); // At least 2 test groups
    });

    // Should show both variants for landing_cta test
    expect(screen.getByText('control')).toBeInTheDocument();
    expect(screen.getByText('variant_a')).toBeInTheDocument();
  });

  it('should calculate lift percentages between variants', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      // Should calculate and show lift for better performing variants
      expect(screen.getByText(/\+25%|\+50%/)).toBeInTheDocument(); // Lift indicators
    });
  });

  it('should show progress bars for conversion rates', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      const progressBars = screen.getAllByTestId('progress');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    // Progress bars should have values
    const progressBar = screen.getAllByTestId('progress')[0];
    expect(progressBar).toHaveAttribute('data-value');
  });

  it('should handle empty experiment data', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });
    
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('Aucune expérience en cours')).toBeInTheDocument();
    });
  });

  it('should display experiment recommendations', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      // Should show recommendations based on performance
      expect(screen.getByText(/Recommandation|Gagnant|À surveiller/)).toBeInTheDocument();
    });
  });

  it('should format conversion rates correctly', async () => {
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      // Should display rates with proper formatting
      expect(screen.getByText('10.0%')).toBeInTheDocument();
      expect(screen.getByText('12.5%')).toBeInTheDocument();
      expect(screen.getByText('15.0%')).toBeInTheDocument();
    });
  });

  it('should show sample size warnings for low traffic', async () => {
    const lowTrafficData = [
      {
        test_name: 'low_traffic_test',
        variant: 'control',
        total_views: 50,
        conversions: 2,
        conversion_rate: 4,
      },
    ];
    
    mockRpc.mockResolvedValue({ data: lowTrafficData, error: null });
    
    render(<ExperimentTracker />);
    
    await waitFor(() => {
      // Should warn about low sample sizes
      expect(screen.getByText(/Échantillon insuffisant|Augmenter le trafic/)).toBeInTheDocument();
    });
  });
});