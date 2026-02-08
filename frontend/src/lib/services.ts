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
  theaterName: string;
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
    date: 'Available now', // Backend doesn't provide dates yet
    time: 'Check theater for times',
  };
}

function mapTheaterInventoryToTheaterAvailability(
  inventory: TheaterInventoryResponse
) {
  const isAvailable = inventory.status.includes('보유') ||
                      inventory.status.includes('신청') ||
                      !inventory.status.includes('마감');

  return {
    theaterId: '', // Not provided by backend
    theaterName: inventory.theaterName,
    brand: '', // Not provided by backend
    address: '', // Not provided by backend
    distance: 0, // Not provided by backend
    available: isAvailable,
    lat: 0,
    lng: 0,
  };
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
