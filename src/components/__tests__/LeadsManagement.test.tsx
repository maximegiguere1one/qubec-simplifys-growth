import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadsManagement } from '../admin/LeadsManagement';

// Mock Supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}));

// Mock UI components
vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, onChange, ...props }: any) => (
    <input 
      placeholder={placeholder}
      onChange={onChange}
      data-testid="input"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, defaultValue }: any) => (
    <div 
      data-testid="select" 
      data-default={defaultValue}
      onClick={() => onValueChange && onValueChange('hot')}
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

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table data-testid="table">{children}</table>,
  TableHeader: ({ children }: any) => <thead data-testid="table-header">{children}</thead>,
  TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
  TableRow: ({ children, onClick }: any) => (
    <tr data-testid="table-row" onClick={onClick}>{children}</tr>
  ),
  TableHead: ({ children }: any) => <th data-testid="table-head">{children}</th>,
  TableCell: ({ children }: any) => <td data-testid="table-cell">{children}</td>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button 
      onClick={onClick} 
      data-testid="button"
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} {...props}>
      {children}
    </span>
  ),
}));

describe('LeadsManagement', () => {
  const mockLeadsData = {
    leads: [
      {
        id: 'lead-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Test Corp',
        segment: 'hot',
        source: 'facebook',
        score: 85,
        created_at: '2024-01-15T10:00:00Z',
        last_activity_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'lead-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        company: 'Another Corp',
        segment: 'warm',
        source: 'google',
        score: 65,
        created_at: '2024-01-14T15:30:00Z',
        last_activity_at: '2024-01-14T15:30:00Z',
      },
    ],
    total: 2,
    page: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({ data: mockLeadsData, error: null });
  });

  it('should render leads management interface', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Gestion des Leads')).toBeInTheDocument();
    });

    // Should show search and filter controls
    expect(screen.getByPlaceholderText('Rechercher par nom ou email...')).toBeInTheDocument();
    expect(screen.getAllByTestId('select')).toHaveLength(4); // Segment, Source, Stage, Priority filters
  });

  it('should display leads in table format', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      expect(screen.getByTestId('table')).toBeInTheDocument();
    });

    // Should display lead data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Corp')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument(); // score
  });

  it('should handle search functionality', async () => {
    const user = userEvent.setup();
    render(<LeadsManagement />);
    
    await waitFor(() => {
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });
    
    // Type in search box
    const searchInput = screen.getByTestId('input');
    await user.type(searchInput, 'John');
    
    await waitFor(() => {
      // Should make API call with search term
      expect(mockInvoke).toHaveBeenCalledWith('admin-leads', {
        body: expect.objectContaining({
          search: 'John',
        }),
      });
    });
  });

  it('should handle segment filtering', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('select')[0]).toBeInTheDocument();
    });
    
    // Click segment filter
    fireEvent.click(screen.getAllByTestId('select')[0]);
    
    await waitFor(() => {
      // Should make API call with segment filter
      expect(mockInvoke).toHaveBeenCalledWith('admin-leads', {
        body: expect.objectContaining({
          segment: 'hot',
        }),
      });
    });
  });

  it('should handle API errors gracefully', async () => {
    mockInvoke.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database connection failed' } 
    });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<LeadsManagement />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des leads:',
        expect.objectContaining({ message: 'Database connection failed' })
      );
    });
    
    // Should show error state
    expect(screen.getByText('Erreur de chargement des données')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should display lead segments with correct badges', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });

    // Should show segment badges
    expect(screen.getByText('hot')).toBeInTheDocument();
    expect(screen.getByText('warm')).toBeInTheDocument();
  });

  it('should handle lead selection and detailed view', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      const tableRows = screen.getAllByTestId('table-row');
      expect(tableRows.length).toBeGreaterThan(1); // Header + data rows
    });
    
    // Click on a lead row
    const dataRows = screen.getAllByTestId('table-row').slice(1); // Skip header
    fireEvent.click(dataRows[0]);
    
    await waitFor(() => {
      // Should show detailed lead information
      expect(mockInvoke).toHaveBeenCalledWith('admin-leads', {
        body: expect.objectContaining({
          leadId: 'lead-1',
        }),
      });
    });
  });

  it('should handle pagination', async () => {
    const paginatedData = {
      ...mockLeadsData,
      total: 50,
      totalPages: 5,
      page: 1,
    };
    
    mockInvoke.mockResolvedValue({ data: paginatedData, error: null });
    
    render(<LeadsManagement />);
    
    await waitFor(() => {
      // Should show pagination controls
      expect(screen.getByText('Page 1 de 5')).toBeInTheDocument();
    });
  });

  it('should refresh data when refresh button clicked', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
    
    vi.clearAllMocks();
    
    // Click refresh button (assuming it's one of the buttons)
    const refreshButton = screen.getAllByTestId('button')[0];
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('admin-leads', expect.any(Object));
    });
  });

  it('should display lead scores with appropriate formatting', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      // Should show formatted scores
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
    });
  });

  it('should handle empty leads data', async () => {
    mockInvoke.mockResolvedValue({ 
      data: { leads: [], total: 0, page: 1, totalPages: 0 }, 
      error: null 
    });
    
    render(<LeadsManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Aucun lead trouvé')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      // Should show formatted dates
      expect(screen.getByText(/15 jan\.|14 jan\./)).toBeInTheDocument();
    });
  });

  it('should handle lead source filtering', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      const selects = screen.getAllByTestId('select');
      expect(selects.length).toBeGreaterThan(1);
    });
    
    // Click source filter (second select)
    fireEvent.click(screen.getAllByTestId('select')[1]);
    
    await waitFor(() => {
      // Should filter by source
      expect(mockInvoke).toHaveBeenLastCalledWith('admin-leads', {
        body: expect.objectContaining({
          source: 'hot', // Mock value from the select mock
        }),
      });
    });
  });

  it('should display lead activity timestamps', async () => {
    render(<LeadsManagement />);
    
    await waitFor(() => {
      // Should show last activity information
      const cells = screen.getAllByTestId('table-cell');
      expect(cells.some(cell => cell.textContent?.includes('Il y a'))).toBe(true);
    });
  });
});