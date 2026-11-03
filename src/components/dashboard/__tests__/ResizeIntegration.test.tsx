import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CRMDashboard from '../CRMDashboard'
import { DashboardProvider } from '@/context/DashboardContext'

// Mock react-grid-layout
vi.mock('react-grid-layout/legacy', () => {
  const MockResponsiveGridLayout = ({ children }: any) => {
    return (
      <div data-testid="responsive-grid-layout">
        {children}
      </div>
    )
  }

  return {
    Responsive: MockResponsiveGridLayout,
    WidthProvider: (component: any) => component,
  }
})

// Mock individual widget components
vi.mock('../TotalLeads', () => ({
  default: () => <div data-testid="total-leads-content">Total Leads Content</div>,
}))

vi.mock('../ReachedLeads', () => ({
  default: () => <div data-testid="reached-leads-content">Reached Leads Content</div>,
}))

vi.mock('../ConversationsCompleted', () => ({
  default: () => <div data-testid="conversations-completed-content">Conversations Completed Content</div>,
}))

vi.mock('../LeadTemperature', () => ({
  default: () => <div data-testid="lead-temperature-content">Lead Temperature Content</div>,
}))

// Mock WidgetLibrary
vi.mock('../WidgetLibrary', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="widget-library">
      <button onClick={onClose}>Close Library</button>
    </div>
  ),
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}))

// Mock cleanup utility
vi.mock('@/utils/clearSuccessRateWidget', () => ({
  cleanupSuccessRateWidget: vi.fn(),
}))

describe('Dashboard Integration Tests', () => {
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

  it('should render dashboard with basic components', () => {
    renderDashboard()

    // Verify main components are present
    expect(screen.getByTestId('responsive-grid-layout')).toBeInTheDocument()
    
    
    // Verify at least one widget-related element is present
    expect(screen.getByText(/widgets/)).toBeInTheDocument()
  })
}) 