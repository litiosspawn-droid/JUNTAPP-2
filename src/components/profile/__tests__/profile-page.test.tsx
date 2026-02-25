import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProfilePage } from '@/components/profile/profile-page'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    pathname: '/',
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock the useUserProfile hook
const mockUseUserProfile = jest.fn()
jest.mock('@/hooks/use-user-profile', () => ({
  useUserProfile: mockUseUserProfile,
}))

// Mock the useAuth hook
const mockUseAuth = jest.fn()
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock notFound
const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  notFound: mockNotFound,
}))

const renderProfilePage = (userId: string) => {
  return render(
    <AuthProvider>
      <ProfilePage userId={userId} />
    </AuthProvider>
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockUseUserProfile.mockReturnValue({
      profile: null,
      stats: null,
      createdEvents: [],
      attendingEvents: [],
      loading: true,
      error: null,
      isFollowingUser: false,
      checkFollowing: jest.fn(),
      toggleFollow: jest.fn(),
    })
    mockUseAuth.mockReturnValue({ user: null })

    renderProfilePage('test-user-id')

    expect(screen.getByText('Usuario')).toBeInTheDocument()
  })

  it('calls notFound when there is an error', () => {
    mockUseUserProfile.mockReturnValue({
      profile: null,
      stats: null,
      createdEvents: [],
      attendingEvents: [],
      loading: false,
      error: 'User not found',
      isFollowingUser: false,
      checkFollowing: jest.fn(),
      toggleFollow: jest.fn(),
    })
    mockUseAuth.mockReturnValue({ user: null })

    renderProfilePage('test-user-id')

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('displays user profile information correctly', () => {
    const mockProfile = {
      uid: 'test-user-id',
      displayName: 'Test User',
      email: 'test@example.com',
      bio: 'This is a test bio',
      location: 'Buenos Aires, Argentina',
      website: 'https://test.com',
      isVerified: true,
      createdAt: new Date('2024-01-15'),
    }

    const mockStats = {
      totalEventsCreated: 5,
      totalEventsAttended: 12,
      totalFollowers: 25,
      totalFollowing: 30,
      reputation: 150,
      joinedDate: new Date('2024-01-15'),
    }

    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      stats: mockStats,
      createdEvents: [],
      attendingEvents: [],
      loading: false,
      error: null,
      isFollowingUser: false,
      checkFollowing: jest.fn(),
      toggleFollow: jest.fn(),
    })
    mockUseAuth.mockReturnValue({ user: null })

    renderProfilePage('test-user-id')

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('This is a test bio')).toBeInTheDocument()
    expect(screen.getByText('Buenos Aires, Argentina')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // Events created
    expect(screen.getByText('12')).toBeInTheDocument() // Events attended
    expect(screen.getByText('25')).toBeInTheDocument() // Followers
    expect(screen.getByText('150')).toBeInTheDocument() // Reputation
  })

  it('shows follow button for non-own profiles when user is logged in', () => {
    const mockProfile = {
      uid: 'other-user-id',
      displayName: 'Other User',
      email: 'other@example.com',
    }

    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      stats: null,
      createdEvents: [],
      attendingEvents: [],
      loading: false,
      error: null,
      isFollowingUser: false,
      checkFollowing: jest.fn(),
      toggleFollow: jest.fn(),
    })
    mockUseAuth.mockReturnValue({
      user: { uid: 'current-user-id', displayName: 'Current User' }
    })

    renderProfilePage('other-user-id')

    expect(screen.getByText('Seguir')).toBeInTheDocument()
  })

  it('shows unfollow button when already following', () => {
    const mockProfile = {
      uid: 'other-user-id',
      displayName: 'Other User',
      email: 'other@example.com',
    }

    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      stats: null,
      createdEvents: [],
      attendingEvents: [],
      loading: false,
      error: null,
      isFollowingUser: true,
      checkFollowing: jest.fn(),
      toggleFollow: jest.fn(),
    })
    mockUseAuth.mockReturnValue({
      user: { uid: 'current-user-id', displayName: 'Current User' }
    })

    renderProfilePage('other-user-id')

    expect(screen.getByText('Dejar de seguir')).toBeInTheDocument()
  })

  it('shows edit profile button for own profile', () => {
    const mockProfile = {
      uid: 'current-user-id',
      displayName: 'Current User',
      email: 'current@example.com',
    }

    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      stats: null,
      createdEvents: [],
      attendingEvents: [],
      loading: false,
      error: null,
      isFollowingUser: false,
      checkFollowing: jest.fn(),
      toggleFollow: jest.fn(),
    })
    mockUseAuth.mockReturnValue({
      user: { uid: 'current-user-id', displayName: 'Current User' }
    })

    renderProfilePage('current-user-id')

    expect(screen.getByText('Editar perfil')).toBeInTheDocument()
  })

  it('displays created events in the events tab', () => {
    const mockProfile = {
      uid: 'test-user-id',
      displayName: 'Test User',
    }

    const mockCreatedEvents = [
      {
        id: 'event-1',
        title: 'Test Event 1',
        category: 'Música',
        date: '2024-12-25',
        attendees: 10,
      },
      {
        id: 'event-2',
        title: 'Test Event 2',
        category: 'Deporte',
        date: '2024-12-26',
        attendees: 15,
      },
    ]

    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      stats: null,
      createdEvents: mockCreatedEvents,
      attendingEvents: [],
      loading: false,
      error: null,
      isFollowingUser: false,
      checkFollowing: jest.fn(),
      toggleFollow: jest.fn(),
    })
    mockUseAuth.mockReturnValue({ user: null })

    renderProfilePage('test-user-id')

    expect(screen.getByText('Eventos creados (2)')).toBeInTheDocument()
    expect(screen.getByText('Test Event 1')).toBeInTheDocument()
    expect(screen.getByText('Test Event 2')).toBeInTheDocument()
  })

  it('shows empty state when user has no created events', () => {
    const mockProfile = {
      uid: 'test-user-id',
      displayName: 'Test User',
    }

    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      stats: null,
      createdEvents: [],
      attendingEvents: [],
      loading: false,
      error: null,
      isFollowingUser: false,
      checkFollowing: jest.fn(),
      toggleFollow: jest.fn(),
    })
    mockUseAuth.mockReturnValue({ user: null })

    renderProfilePage('test-user-id')

    expect(screen.getByText('No hay eventos creados')).toBeInTheDocument()
  })

  it('calls toggleFollow when follow button is clicked', async () => {
    const mockToggleFollow = jest.fn()
    const mockProfile = {
      uid: 'other-user-id',
      displayName: 'Other User',
    }

    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      stats: null,
      createdEvents: [],
      attendingEvents: [],
      loading: false,
      error: null,
      isFollowingUser: false,
      checkFollowing: jest.fn(),
      toggleFollow: mockToggleFollow,
    })
    mockUseAuth.mockReturnValue({
      user: { uid: 'current-user-id', displayName: 'Current User' }
    })

    renderProfilePage('other-user-id')

    const followButton = screen.getByText('Seguir')
    await userEvent.click(followButton)

    expect(mockToggleFollow).toHaveBeenCalledWith('current-user-id')
  })
})
