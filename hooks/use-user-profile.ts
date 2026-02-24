import { useState, useEffect } from 'react';
import {
  getUserProfile,
  getUserStats,
  getUserCreatedEvents,
  getUserAttendingEvents,
  isFollowing,
  toggleFollow,
  updateUserProfile,
  type UserProfile,
  type UserStats
} from '@/lib/firebase/users';
import { type Event } from '@/lib/firebase/events';

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [profileData, statsData, createdEventsData, attendingEventsData] = await Promise.all([
        getUserProfile(userId),
        getUserStats(userId),
        getUserCreatedEvents(userId),
        getUserAttendingEvents(userId),
      ]);

      if (!profileData) {
        setError('Usuario no encontrado');
        return;
      }

      setProfile(profileData);
      setStats(statsData);
      setCreatedEvents(createdEventsData);
      setAttendingEvents(attendingEventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowing = async (currentUserId: string) => {
    if (currentUserId && userId !== currentUserId) {
      try {
        const following = await isFollowing(currentUserId, userId);
        setIsFollowingUser(following);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    }
  };

  const handleToggleFollow = async (currentUserId: string) => {
    try {
      const nowFollowing = await toggleFollow(currentUserId, userId);
      setIsFollowingUser(nowFollowing);

      // Actualizar estadísticas
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          totalFollowers: nowFollowing
            ? prev.totalFollowers + 1
            : Math.max(0, prev.totalFollowers - 1)
        } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const success = await updateUserProfile(userId, updates);
      if (success && profile) {
        setProfile({ ...profile, ...updates });
      }
      return success;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  return {
    profile,
    stats,
    createdEvents,
    attendingEvents,
    loading,
    error,
    isFollowingUser,
    checkFollowing,
    toggleFollow: handleToggleFollow,
    updateProfile: handleUpdateProfile,
    refetch: loadProfile,
  };
}
