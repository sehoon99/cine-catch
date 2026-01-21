import asyncio
import uuid

import asyncpg
import json
import os
import glob
from datetime import datetime
from dotenv import load_dotenv

# 1. 환경 변수 로드 (.env 파일 읽기)

load_dotenv()

DB_CONFIG = {
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 5432))
}

async def save_to_db():
    # --- [Step 1] 최신 JSON 파일 찾기 ---
    list_of_files = glob.glob('data/*.json')
    if not list_of_files:
        print("❌ 처리할 JSON 파일이 '/data/' 폴더에 없습니다.")
        return
    
    latest_file = max(list_of_files, key=os.path.getctime)
    print(f"📂 최신 데이터 로드 중: {latest_file}")

    with open(latest_file, "r", encoding="utf-8") as f:
        results = json.load(f)

    conn = await asyncpg.connect(**DB_CONFIG)
    logs = []
    change_count = 0
    
    print(f"🐘 DB 접속 완료. 변동 사항 확인을 시작합니다...")

    try:
        # [수정 포인트] DB에 있는 지점명-ID 매핑 정보를 미리 가져옴 (null 에러 방지)
        theater_rows = await conn.fetch("SELECT id, name FROM theaters")
        theater_map = {row['name']: row['id'] for row in theater_rows}

        for data in results:
            async with conn.transaction():
                # --- [Step 2] 영화(movies) 및 이벤트(events) 기본 정보 업데이트 ---
                # movie_title = await conn.fetchval("""
                #     INSERT INTO movies (title) VALUES ($1)
                #     ON CONFLICT (title)
                #     DO UPDATE SET title=EXCLUDED.title
                #     RETURNING id
                # """, data['movie_title'])
                movie_title = await conn.fetchval("""
                    INSERT INTO movies (id, title)
                    VALUES ($1, $1)
                    ON CONFLICT (title) 
                    DO UPDATE SET title = EXCLUDED.title
                    RETURNING id
                  """, data['movie_title'])
                
                event_no = str(data['event_no'])
                start_at = datetime.strptime(data['start_date'], '%Y%m%d') if data['start_date'] else datetime.now()
                end_at = datetime.strptime(data['end_date'], '%Y%m%d') if data['end_date'] else datetime.now()
                full_event_title = f"{data['movie_title']} - {data['event_title']}"

                await conn.execute("""
                    INSERT INTO events (id, movie_title, title, start_at, end_at, created_at)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                    ON CONFLICT (id) DO UPDATE SET 
                        title = EXCLUDED.title,
                        start_at = EXCLUDED.start_at,
                        end_at = EXCLUDED.end_at
                """, event_no, movie_title, full_event_title, start_at, end_at)

                # --- [Step 3] 지점별 재고 상태 비교 및 '진짜 변경' 건만 기록 ---
                for region, theater_list in data['regions'].items():
                    for theater in theater_list:
                        t_name = theater['theater']
                        new_status = theater['status']
                        
                        # [수정 포인트] theaters에 INSERT하지 않고 기존에 있는 ID를 찾음
                        t_id = theater_map.get(t_name)
                        
                        if not t_id:
                            # 만약 DB에 없는 지점이라면 로그 생성을 건너뛰거나 에러 출력
                            # (theaters 테이블에 '용산아이파크몰' 등이 이미 있으므로 매칭됨)
                            continue
                        
                        # [중요] 기존 DB 상태 조회
                        old_status = await conn.fetchval("""
                            SELECT status FROM event_location 
                            WHERE theater_id = $1 AND event_id = $2
                        """, t_id, event_no)

                        # 상태가 변경되었거나 새로운 데이터인 경우에만 작업 수행
                        if old_status != new_status:
                            random_id = str(uuid.uuid4())
                            await conn.execute("""
                                INSERT INTO event_location (theater_id, event_id, status,id, updated_at)
                                VALUES ($1, $2, $3, $4, NOW())
                                ON CONFLICT (theater_id, event_id) 
                                DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
                            """, t_id, event_no, new_status,random_id)
                            
                            # 로그 메시지 생성 (기존 로직 유지)
                            diff_text = f"[{old_status}] → [{new_status}]" if old_status else f"[신규 등록: {new_status}]"
                            log_entry = f"[{datetime.now().strftime('%Y%m%d_%H%M%S')}] {data['movie_title']} | {t_name} | {diff_text}"
                            logs.append(log_entry)
                            change_count += 1

        # --- [Step 4] 로그 파일 및 결과 출력 (기존 로직 유지) ---
        os.makedirs("logs", exist_ok=True)
        log_filename = f"logs/update_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        with open(log_filename, "w", encoding="utf-8") as f:
            if not logs:
                f.write(f"[{datetime.now().strftime('%Y%m%d_%H%M%S')}] 변동 사항 없음 (기존 데이터와 동일)\n")
                print("✨ 변동 사항이 없습니다. DB가 최신 상태입니다.")
            else:
                f.write("\n".join(logs) + "\n")
                print(f"✅ 총 {change_count}건의 재고 변동을 감지하여 업데이트했습니다!")
                print(f"📄 로그 파일 생성됨: {log_filename}")

    except Exception as e:
        print(f"❌ DB 작업 중 오류 발생: {e}")
    finally:
        await conn.close()

# if __name__ == "__main__":
#     asyncio.run(save_to_db())