import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

/**
 * 사용자의 현재 위치를 가져오는 커스텀 훅
 *
 * 사용법:
 * const { latitude, longitude, error, loading } = useGeolocation();
 *
 * @returns 위도, 경도, 에러 메시지, 로딩 상태
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    // 브라우저가 Geolocation을 지원하는지 확인
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: '브라우저가 위치 서비스를 지원하지 않습니다.',
        loading: false,
      }));
      return;
    }

    // 위치 가져오기 시도
    navigator.geolocation.getCurrentPosition(
      // 성공 콜백
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
        console.log('위치 가져오기 성공:', position.coords.latitude, position.coords.longitude);
      },
      // 실패 콜백
      (error) => {
        let errorMessage = '위치를 가져올 수 없습니다.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
        });
        console.error('위치 가져오기 실패:', errorMessage);
      },
      // 옵션
      {
        enableHighAccuracy: true, // 높은 정확도 (GPS 사용)
        timeout: 10000,           // 10초 타임아웃
        maximumAge: 300000,       // 5분간 캐시된 위치 사용 가능
      }
    );
  }, []); // 컴포넌트 마운트 시 1회 실행

  return state;
}
