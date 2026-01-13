import { useState } from 'react';
import { MapPin, List, Map as MapIcon } from 'lucide-react';
import { useTheaters } from '../lib/hooks';
import { Slider } from './ui/slider';
import type { Theater } from '../lib/mockData';

type ViewMode = 'map' | 'list';

export function TheatersScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [radius, setRadius] = useState([5]);

  const { theaters, loading, error } = useTheaters();

  const filteredTheaters = theaters.filter(
    (theater) => theater.distance <= radius[0]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading theaters...</p>
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
        <h1 className="mb-4">Nearby Theaters</h1>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
              viewMode === 'map'
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            <MapIcon className="w-5 h-5" />
            Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            <List className="w-5 h-5" />
            List
          </button>
        </div>

        {/* Radius Slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Search Radius</span>
            <span className="text-sm font-medium">{radius[0]} km</span>
          </div>
          <Slider
            value={radius}
            onValueChange={setRadius}
            min={1}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'map' ? (
          <MapView theaters={filteredTheaters} radius={radius[0]} />
        ) : (
          <ListView theaters={filteredTheaters} />
        )}
      </div>
    </div>
  );
}

function MapView({ theaters, radius }: { theaters: Theater[]; radius: number }) {
  const [selectedTheater, setSelectedTheater] = useState<string | null>(null);

  return (
    <div className="relative h-full">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          {/* Grid pattern to simulate map */}
          <svg className="w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Theater Markers */}
          <div className="absolute inset-0 p-8">
            {theaters.map((theater, index) => {
              // Calculate pseudo-random positions based on lat/lng
              const x = ((theater.lng + 74) * 1000) % 80;
              const y = ((theater.lat - 40.74) * 2000) % 80;

              return (
                <button
                  key={theater.id}
                  onClick={() => setSelectedTheater(theater.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                >
                  <MapPin
                    className={`w-8 h-8 transition-colors ${
                      selectedTheater === theater.id
                        ? 'text-accent fill-accent'
                        : 'text-destructive fill-destructive'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Selected Theater Info Card */}
          {selectedTheater && (
            <div className="absolute bottom-4 left-4 right-4 bg-card rounded-2xl p-4 shadow-lg">
              {(() => {
                const theater = theaters.find((t) => t.id === selectedTheater);
                if (!theater) return null;
                return (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3>{theater.name}</h3>
                        <p className="text-sm text-muted-foreground">{theater.brand}</p>
                      </div>
                      <button
                        onClick={() => setSelectedTheater(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{theater.address}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{theater.distance} km away</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Radius Indicator */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
        Showing {theaters.length} theater{theaters.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

function ListView({ theaters }: { theaters: Theater[] }) {
  return (
    <div className="overflow-y-auto h-full px-4">
      <div className="space-y-3 pb-4">
        {theaters.map((theater) => (
          <div
            key={theater.id}
            className="bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              {/* Brand Logo Placeholder */}
              <div className="flex-shrink-0 w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
                <span className="text-lg font-semibold text-accent-foreground">
                  {theater.brand.charAt(0)}
                </span>
              </div>

              {/* Theater Info */}
              <div className="flex-1 min-w-0">
                <h3 className="mb-1">{theater.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{theater.address}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{theater.distance} km away</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {theaters.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No theaters found in this radius</p>
            <p className="text-sm">Try increasing the search radius</p>
          </div>
        )}
      </div>
    </div>
  );
}
