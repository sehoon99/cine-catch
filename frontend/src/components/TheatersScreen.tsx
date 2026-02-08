import { useState, useMemo } from 'react';
import { MapPin, List, Map as MapIcon, Navigation } from 'lucide-react';
import { useTheaters } from '../lib/hooks';
import { useGeolocation } from '../lib/useGeolocation';
import { calculateDistance } from '../lib/distance';
import { Slider } from './ui/slider';
import { KakaoMap } from './KakaoMap';
import type { Theater } from '../lib/mockData';

// 거리 정보가 포함된 극장 타입
interface TheaterWithDistance extends Theater {
  calculatedDistance: number;
}

type ViewMode = 'map' | 'list';

interface TheaterClickInfo {
  id: string;
  name: string;
  brand: string;
  address: string;
  distance: number;
}

interface TheatersScreenProps {
  onTheaterClick?: (theater: TheaterClickInfo) => void;
}

export function TheatersScreen({ onTheaterClick }: TheatersScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [radius, setRadius] = useState([5]);

  const { theaters, loading, error } = useTheaters();

  // 현재 위치 가져오기
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();

  // 현재 위치 또는 기본값 (서울 시청)
  const currentLocation = {
    lat: latitude ?? 37.5665,
    lng: longitude ?? 126.978,
  };

  // 현재 위치 기준으로 각 극장의 거리 계산 + 필터링 + 정렬
  const nearbyTheaters = useMemo((): TheaterWithDistance[] => {
    return theaters
      .map((theater) => ({
        ...theater,
        // 실제 거리 계산 (현재 위치 → 극장)
        calculatedDistance: calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          theater.lat,
          theater.lng
        ),
      }))
      .filter((theater) => theater.calculatedDistance <= radius[0]) // 반경 내만
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance); // 가까운 순 정렬
  }, [theaters, currentLocation.lat, currentLocation.lng, radius]);

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
        <h1 className="mb-4 text-2xl font-bold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Nearby Theaters</h1>

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

      {/* 위치 상태 표시 */}
      {geoLoading && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Navigation className="w-4 h-4 animate-pulse" />
            <span>현재 위치를 가져오는 중...</span>
          </div>
        </div>
      )}
      {geoError && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Navigation className="w-4 h-4" />
            <span>{geoError} (서울 시청 기준으로 표시)</span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'map' ? (
          <MapView theaters={nearbyTheaters} radius={radius[0]} center={currentLocation} onTheaterClick={onTheaterClick} />
        ) : (
          <ListView theaters={nearbyTheaters} onTheaterClick={onTheaterClick} />
        )}
      </div>
    </div>
  );
}

interface MapViewProps {
  theaters: TheaterWithDistance[];
  radius: number;
  center: { lat: number; lng: number };
  onTheaterClick?: (theater: TheaterClickInfo) => void;
}

function MapView({ theaters, radius, center, onTheaterClick }: MapViewProps) {
  const [selectedTheater, setSelectedTheater] = useState<TheaterWithDistance | null>(null);

  // KakaoMap에 전달할 극장 데이터 변환
  const mapTheaters = theaters.map((theater) => ({
    id: theater.id,
    name: theater.name,
    lat: theater.lat,
    lng: theater.lng,
    address: theater.address,
  }));

  // 마커 클릭 핸들러
  const handleMarkerClick = (theater: { id: string; name: string; lat: number; lng: number }) => {
    const fullTheater = theaters.find((t) => t.id === theater.id);
    if (fullTheater) {
      setSelectedTheater(fullTheater);
    }
  };

  return (
    <div className="relative h-full">
      {/* 실제 Kakao Map - 내 위치 + 반경 표시 */}
      <KakaoMap
        theaters={mapTheaters}
        center={center}
        level={7}
        radius={radius}
        showMyLocation={true}
        onMarkerClick={handleMarkerClick}
      />

      {/* 선택된 극장 정보 카드 */}
      {selectedTheater && (
        <div
          className="absolute bottom-4 left-4 right-4 bg-card rounded-2xl p-4 shadow-lg z-10 cursor-pointer hover:bg-accent/10 transition-colors"
          onClick={() => {
            if (onTheaterClick) {
              onTheaterClick({
                id: selectedTheater.id,
                name: selectedTheater.name,
                brand: selectedTheater.brand ?? 'CGV',
                address: selectedTheater.address,
                distance: selectedTheater.calculatedDistance,
              });
            }
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold">{selectedTheater.name} ({selectedTheater.brand ?? 'CGV'})</h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTheater(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{selectedTheater.address}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{selectedTheater.calculatedDistance.toFixed(1)} km</span>
            </div>
            <span className="text-sm text-accent">재고 확인 →</span>
          </div>
        </div>
      )}

      {/* 극장 개수 표시 */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm z-10">
        반경 {radius}km 내 {theaters.length}개 극장
      </div>
    </div>
  );
}

interface ListViewProps {
  theaters: TheaterWithDistance[];
  onTheaterClick?: (theater: TheaterClickInfo) => void;
}

function ListView({ theaters, onTheaterClick }: ListViewProps) {
  const handleClick = (theater: TheaterWithDistance) => {
    if (onTheaterClick) {
      onTheaterClick({
        id: theater.id,
        name: theater.name,
        brand: theater.brand ?? 'CGV',
        address: theater.address,
        distance: theater.calculatedDistance,
      });
    }
  };

  return (
    <div className="overflow-y-auto h-full px-4">
      <div className="space-y-3 pb-4">
        {theaters.map((theater) => (
          <div
            key={theater.id}
            onClick={() => handleClick(theater)}
            className="bg-card rounded-2xl p-4 shadow-sm hover:shadow-md hover:bg-accent/10 transition-all cursor-pointer"
          >
            <div className="flex gap-4">
              {/* Brand Logo */}
              <div className="flex-shrink-0 w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
                <span className="text-lg font-semibold text-accent-foreground">
                  {theater.brand?.charAt(0) ?? 'C'}
                </span>
              </div>

              {/* Theater Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">
                  {theater.name} <span className="text-muted-foreground font-normal">({theater.brand ?? 'CGV'})</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{theater.address}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{theater.calculatedDistance.toFixed(1)} km</span>
                  </div>
                  <span className="text-sm text-accent">재고 확인 →</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {theaters.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>주변에 극장이 없습니다</p>
            <p className="text-sm">검색 반경을 늘려보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
