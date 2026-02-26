import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './client';
import type { Event } from './events';
import type { UserProfile } from './users';

// Re-export types
export type { Event } from './events';
export type { UserProfile } from './users';

// Get all users (for community page)
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    console.log('👥 Fetching all users for community...');

    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastLogin: doc.data().lastLogin?.toDate(),
    })) as UserProfile[];

    console.log(`✅ Found ${users.length} users in community`);
    return users;
  } catch (error) {
    console.error('❌ Error fetching users for community:', error);
    return [];
  }
}

// Get all events (for community page) - using same function as homepage
export async function getAllEvents(): Promise<Event[]> {
  try {
    console.log('📅 Fetching all events for community...');

    // Import and use the same getEvents function as homepage
    const { getEvents } = await import('./events');
    const events = await getEvents();

    console.log(`✅ Found ${events.length} events in community`);
    return events;
  } catch (error) {
    console.error('❌ Error fetching events for community:', error);
    return [];
  }
}

// Get community stats
export async function getCommunityStats() {
  try {
    const [users, events] = await Promise.all([
      getAllUsers(),
      getAllEvents()
    ]);

    const stats = {
      totalUsers: users.length,
      totalEvents: events.length,
      activeUsers: users.filter(user => {
        const userEvents = events.filter(event => event.createdBy === user.uid);
        return userEvents.length > 0;
      }).length,
      totalAttendees: events.reduce((sum, event) => sum + (Number(event.attendees) || 0), 0),
      recentEvents: events.slice(0, 5), // Last 5 events
      topOrganizers: users
        .map(user => ({
          ...user,
          eventCount: events.filter(event => event.createdBy === user.uid).length,
          totalAttendees: events
            .filter(event => event.createdBy === user.uid)
            .reduce((sum, event) => sum + (Number(event.attendees) || 0), 0)
        }))
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, 5)
    };

    return stats;
  } catch (error) {
    console.error('❌ Error getting community stats:', error);
    return {
      totalUsers: 0,
      totalEvents: 0,
      activeUsers: 0,
      totalAttendees: 0,
      recentEvents: [],
      topOrganizers: []
    };
  }
}
