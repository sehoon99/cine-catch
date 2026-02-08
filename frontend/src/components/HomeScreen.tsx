import { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import { type MovieEvent } from '../lib/mockData';
import { useEvents } from '../lib/hooks';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface HomeScreenProps {
  onEventClick: (eventId: string) => void;
}

type FilterType = 'All' | 'Goods' | 'Coupon' | 'GV';

export function HomeScreen({ onEventClick }: HomeScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { events, loading, error } = useEvents();

  const toggleFavorite = (eventId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId);
      toast.info('Removed from favorites');
    } else {
      newFavorites.add(eventId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  const filteredEvents = events.filter((event) => {
    const matchesFilter = activeFilter === 'All' || event.type === activeFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading events...</p>
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 pb-2">
        <h1 className="mb-4 text-2xl font-bold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Cine-Catch</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-secondary text-foreground rounded-lg outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {(['All', 'Goods', 'Coupon', 'GV'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isFavorite={favorites.has(event.id)}
              onToggleFavorite={() => toggleFavorite(event.id)}
              onClick={() => onEventClick(event.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event,
  isFavorite,
  onToggleFavorite,
  onClick,
}: {
  event: MovieEvent;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex gap-4 p-4">
        {/* Movie Poster */}
        <div className="flex-shrink-0 w-24 h-36 bg-muted rounded-xl overflow-hidden">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Event Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="line-clamp-2">{event.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="flex-shrink-0 p-1"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-2 mb-2">
              <Badge
                variant={event.type === 'GV' ? 'default' : event.type === 'Coupon' ? 'secondary' : 'outline'}
                className="rounded-lg"
              >
                {event.type}
              </Badge>
              <Badge
                variant={event.available ? 'default' : 'destructive'}
                className={`rounded-lg ${
                  event.available ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
              >
                {event.available ? 'Available' : 'Sold Out'}
              </Badge>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}