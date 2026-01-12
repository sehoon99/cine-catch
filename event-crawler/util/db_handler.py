# utils/db_handler.py
import asyncpg
import json

class DBHandler:
    def __init__(self):
        self.config = {
            "user": "mymovie",
            "password": "movie1218",
            "database": "movie_inventory",
            "host": "localhost"  # 도커 밖에서 실행할 때
        }

    async def save_results(self, results, provider):
        conn = await asyncpg.connect(**self.config)
        
        upsert_query = """
        INSERT INTO giveaway_status (event_no, provider, movie_title, event_title, start_date, end_date, regions_data, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (event_no) DO UPDATE SET
            regions_data = EXCLUDED.regions_data,
            updated_at = NOW();
        """

        for data in results:
            try:
                await conn.execute(
                    upsert_query,
                    str(data['event_no']),
                    provider,
                    data['movie_title'],
                    data['event_title'],
                    data['start_date'],
                    data['end_date'],
                    json.dumps(data['regions'], ensure_ascii=False)
                )
            except Exception as e:
                print(f"❌ DB 저장 중 오류 발생 ({data['event_no']}): {e}")

        await conn.close()
        print(f"✅ {provider} 데이터 DB 동기화 완료.")