import asyncio
import os
import aiohttp
import asyncpg
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# API 및 DB 설정
KOBIS_API_KEY = os.getenv("KOBIS_API_KEY")
DB_CONFIG = {
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 5432))
}

async def get_movie_code(session, movie_title):
    """제목으로 영화 코드를 검색합니다."""
    url = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieList.json"
    params = {"key": KOBIS_API_KEY, "movieNm": movie_title}
    async with session.get(url, params=params) as resp:
        data = await resp.json()
        movie_list = data.get("movieListResult", {}).get("movieList", [])
        # 가장 유사하거나 최신인 영화 코드를 반환 (제목이 같으면 최상단)
        for m in movie_list:
            if m['movieNm'].replace(" ", "") == movie_title.replace(" ", ""):
                return m['movieCd']
    return None

async def fetch_movie_detail(session, movie_cd):
    """코드로 영화 상세 정보를 가져옵니다."""
    url = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json"
    params = {"key": KOBIS_API_KEY, "movieCd": movie_cd}
    async with session.get(url, params=params) as resp:
        data = await resp.json()
        return data.get("movieInfoResult", {}).get("movieInfo", {})

async def sync_movies_from_events():
    conn = await asyncpg.connect(**DB_CONFIG)

    try:
        # 1. events 테이블에서 고유한 movie_id(제목) 리스트 추출
        # movie_id 컬럼에 영화 제목이 들어있는 경우를 기준으로 함
        rows = await conn.fetch("SELECT DISTINCT movie_title FROM events")
        movie_titles = [row['movie_title'] for row in rows if row['movie_title']]

        print(f"📦 events 테이블에서 {len(movie_titles)}개의 영화 제목을 발견했습니다.")

        async with aiohttp.ClientSession() as session:
            for title in movie_titles:
                try:
                    # Step 1: KOBIS 영화 코드 찾기
                    movie_cd = await get_movie_code(session, title)
                    if not movie_cd:
                        print(f"⚠️ '{title}'의 코드를 찾을 수 없습니다. (패스)")
                        continue

                    # Step 2: 상세 정보 가져오기
                    detail = await fetch_movie_detail(session, movie_cd)

                    # 데이터 가공
                    raw_date = detail.get('openDt')
                    release_date = None
                    if raw_date and len(raw_date) == 8:
                        try:
                            release_date = datetime.strptime(raw_date, '%Y%m%d').date()
                        except ValueError: pass

                    genre = ", ".join([g['genreNm'] for g in detail.get('genres', [])])
                    director = ", ".join([d['peopleNm'] for d in detail.get('directors', [])])

                    # Step 3: movies 테이블에 INSERT (이미 있으면 UPDATE)
                    # 사진의 컬럼 구조: id, title, release_date, genre, director, external_code
                    await conn.execute("""
                                       INSERT INTO movies (id, title, release_date, genre, director, external_code, created_at)
                                       VALUES ($1, $1, $2, $3, $4, $5, NOW())
                                           ON CONFLICT (id) DO UPDATE SET
                                           release_date = EXCLUDED.release_date,
                                                                   genre = EXCLUDED.genre,
                                                                   director = EXCLUDED.director,
                                                                   external_code = EXCLUDED.external_code
                                       """, title, release_date, genre, director, movie_cd)

                    print(f"✅ 저장/업데이트 완료: {title}")

                except Exception as e:
                    print(f"❌ '{title}' 처리 중 오류: {e}")

                await asyncio.sleep(0.1)

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(sync_movies_from_events())