import { useState } from 'react';
import { Heart, MapPin, Bell, BellOff } from 'lucide-react';
import { mockTheaters, type Theater } from '../lib/mockData';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

export function SubscriptionsScreen() {
  const [theaters, setTheaters] = useState(mockTheaters);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleSubscription = (theaterId: string) => {
    const theater = theaters.find((t) => t.id === theaterId);
    const wasSubscribed = theater?.subscribed;
    
    setTheaters((prev) =>
      prev.map((theater) =>
        theater.id === theaterId
          ? { ...theater, subscribed: !theater.subscribed }
          : theater
      )
    );
    
    if (wasSubscribed) {
      toast.info('Unsubscribed from theater');
    } else {
      toast.success('Subscribed to theater', {
        description: 'You\'ll receive notifications for new events',
      });
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

  const subscribedTheaters = theaters.filter((t) => t.subscribed);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 pb-2">
        <h1 className="mb-4">Subscriptions</h1>

        {/* Notification Settings */}
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

      {/* Subscribed Theaters List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {subscribedTheaters.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm text-muted-foreground mb-2">
              {subscribedTheaters.length} Subscribed Theater
              {subscribedTheaters.length !== 1 ? 's' : ''}
            </h3>
            {subscribedTheaters.map((theater) => (
              <TheaterSubscriptionCard
                key={theater.id}
                theater={theater}
                onToggle={() => toggleSubscription(theater.id)}
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

        {/* All Theaters Section */}
        <div className="mt-6">
          <h3 className="text-sm text-muted-foreground mb-2">All Theaters</h3>
          <div className="space-y-3">
            {theaters
              .filter((t) => !t.subscribed)
              .map((theater) => (
                <TheaterSubscriptionCard
                  key={theater.id}
                  theater={theater}
                  onToggle={() => toggleSubscription(theater.id)}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TheaterSubscriptionCard({
  theater,
  onToggle,
}: {
  theater: Theater;
  onToggle: () => void;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex gap-4">
        {/* Brand Logo Placeholder */}
        <div className="flex-shrink-0 w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
          <span className="text-lg font-semibold text-accent-foreground">
            {theater.brand.charAt(0)}
          </span>
        </div>

        {/* Theater Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="line-clamp-1">{theater.name}</h3>
            <button
              onClick={onToggle}
              className="flex-shrink-0 p-1 ml-2"
              aria-label={theater.subscribed ? 'Unsubscribe' : 'Subscribe'}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  theater.subscribed
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
            <span>{theater.distance} km away</span>
          </div>
        </div>
      </div>
    </div>
  );
}