import { useState, useEffect, useCallback } from 'react';
import { theaterService, eventService, subscriptionService, notificationHistoryService, SubscriptionResponse, NotificationHistoryResponse } from './services';
import { MovieEvent, Theater } from './mockData';

// Use mock data flag - set to false to use real API
const USE_MOCK_DATA = false;

export function useTheaters(brand?: string) {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTheaters = async () => {
      if (USE_MOCK_DATA) {
        // Import mock data only when needed
        const { mockTheaters } = await import('./mockData');
        setTheaters(mockTheaters);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await theaterService.getAllTheaters(brand);
        setTheaters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch theaters');
        console.error('Error fetching theaters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, [brand]);

  return { theaters, loading, error };
}

export function useNearbyTheaters(lat?: number, lng?: number, radius?: number) {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === undefined || lng === undefined) {
      setLoading(false);
      return;
    }

    const fetchNearbyTheaters = async () => {
      if (USE_MOCK_DATA) {
        const { mockTheaters } = await import('./mockData');
        setTheaters(mockTheaters);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await theaterService.getNearbyTheaters(lat, lng, radius);
        setTheaters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch nearby theaters');
        console.error('Error fetching nearby theaters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyTheaters();
  }, [lat, lng, radius]);

  return { theaters, loading, error };
}

export function useTheater(id?: string) {
  const [theater, setTheater] = useState<Theater | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchTheater = async () => {
      if (USE_MOCK_DATA) {
        const { mockTheaters } = await import('./mockData');
        const foundTheater = mockTheaters.find(t => t.id === id);
        setTheater(foundTheater || null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await theaterService.getTheaterById(id);
        setTheater(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch theater');
        console.error('Error fetching theater:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheater();
  }, [id]);

  return { theater, loading, error };
}

export function useEvents() {
  const [events, setEvents] = useState<MovieEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (USE_MOCK_DATA) {
      const { mockEvents } = await import('./mockData');
      setEvents(mockEvents);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, loading, error, refetch };
}

export function useNearbyEvents(lat?: number, lng?: number, radius?: number) {
  const [events, setEvents] = useState<MovieEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (lat === undefined || lng === undefined) {
      setLoading(false);
      return;
    }

    if (USE_MOCK_DATA) {
      const { mockEvents } = await import('./mockData');
      setEvents(mockEvents);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getNearbyEvents(lat, lng, radius);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nearby events');
      console.error('Error fetching nearby events:', err);
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, loading, error, refetch };
}

export function useEvent(id?: string, lat?: number, lng?: number, radius?: number) {
  const [event, setEvent] = useState<MovieEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      if (USE_MOCK_DATA) {
        const { mockEvents } = await import('./mockData');
        const foundEvent = mockEvents.find(e => e.id === id);
        setEvent(foundEvent || null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await eventService.getEventById(id, lat, lng, radius);
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, lat, lng, radius]);

  return { event, loading, error };
}

export function useSearchEvents(movieTitle?: string) {
  const [events, setEvents] = useState<MovieEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (title: string) => {
    if (!title) {
      setEvents([]);
      return;
    }

    if (USE_MOCK_DATA) {
      const { mockEvents } = await import('./mockData');
      const filtered = mockEvents.filter(e =>
        e.title.toLowerCase().includes(title.toLowerCase())
      );
      setEvents(filtered);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await eventService.searchByMovieTitle(title);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search events');
      console.error('Error searching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (movieTitle) {
      search(movieTitle);
    }
  }, [movieTitle, search]);

  return { events, loading, error, search };
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [subscribedTheaterIds, setSubscribedTheaterIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [subs, ids] = await Promise.all([
        subscriptionService.getMySubscriptions(),
        subscriptionService.getSubscribedTheaterIds(),
      ]);
      setSubscriptions(subs);
      setSubscribedTheaterIds(ids);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const subscribe = useCallback(async (theaterId: string) => {
    try {
      const newSub = await subscriptionService.subscribe(theaterId);
      setSubscriptions(prev => [...prev, newSub]);
      setSubscribedTheaterIds(prev => new Set([...prev, theaterId]));
      return true;
    } catch (err) {
      console.error('Error subscribing:', err);
      throw err;
    }
  }, []);

  const unsubscribe = useCallback(async (theaterId: string) => {
    try {
      await subscriptionService.unsubscribe(theaterId);
      setSubscriptions(prev => prev.filter(s => s.theaterId !== theaterId));
      setSubscribedTheaterIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(theaterId);
        return newSet;
      });
      return true;
    } catch (err) {
      console.error('Error unsubscribing:', err);
      throw err;
    }
  }, []);

  return {
    subscriptions,
    subscribedTheaterIds,
    loading,
    error,
    subscribe,
    unsubscribe,
    refetch: fetchSubscriptions,
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationHistoryResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, count] = await Promise.all([
        notificationHistoryService.getNotifications(),
        notificationHistoryService.getUnreadCount(),
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationHistoryService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationHistoryService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refetch: fetchNotifications,
    fetchUnreadCount,
  };
}
