// Kakao Maps API TypeScript 타입 선언
// 참고: https://apis.map.kakao.com/web/documentation/

declare namespace kakao.maps {
  // 지도 생성 옵션
  interface MapOptions {
    center: LatLng;
    level?: number;
  }

  // 지도 클래스
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setLevel(level: number): void;
    getLevel(): number;
    panTo(latlng: LatLng): void;
  }

  // 위도/경도 클래스
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  // 마커 옵션
  interface MarkerOptions {
    position: LatLng;
    map?: Map;
    title?: string;
    image?: MarkerImage;
  }

  // 마커 클래스
  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
    setPosition(position: LatLng): void;
  }

  // 마커 이미지
  class MarkerImage {
    constructor(src: string, size: Size, options?: MarkerImageOptions);
  }

  interface MarkerImageOptions {
    offset?: Point;
  }

  // 크기
  class Size {
    constructor(width: number, height: number);
  }

  // 포인트
  class Point {
    constructor(x: number, y: number);
  }

  // 정보창 옵션
  interface InfoWindowOptions {
    content: string | HTMLElement;
    position?: LatLng;
    removable?: boolean;
  }

  // 정보창 클래스
  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map, marker?: Marker): void;
    close(): void;
    setContent(content: string | HTMLElement): void;
  }

  // 원(Circle) 옵션
  interface CircleOptions {
    center: LatLng;
    radius: number;           // 반경 (미터 단위)
    strokeWeight?: number;    // 선 두께
    strokeColor?: string;     // 선 색상
    strokeOpacity?: number;   // 선 투명도 (0~1)
    strokeStyle?: string;     // 선 스타일 ('solid', 'dashed' 등)
    fillColor?: string;       // 채움 색상
    fillOpacity?: number;     // 채움 투명도 (0~1)
    map?: Map;
  }

  // 원(Circle) 클래스
  class Circle {
    constructor(options: CircleOptions);
    setMap(map: Map | null): void;
    setRadius(radius: number): void;
    setPosition(position: LatLng): void;
  }

  // 이벤트 관련
  namespace event {
    function addListener(
      target: Map | Marker,
      type: string,
      callback: () => void
    ): void;
    function removeListener(
      target: Map | Marker,
      type: string,
      callback: () => void
    ): void;
  }
}

// 전역 kakao 객체 선언
declare global {
  interface Window {
    kakao: typeof kakao;
  }
}

export {};
