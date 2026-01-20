/**
 * 두 지점 간의 거리를 계산합니다 (Haversine 공식)
 *
 * @param lat1 - 첫 번째 지점의 위도
 * @param lng1 - 첫 번째 지점의 경도
 * @param lat2 - 두 번째 지점의 위도
 * @param lng2 - 두 번째 지점의 경도
 * @returns 두 지점 사이의 거리 (km)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 지구 반지름 (km)

  // 위도/경도를 라디안으로 변환
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // km 단위 거리
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
