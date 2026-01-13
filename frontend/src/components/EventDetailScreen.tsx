import { ArrowLeft, MapPin, Calendar, Clock } from 'lucide-react';
import { useEvent } from '../lib/hooks';
import { Badge } from './ui/badge';

interface EventDetailScreenProps {
  eventId: string;
  onBack: () => void;
}

export function EventDetailScreen({ eventId, onBack }: EventDetailScreenProps) {
  const { event, loading, error } = useEvent(eventId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2>Event Details</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Image */}
        <div className="relative w-full h-80 bg-muted">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Event Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2 mb-2">
              <Badge
                variant={event.type === 'GV' ? 'default' : event.type === 'Coupon' ? 'secondary' : 'outline'}
                className="rounded-lg"
              >
                {event.type}
              </Badge>
            </div>
            <h1 className="text-2xl mb-1">{event.title}</h1>
          </div>
        </div>

        {/* Event Info */}
        <div className="p-4">
          <div className="bg-card rounded-2xl p-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{event.date}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p>{event.time}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nearest Location</p>
                  <p>{event.distance} km away</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card rounded-2xl p-4 mb-4">
            <h3 className="mb-2">About this Event</h3>
            <p className="text-muted-foreground">{event.description}</p>
          </div>

          {/* Available Theaters */}
          <div className="bg-card rounded-2xl p-4">
            <h3 className="mb-3">Available Theaters</h3>
            <div className="space-y-3">
              {event.theaters.map((theater) => (
                <div
                  key={theater.theaterId}
                  className="flex items-start justify-between gap-4 pb-3 last:pb-0 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-1">{theater.theaterName}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {theater.address}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{theater.distance} km</span>
                    </div>
                  </div>
                  
                  <Badge
                    variant={theater.available ? 'default' : 'destructive'}
                    className={`flex-shrink-0 rounded-lg ${
                      theater.available ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                  >
                    {theater.available ? 'Available' : 'Sold Out'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
