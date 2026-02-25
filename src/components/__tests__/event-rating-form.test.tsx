import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/contexts/AuthContext'
import { EventRatingForm } from '@/components/event-rating-form'

// Mock the useAuth hook
const mockUseAuth = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock the createOrUpdateRating function
const mockCreateOrUpdateRating = jest.fn()
jest.mock('@/lib/firebase/ratings', () => ({
  createOrUpdateRating: mockCreateOrUpdateRating,
}))

// Mock the getUserRatingForEvent function
const mockGetUserRatingForEvent = jest.fn()
jest.mock('@/lib/firebase/ratings', () => ({
  ...jest.requireActual('@/lib/firebase/ratings'),
  getUserRatingForEvent: mockGetUserRatingForEvent,
}))

const renderRatingForm = (eventId: string, onRatingSubmitted?: () => void) => {
  return render(
    <AuthProvider>
      <EventRatingForm eventId={eventId} onRatingSubmitted={onRatingSubmitted} />
    </AuthProvider>
  )
}

describe('EventRatingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateOrUpdateRating.mockResolvedValue('rating-id-123')
    mockGetUserRatingForEvent.mockResolvedValue(null)
  })

  it('shows login prompt when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null })

    renderRatingForm('event-123')

    expect(screen.getByText('Inicia sesión para calificar eventos')).toBeInTheDocument()
    expect(screen.getByText('Califica este evento')).toBeInTheDocument()
  })

  it('renders rating form when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123', displayName: 'Test User' }
    })

    renderRatingForm('event-123')

    expect(screen.getByText('Tu calificación *')).toBeInTheDocument()
    expect(screen.getByText('Tu opinión (opcional)')).toBeInTheDocument()
    expect(screen.getByText('Enviar valoración')).toBeInTheDocument()
  })

  it('loads existing rating when user has already rated', async () => {
    const existingRating = {
      id: 'existing-rating-id',
      eventId: 'event-123',
      userId: 'user-123',
      userName: 'Test User',
      rating: 4,
      review: 'Great event!',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123', displayName: 'Test User' }
    })
    mockGetUserRatingForEvent.mockResolvedValue(existingRating)

    renderRatingForm('event-123')

    await waitFor(() => {
      expect(screen.getByDisplayValue('Great event!')).toBeInTheDocument()
    })

    // Should show update button for existing rating
    expect(screen.getByText('Actualizar valoración')).toBeInTheDocument()
  })

  it('prevents form submission without rating', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123', displayName: 'Test User' }
    })

    renderRatingForm('event-123')

    const submitButton = screen.getByText('Enviar valoración')
    expect(submitButton).toBeDisabled()

    // Try to submit without rating
    await userEvent.click(submitButton)
    expect(mockCreateOrUpdateRating).not.toHaveBeenCalled()
  })

  it('allows form submission with rating only', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123', displayName: 'Test User' }
    })

    renderRatingForm('event-123')

    // Click on a star rating
    const stars = screen.getAllByRole('button')
    const star5 = stars.find(button => button.getAttribute('aria-label')?.includes('5 estrellas'))
    if (star5) {
      await userEvent.click(star5)
    }

    const submitButton = screen.getByText('Enviar valoración')
    expect(submitButton).not.toBeDisabled()

    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockCreateOrUpdateRating).toHaveBeenCalledWith({
        eventId: 'event-123',
        userId: 'user-123',
        userName: 'Test User',
        userPhotoURL: undefined,
        rating: 5,
        review: undefined,
      })
    })
  })

  it('submits rating with review when provided', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123', displayName: 'Test User' }
    })

    renderRatingForm('event-123')

    // Click on a star rating
    const stars = screen.getAllByRole('button')
    const star4 = stars.find(button => button.getAttribute('aria-label')?.includes('4 estrellas'))
    if (star4) {
      await userEvent.click(star4)
    }

    // Add a review
    const reviewTextarea = screen.getByPlaceholderText('Comparte tu experiencia en este evento...')
    await userEvent.type(reviewTextarea, 'Excellent event! Highly recommended.')

    const submitButton = screen.getByText('Enviar valoración')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockCreateOrUpdateRating).toHaveBeenCalledWith({
        eventId: 'event-123',
        userId: 'user-123',
        userName: 'Test User',
        userPhotoURL: undefined,
        rating: 4,
        review: 'Excellent event! Highly recommended.',
      })
    })
  })

  it('shows success message after successful submission', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123', displayName: 'Test User' }
    })

    renderRatingForm('event-123')

    // Submit a rating
    const stars = screen.getAllByRole('button')
    const star3 = stars.find(button => button.getAttribute('aria-label')?.includes('3 estrellas'))
    if (star3) {
      await userEvent.click(star3)
    }

    const submitButton = screen.getByText('Enviar valoración')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('¡Gracias por tu valoración!')).toBeInTheDocument()
    })
  })

  it('shows error message when submission fails', async () => {
    mockCreateOrUpdateRating.mockRejectedValue(new Error('Network error'))
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123', displayName: 'Test User' }
    })

    renderRatingForm('event-123')

    // Submit a rating
    const stars = screen.getAllByRole('button')
    const star2 = stars.find(button => button.getAttribute('aria-label')?.includes('2 estrellas'))
    if (star2) {
      await userEvent.click(star2)
    }

    const submitButton = screen.getByText('Enviar valoración')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Error al enviar la valoración. Inténtalo de nuevo.')).toBeInTheDocument()
    })
  })

  it('calls onRatingSubmitted callback when provided', async () => {
    const mockOnRatingSubmitted = jest.fn()
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123', displayName: 'Test User' }
    })

    renderRatingForm('event-123', mockOnRatingSubmitted)

    // Submit a rating
    const stars = screen.getAllByRole('button')
    const star1 = stars.find(button => button.getAttribute('aria-label')?.includes('1 estrella'))
    if (star1) {
      await userEvent.click(star1)
    }

    const submitButton = screen.getByText('Enviar valoración')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnRatingSubmitted).toHaveBeenCalledWith({
        id: 'rating-id-123',
        eventId: 'event-123',
        userId: 'user-123',
        userName: 'Test User',
        userPhotoURL: undefined,
        rating: 1,
        review: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })
  })

  it('enforces character limit on review', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-123', displayName: 'Test User' }
    })

    renderRatingForm('event-123')

    const reviewTextarea = screen.getByPlaceholderText('Comparte tu experiencia en este evento...')
    const longText = 'A'.repeat(550) // Exceeds 500 character limit

    await userEvent.type(reviewTextarea, longText)

    // Should only allow up to 500 characters
    expect(reviewTextarea).toHaveValue('A'.repeat(500))
  })
})
