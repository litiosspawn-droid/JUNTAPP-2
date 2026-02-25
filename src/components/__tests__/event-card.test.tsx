import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventCard } from '@/components/event-card'
import { Event } from '@/lib/firebase/events'

// Mock Firebase auth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
      displayName: 'Test User',
      email: 'test@example.com',
    },
  }),
}))

// Mock deleteEvent function
jest.mock('@/lib/firebase/events', () => ({
  deleteEvent: jest.fn(),
}))

const mockEvent: Event = {
  id: 'test-event-id',
  title: 'Test Event',
  description: 'This is a test event description',
  category: 'Música',
  date: '2024-12-25',
  time: '20:00',
  address: 'Test Location',
  lat: -34.6037,
  lng: -58.3816,
  attendees: 42,
  flyerUrl: 'https://example.com/flyer.jpg',
  createdBy: 'test-user-id',
  tags: ['rock', 'live'],
}

describe('EventCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders event information correctly', () => {
    render(<EventCard event={mockEvent} />)

    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('This is a test event description')).toBeInTheDocument()
    expect(screen.getByText('Test Location')).toBeInTheDocument()
    expect(screen.getByText('42 asistentes')).toBeInTheDocument()
    expect(screen.getByText('Música')).toBeInTheDocument()
  })

  it('renders event tags', () => {
    render(<EventCard event={mockEvent} />)

    expect(screen.getByText('rock')).toBeInTheDocument()
    expect(screen.getByText('live')).toBeInTheDocument()
  })

  it('shows delete button for event creator', () => {
    render(<EventCard event={mockEvent} />)

    const deleteButton = screen.getByRole('button', { name: /eliminar/i })
    expect(deleteButton).toBeInTheDocument()
  })

  it('does not show delete button for non-creator', () => {
    const eventNotOwned: Event = {
      ...mockEvent,
      createdBy: 'different-user-id',
    }

    render(<EventCard event={eventNotOwned} />)

    const deleteButton = screen.queryByRole('button', { name: /eliminar/i })
    expect(deleteButton).not.toBeInTheDocument()
  })

  it('calls onDelete when provided and delete is confirmed', async () => {
    const mockOnDelete = jest.fn()

    // Mock window.confirm to return true
    const confirmSpy = jest.spyOn(window, 'confirm')
    confirmSpy.mockImplementation(() => true)

    render(<EventCard event={mockEvent} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button', { name: /eliminar/i })
    await userEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalled()
    })

    confirmSpy.mockRestore()
  })

  it('does not call onDelete when delete is cancelled', async () => {
    const mockOnDelete = jest.fn()

    // Mock window.confirm to return false
    const confirmSpy = jest.spyOn(window, 'confirm')
    confirmSpy.mockImplementation(() => false)

    render(<EventCard event={mockEvent} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button', { name: /eliminar/i })
    await userEvent.click(deleteButton)

    expect(mockOnDelete).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('navigates to event page when clicked', async () => {
    render(<EventCard event={mockEvent} />)

    const eventCard = screen.getByRole('link')
    expect(eventCard).toHaveAttribute('href', '/evento/test-event-id')
  })
})
