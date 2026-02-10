import { apiClient, API_ENDPOINTS } from './api';
import { MovieEvent, Theater } from './mockData';

// API Response types matching backend DTOs
export interface TheaterResponse {
  id: string;
  name: string;
  brand: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface SubscriptionResponse {
  id: string;
  theaterId: string;
  theaterName: string;
  brand: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  subscribedAt: string;
}

export interface EventResponse {
  eventId: string;
  movieTitle: string;
  goodsTitle: string;
  imageUrl: string | null;
  startAt: string | null;
  endAt: string | null;
  theaters: TheaterInventoryResponse[];
}

export interface TheaterEventResponse {
  eventId: string;
  title: string;
  movieTitle: string;
  type: string;
  status: string;
  imageUrl: string | null;
  startAt: string;
  endAt: string;
}

export interface TheaterInventoryResponse {
  theaterId: string | null;
  theaterName: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
}

// Theater Services
export const theaterService = {
  async getAllTheaters(brand?: string): Promise<Theater[]> {
    const url = brand ? `${API_ENDPOINTS.THEATERS}?brand=${brand}` : API_ENDPOINTS.THEATERS;
    const response = await apiClient.get<TheaterResponse[]>(url);
    return response.map(mapTheaterResponseToTheater);
  },

  async getNearbyTheaters(lat: number, lng: number, radius?: number): Promise<Theater[]> {
    let url = `${API_ENDPOINTS.THEATERS_NEARBY}?lat=${lat}&lng=${lng}`;
    if (radius) {
      url += `&radius=${radius}`;
    }
    const response = await apiClient.get<TheaterResponse[]>(url);
    return response.map(mapTheaterResponseToTheater);
  },

  async getTheaterById(id: string): Promise<Theater> {
    const response = await apiClient.get<TheaterResponse>(API_ENDPOINTS.THEATER_BY_ID(id));
    return mapTheaterResponseToTheater(response);
  },
};

// Event Services
export const eventService = {
  async getAllEvents(): Promise<MovieEvent[]> {
    const response = await apiClient.get<EventResponse[]>(API_ENDPOINTS.EVENTS);
    return response.map(mapEventResponseToMovieEvent);
  },

  async getNearbyEvents(lat: number, lng: number, radius?: number): Promise<MovieEvent[]> {
    let url = `${API_ENDPOINTS.EVENTS_NEARBY}?lat=${lat}&lng=${lng}`;
    if (radius) {
      url += `&radius=${radius}`;
    }
    const response = await apiClient.get<EventResponse[]>(url);
    return response.map(mapEventResponseToMovieEvent);
  },

  async getEventById(id: string, lat?: number, lng?: number, radius?: number): Promise<MovieEvent> {
    let url = API_ENDPOINTS.EVENT_BY_ID(id);
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lng !== undefined) params.append('lng', lng.toString());
    if (radius !== undefined) params.append('radius', radius.toString());

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await apiClient.get<EventResponse>(url);
    return mapEventResponseToMovieEvent(response);
  },

  async searchByMovieTitle(movieTitle: string): Promise<MovieEvent[]> {
    const url = `${API_ENDPOINTS.EVENTS}?movieTitle=${encodeURIComponent(movieTitle)}`;
    const response = await apiClient.get<EventResponse[]>(url);
    return response.map(mapEventResponseToMovieEvent);
  },

  async getEventsByTheater(theaterId: string): Promise<TheaterEventResponse[]> {
    return apiClient.get<TheaterEventResponse[]>(API_ENDPOINTS.EVENTS_BY_THEATER(theaterId));
  },
};

// Mapper functions
function mapTheaterResponseToTheater(response: TheaterResponse): Theater {
  return {
    id: response.id,
    name: response.name,
    brand: response.brand,
    address: response.address,
    distance: 0, // Backend doesn't provide distance, needs to be calculated on client side
    lat: response.latitude || 0,
    lng: response.longitude || 0,
    subscribed: false, // Default value, can be updated based on user subscriptions
  };
}

function mapEventResponseToMovieEvent(response: EventResponse): MovieEvent {
  // Determine type based on status text (임시 로직)
  const hasAvailableTheater = response.theaters.some(
    t => t.status.includes('보유') || t.status.includes('신청')
  );

  return {
    id: response.eventId,
    title: response.movieTitle,
    posterUrl: response.imageUrl || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    type: determineEventType(response.goodsTitle),
    distance: 0, // Backend doesn't provide distance
    available: hasAvailableTheater,
    theaters: response.theaters.map(t => mapTheaterInventoryToTheaterAvailability(t)),
    description: response.goodsTitle,
    date: formatEventDate(response.startAt, response.endAt),
    time: formatEventTime(response.startAt),
  };
}

function mapTheaterInventoryToTheaterAvailability(
  inventory: TheaterInventoryResponse
) {
  const isAvailable = inventory.status.includes('보유') ||
                      inventory.status.includes('신청') ||
                      !inventory.status.includes('마감');

  return {
    theaterId: inventory.theaterId || '',
    theaterName: inventory.theaterName,
    brand: '',
    address: inventory.address || '',
    distance: 0,
    available: isAvailable,
    lat: inventory.latitude || 0,
    lng: inventory.longitude || 0,
  };
}

function formatEventDate(startAt: string | null, endAt: string | null): string {
  if (!startAt || !endAt) return '날짜 미정';
  const start = new Date(startAt);
  const end = new Date(endAt);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(start)} ~ ${fmt(end)}`;
}

function formatEventTime(startAt: string | null): string {
  if (!startAt) return '';
  const d = new Date(startAt);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} 시작`;
}

function determineEventType(goodsTitle: string): 'Goods' | 'Coupon' | 'GV' {
  const title = goodsTitle.toLowerCase();

  if (title.includes('gv') || title.includes('관람')) {
    return 'GV';
  }
  if (title.includes('할인') || title.includes('쿠폰')) {
    return 'Coupon';
  }
  return 'Goods';
}

// Subscription Services
export const subscriptionService = {
  async getMySubscriptions(): Promise<SubscriptionResponse[]> {
    return apiClient.get<SubscriptionResponse[]>(API_ENDPOINTS.SUBSCRIPTIONS);
  },

  async getSubscribedTheaterIds(): Promise<Set<string>> {
    const ids = await apiClient.get<string[]>(`${API_ENDPOINTS.SUBSCRIPTIONS}/theater-ids`);
    return new Set(ids);
  },

  async subscribe(theaterId: string): Promise<SubscriptionResponse> {
    return apiClient.post<SubscriptionResponse>(API_ENDPOINTS.SUBSCRIPTIONS, { theaterId });
  },

  async unsubscribe(theaterId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.SUBSCRIPTION_BY_ID(theaterId));
  },
};

// Notification Settings Service
export const notificationSettingsService = {
  async get(): Promise<boolean> {
    const response = await apiClient.get<{ enabled: boolean }>(API_ENDPOINTS.MEMBERS_NOTIFICATION_SETTINGS);
    return response.enabled;
  },

  async update(enabled: boolean): Promise<void> {
    await apiClient.put<string>(API_ENDPOINTS.MEMBERS_NOTIFICATION_SETTINGS, { enabled });
  },
};

// Notification History Service
export interface NotificationHistoryResponse {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationHistoryService = {
  async getNotifications(): Promise<NotificationHistoryResponse[]> {
    return apiClient.get<NotificationHistoryResponse[]>(API_ENDPOINTS.NOTIFICATIONS);
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put<string>(API_ENDPOINTS.NOTIFICATION_READ(id));
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
    return response.count;
  },
};

// Favorite Services
export const favoriteService = {
  async getFavoriteEventIds(): Promise<Set<string>> {
    const ids = await apiClient.get<string[]>(API_ENDPOINTS.FAVORITE_EVENT_IDS);
    return new Set(ids);
  },

  async addFavorite(eventId: string): Promise<void> {
    return apiClient.post<void>(API_ENDPOINTS.FAVORITE_BY_EVENT_ID(eventId), {});
  },

  async removeFavorite(eventId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.FAVORITE_BY_EVENT_ID(eventId));
  },
};
