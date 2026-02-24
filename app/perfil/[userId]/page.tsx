import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProfilePage } from '@/components/profile/profile-page'
import { getUserProfile } from '@/lib/firebase/users'

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { userId: string }
}): Promise<Metadata> {
  try {
    const user = await getUserProfile(params.userId)

    if (!user) {
      return {
        title: 'Usuario no encontrado',
      }
    }

    return {
      title: `${user.displayName || 'Usuario'} - Juntapp`,
      description: user.bio || `Perfil de ${user.displayName || 'usuario'} en Juntapp`,
      openGraph: {
        title: `${user.displayName || 'Usuario'} - Juntapp`,
        description: user.bio || `Perfil de ${user.displayName || 'usuario'} en Juntapp`,
        images: user.photoURL ? [{ url: user.photoURL }] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Perfil de usuario - Juntapp',
    }
  }
}

interface ProfilePageProps {
  params: {
    userId: string
  }
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  return <ProfilePage userId={params.userId} />
}
