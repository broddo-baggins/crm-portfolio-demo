import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CRMDashboard from '../CRMDashboard'
import { DashboardProvider } from '@/context/DashboardContext'

// Mock react-grid-layout
vi.mock('react-grid-layout/legacy', () => {
  const MockResponsiveGridLayout = ({ children }: any) => {
    return <div data-testid="responsive-grid-layout">{children}</div>
  }

  return {
    Responsive: MockResponsiveGridLayout,
    WidthProvider: (component: any) => component,
  }
})

// Mock widgets
vi.mock('../TotalLeads', () => ({
  default: () => <div data-testid="total-leads">Total Leads</div>,
}))

vi.mock('../ReachedLeads', () => ({
  default: () => <div data-testid="reached-leads">Reached Leads</div>,
}))

vi.mock('../ConversationsCompleted', () => ({
  default: () => <div data-testid="conversations-completed">Conversations Completed</div>,
}))

vi.mock('../LeadTemperature', () => ({
  default: () => <div data-testid="lead-temperature">Lead Temperature</div>,
}))

// Mock other components
vi.mock('../WidgetLibrary', () => ({
  default: () => <div data-testid="widget-library">Widget Library</div>,
}))

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Basic Dashboard Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderDashboard = () => {
    return render(
      <DashboardProvider>
        <CRMDashboard />
      </DashboardProvider>
    )
  }

  it('should render the dashboard layout', () => {
    renderDashboard()
    
    expect(screen.getByTestId('responsive-grid-layout')).toBeInTheDocument()
    
  })

  it('should display dashboard statistics', () => {
    renderDashboard()
    
    expect(screen.getByText(/widgets/)).toBeInTheDocument()
    expect(screen.getByText(/active/)).toBeInTheDocument()
  })
}) 