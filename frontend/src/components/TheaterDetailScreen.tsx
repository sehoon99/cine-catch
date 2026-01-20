import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Package, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { eventService, TheaterEventResponse } from '../lib/services';

interface TheaterInfo {
  id: string;
  name: string;
  brand: string;
  address: string;
  distance: number;
}

interface TheaterDetailScreenProps {
  theater: TheaterInfo;
  onBack: () => void;
}

interface TheaterEvent {
  id: string;
  title: string;
  type: string;
  status: string;
  endAt: string;
}

export function TheaterDetailScreen({ theater, onBack }: TheaterDetailScreenProps) {
  const [events, setEvents] = useState<TheaterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await eventService.getEventsByTheater(theater.id);
        const mapped = response.map((event: TheaterEventResponse) => ({
          id: event.eventId,
          title: event.title,
          type: event.type,
          status: event.status,
          endAt: event.endAt,
        }));
        if (isMounted) {
          setEvents(mapped);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch theater events');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, [theater.id]);

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    const isSoldOut = status.includes('마감') || status.includes('종료') || normalized.includes('sold');
    const isAvailable = status.includes('보유') || status.includes('신청') || normalized.includes('available');

    if (isSoldOut) {
      return <Badge variant="destructive" className="rounded-lg">마감</Badge>;
    }
    if (isAvailable) {
      return <Badge variant="default" className="rounded-lg bg-green-600">재고 있음</Badge>;
    }
    return <Badge variant="secondary" className="rounded-lg">확인 필요</Badge>;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'GOODS':
        return <Badge variant="outline" className="rounded-lg">굿즈</Badge>;
      case 'GV':
        return <Badge variant="outline" className="rounded-lg">GV</Badge>;
      case 'COUPON':
        return <Badge variant="outline" className="rounded-lg">쿠폰</Badge>;
      default:
        return <Badge variant="outline" className="rounded-lg">{type}</Badge>;
    }
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString('ko-KR');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold">{theater.name}</h2>
          <p className="text-sm text-muted-foreground">{theater.brand}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Theater Info Card */}
        <div className="bg-card rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">주소</p>
              <p>{theater.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">거리</p>
              <p>{theater.distance.toFixed(1)} km</p>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-card rounded-2xl p-4">
          <h3 className="font-semibold mb-3">진행 중인 이벤트</h3>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">
              이벤트 정보를 불러오는 중...
            </p>
          ) : error ? (
            <p className="text-destructive text-center py-8">
              {error}
            </p>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              현재 진행 중인 이벤트가 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-3 p-3 bg-secondary/50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeBadge(event.type)}
                      <span className="text-xs text-muted-foreground">
                        ~{formatDate(event.endAt)}
                      </span>
                    </div>
                    <h4 className="font-medium">{event.title}</h4>
                  </div>
                  {getStatusBadge(event.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* External Link */}
        <div className="mt-4">
          <a
            href={`https://www.cgv.co.kr/theaters/?theaterCode=${theater.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            CGV 사이트에서 보기
          </a>
        </div>
      </div>
    </div>
  );
}
