import json
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

# 1. .env 파일 로드
load_dotenv()

# 2. 환경 변수에서 키 가져오기
KAKAO_API_KEY = os.getenv("KAKAO_REST_API_KEY")

def get_coords(address):
    """주소를 받아 카카오 API를 통해 경도(lng), 위도(lat) 반환"""
    if not KAKAO_API_KEY:
        print("❌ 에러: .env 파일에 KAKAO_REST_API_KEY가 설정되지 않았습니다.")
        return {"lng": None, "lat": None}

    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {"query": address}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        if result.get('documents'):
            # x: 경도(lng), y: 위도(lat)
            return {
                "lng": float(result['documents'][0]['x']),
                "lat": float(result['documents'][0]['y'])
            }
    except Exception as e:
        print(f"⚠️ API 호출 오류 ({address}): {e}")
    
    return {"lng": None, "lat": None}

def update_cgv_json_with_coords():
    # 현재 파일 위치 기준 경로 설정
    base_path = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_path, "place", "cgv.json")
    
    if not os.path.exists(json_path):
        print(f"❌ 파일을 찾을 수 없습니다: {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        full_data = json.load(f)
    
    # "data" 키 안에 있는 지점 목록 가져오기
    theater_list = full_data.get("data", [])
    total = len(theater_list)
    
    print(f"🚀 총 {total}개 지점 좌표 변환 시작...")

    for i, t in enumerate(theater_list):
        # 도로명 주소와 상세 주소 합치기
        r_addr = t.get('rpbldRnmadr', '')
        d_addr = t.get('rpbldRdnmDaddr', '')
        address = f"{r_addr}".strip()
        
        if address:
            coords = get_coords(address)
            # JSON 데이터 내에 coords 필드 추가/업데이트
            t['coords'] = coords
            print(f"[{i+1}/{total}] {t['siteNm']}: {coords}")
        else:
            t['coords'] = {"lng": None, "lat": None}
            print(f"[{i+1}/{total}] {t['siteNm']}: 주소 없음")

    # 업데이트된 내용을 다시 파일에 저장
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(full_data, f, ensure_ascii=False, indent=4)
    
    print(f"\n✅ 좌표 추가 완료! {json_path} 파일이 업데이트되었습니다.")

if __name__ == "__main__":
    update_cgv_json_with_coords()