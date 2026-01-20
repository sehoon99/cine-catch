import { useEffect, useRef } from 'react';

interface Theater {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

interface KakaoMapProps {
  theaters: Theater[];
  center?: { lat: number; lng: number };
  level?: number;
  radius?: number;                        // 반경 (km 단위)
  showMyLocation?: boolean;               // 내 위치 마커 표시 여부
  onMarkerClick?: (theater: Theater) => void;
}

/**
 * KakaoMap 컴포넌트
 *
 * @param theaters - 지도에 표시할 극장 목록
 * @param center - 지도 중심 좌표 (현재 위치)
 * @param level - 지도 확대 레벨 (1~14, 숫자가 작을수록 확대)
 * @param radius - 검색 반경 (km 단위)
 * @param showMyLocation - 내 위치 마커 표시 여부
 * @param onMarkerClick - 마커 클릭 시 호출되는 콜백
 */
export function KakaoMap({
  theaters,
  center = { lat: 37.5665, lng: 126.978 },
  level = 7,
  radius = 5,
  showMyLocation = true,
  onMarkerClick,
}: KakaoMapProps) {
  // DOM 요소를 참조하기 위한 ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // 지도 인스턴스를 저장하기 위한 ref
  const mapRef = useRef<kakao.maps.Map | null>(null);
  // 마커들을 저장하기 위한 ref
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  // 내 위치 마커 ref
  const myLocationMarkerRef = useRef<kakao.maps.Marker | null>(null);
  // 반경 원 ref
  const circleRef = useRef<kakao.maps.Circle | null>(null);

  // 1. 지도 초기화 (컴포넌트 마운트 시 1회 실행)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!window.kakao || !window.kakao.maps) {
      console.error('Kakao Maps SDK가 로드되지 않았습니다.');
      return;
    }

    const options: kakao.maps.MapOptions = {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: level,
    };

    const map = new kakao.maps.Map(mapContainerRef.current, options);
    mapRef.current = map;

    console.log('Kakao Map 초기화 완료');

    // cleanup
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      if (myLocationMarkerRef.current) {
        myLocationMarkerRef.current.setMap(null);
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, []);

  // 2. 내 위치 마커 + 반경 원 표시
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showMyLocation) return;

    const position = new kakao.maps.LatLng(center.lat, center.lng);

    // 기존 내 위치 마커 제거
    if (myLocationMarkerRef.current) {
      myLocationMarkerRef.current.setMap(null);
    }

    // 내 위치 마커 이미지 (파란색 원형)
    const markerImage = new kakao.maps.MarkerImage(
      // 파란색 위치 마커 SVG (Data URL)
      'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="3"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `),
      new kakao.maps.Size(24, 24),
      { offset: new kakao.maps.Point(12, 12) }
    );

    // 내 위치 마커 생성
    const myMarker = new kakao.maps.Marker({
      position,
      map,
      title: '내 위치',
      image: markerImage,
    });
    myLocationMarkerRef.current = myMarker;

    // 기존 반경 원 제거
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // 반경 원 생성 (radius는 km 단위이므로 m로 변환)
    const circle = new kakao.maps.Circle({
      center: position,
      radius: radius * 1000,  // km → m 변환
      strokeWeight: 2,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
      map,
    });
    circleRef.current = circle;

    console.log(`내 위치 마커 + 반경 ${radius}km 원 표시`);
  }, [center.lat, center.lng, radius, showMyLocation]);

  // 3. 극장 마커 표시 (theaters가 변경될 때마다 실행)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 기존 극장 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 극장 마커 이미지 (빨간색)
    const theaterMarkerImage = new kakao.maps.MarkerImage(
      'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="#EF4444"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>
      `),
      new kakao.maps.Size(28, 36),
      { offset: new kakao.maps.Point(14, 36) }
    );

    // 새 마커 생성
    theaters.forEach((theater) => {
      const position = new kakao.maps.LatLng(theater.lat, theater.lng);

      const marker = new kakao.maps.Marker({
        position,
        map,
        title: theater.name,
        image: theaterMarkerImage,
      });

      // 마커 클릭 이벤트
      if (onMarkerClick) {
        kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick(theater);
        });
      }

      markersRef.current.push(marker);
    });

    console.log(`${theaters.length}개의 극장 마커 표시됨`);
  }, [theaters, onMarkerClick]);

  // 4. 중심 좌표 변경 시 지도 이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const newCenter = new kakao.maps.LatLng(center.lat, center.lng);
    map.panTo(newCenter);
  }, [center.lat, center.lng]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%' }}
      className="rounded-lg overflow-hidden"
    />
  );
}
