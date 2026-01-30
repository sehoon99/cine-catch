import asyncio
import asyncpg
import json
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "ssl": "require"
}

async def load_final_theaters():
    base_path = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_path, "place", "cgv.json")
    
    if not os.path.exists(json_path):
        print(f"❌ 파일을 찾을 수 없습니다: {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        full_data = json.load(f)
    
    theater_list = full_data.get("data", [])
    conn = await asyncpg.connect(**DB_CONFIG)
    
    print(f"🐘 DB 접속 완료. {len(theater_list)}개 지점 적재를 시작합니다...")

    try:
        async with conn.transaction():
            for t in theater_list:
                # 데이터 추출
                site_no = str(t['siteNo'])
                name = t['siteNm']
                address = f"{t.get('rpbldRnmadr', '')} {t.get('rpbldRdnmDaddr', '')}".strip()
                lng = t.get('coords', {}).get('lng')
                lat = t.get('coords', {}).get('lat')

                # 공간 데이터 포인트 생성 쿼리
                # ST_SetSRID(ST_MakePoint(경도, 위도), 4326)
                location_sql = "ST_SetSRID(ST_MakePoint($5, $6), 4326)" if lng and lat else "NULL"

                # 쿼리 실행 (location 부분은 텍스트 포맷팅이 필요하여 아래와 같이 구성)
                query = f"""
                    INSERT INTO theaters (id, brand, name, address, location)
                    VALUES ($1, 'CGV', $2, $3, {location_sql.replace('$5', str(lng)).replace('$6', str(lat)) if lng else 'NULL'})
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        address = EXCLUDED.address,
                        location = EXCLUDED.location
                """
                
                await conn.execute(query, site_no, name, address)
        
        print("✅ 모든 데이터가 성공적으로 DB에 적재되었습니다!")

    except Exception as e:
        print(f"❌ DB 적재 중 오류 발생: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(load_final_theaters())