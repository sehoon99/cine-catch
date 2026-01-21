import { useState, useEffect, useMemo } from 'react';
import { Heart, MapPin, Bell, BellOff, LogIn, Loader2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { useSubscriptions, useNearbyTheaters } from '../lib/hooks';
import { getAuthState, isAuthValid } from '../lib/auth';
import { SubscriptionResponse } from '../lib/services';
import type { Theater } from '../lib/mockData';

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function SubscriptionsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    subscriptions,
    subscribedTheaterIds,
    loading: subscriptionsLoading,
    subscribe,
    unsubscribe,
  } = useSubscriptions();

  const { theaters: nearbyTheaters, loading: theatersLoading } = useNearbyTheaters(
    userLocation?.lat,
    userLocation?.lng,
    50000
  );

  useEffect(() => {
    const authState = getAuthState();
    setIsLoggedIn(isAuthValid(authState));
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  const sortedSubscriptions = useMemo(() => {
    if (!userLocation) return subscriptions;

    return [...subscriptions].sort((a, b) => {
      const distA = a.latitude && a.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude)
        : Infinity;
      const distB = b.latitude && b.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
        : Infinity;
      return distA - distB;
    });
  }, [subscriptions, userLocation]);

  const sortedNonSubscribedTheaters = useMemo(() => {
    return nearbyTheaters
      .filter((t) => !subscribedTheaterIds.has(t.id))
      .map((t) => ({
        ...t,
        distance: userLocation
          ? calculateDistance(userLocation.lat, userLocation.lng, t.lat, t.lng)
          : 0,
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [nearbyTheaters, subscribedTheaterIds, userLocation]);

  const toggleSubscription = async (theaterId: string, isCurrentlySubscribed: boolean) => {
    if (!isLoggedIn) {
      toast.error('Please log in to subscribe to theaters');
      return;
    }

    try {
      if (isCurrentlySubscribed) {
        await unsubscribe(theaterId);
        toast.info('Unsubscribed from theater');
      } else {
        await subscribe(theaterId);
        toast.success('Subscribed to theater', {
          description: "You'll receive notifications for new events",
        });
      }
    } catch {
      toast.error('Failed to update subscription');
    }
  };

  const handleNotificationToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    if (checked) {
      toast.success('Notifications enabled');
    } else {
      toast.info('Notifications disabled');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <LogIn className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
        <h3 className="mb-2">Login Required</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Please log in to manage your theater subscriptions
        </p>
      </div>
    );
  }

  const isLoading = subscriptionsLoading || theatersLoading;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h1 className="mb-4">Subscriptions</h1>

        <div className="bg-card rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-accent-foreground" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <h3>Event Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Get alerts for subscribed theaters
                </p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : sortedSubscriptions.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground mb-2">
              {sortedSubscriptions.length} Subscribed Theater
              {sortedSubscriptions.length !== 1 ? 's' : ''}
            </h3>
            {sortedSubscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                distance={
                  userLocation && sub.latitude && sub.longitude
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        sub.latitude,
                        sub.longitude
                      )
                    : undefined
                }
                isSubscribed={true}
                onToggle={() => toggleSubscription(sub.theaterId, true)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="mb-2">No Subscriptions Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Subscribe to theaters to get notifications about new events and exclusive offers
            </p>
          </div>
        )}

        {sortedNonSubscribedTheaters.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm text-muted-foreground mb-2">Nearby Theaters</h3>
            <div className="space-y-3">
              {sortedNonSubscribedTheaters.map((theater) => (
                <TheaterCard
                  key={theater.id}
                  theater={theater}
                  isSubscribed={false}
                  onToggle={() => toggleSubscription(theater.id, false)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SubscriptionCard({
  subscription,
  distance,
  isSubscribed,
  onToggle,
}: {
  subscription: SubscriptionResponse;
  distance?: number;
  isSubscribed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
          <span className="text-lg font-semibold text-accent-foreground">
            {subscription.brand.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="line-clamp-1">{subscription.theaterName}</h3>
            <button
              onClick={onToggle}
              className="flex-shrink-0 p-1 ml-2"
              aria-label={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isSubscribed
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {subscription.address}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{distance !== undefined ? `${distance.toFixed(1)} km away` : 'Distance unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TheaterCard({
  theater,
  isSubscribed,
  onToggle,
}: {
  theater: Theater & { distance: number };
  isSubscribed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
          <span className="text-lg font-semibold text-accent-foreground">
            {theater.brand.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="line-clamp-1">{theater.name}</h3>
            <button
              onClick={onToggle}
              className="flex-shrink-0 p-1 ml-2"
              aria-label={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isSubscribed
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {theater.address}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{theater.distance.toFixed(1)} km away</span>
          </div>
        </div>
      </div>
    </div>
  );
}