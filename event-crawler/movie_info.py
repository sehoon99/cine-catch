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
        # 🌟 수정 포인트 1:
        # events 테이블에 있는 영화들 중, movies 테이블에 없거나 external_code가 null/빈값인 것만 추출
        # LEFT JOIN을 사용하여 movies 테이블의 상태를 체크합니다.
        query = """
                SELECT DISTINCT e.movie_title
                FROM events e
                LEFT JOIN movies m ON e.movie_title = m.id
                WHERE m.external_code IS NULL OR m.external_code = '' \
                """
        rows = await conn.fetch(query)
        movie_titles = [row['movie_title'] for row in rows if row['movie_title']]

        if not movie_titles:
            print("✅ 모든 영화의 상세 정보가 이미 업데이트 되어 있습니다.")
            return 0

        print(f"📦 업데이트가 필요한 {len(movie_titles)}개의 영화를 발견했습니다.")

        async with aiohttp.ClientSession() as session:
            for title in movie_titles:
                try:
                    # Step 1: KOBIS 영화 코드 찾기
                    movie_cd = await get_movie_code(session, title)
                    if not movie_cd:
                        print(f"⚠️ '{title}'의 코드를 찾을 수 없습니다. (패스)")
                        # 코드를 못 찾은 경우에도 다음 실행 때 또 찾지 않게 하려면
                        # 여기에 더미 데이터라도 넣는 로직을 추가할 수 있습니다.
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
                    await conn.execute("""
                                       INSERT INTO movies (id, title, release_date, genre, director, external_code, created_at)
                                       VALUES ($1, $1, $2, $3, $4, $5, NOW())
                                           ON CONFLICT (id) DO UPDATE SET
                                           release_date = EXCLUDED.release_date,
                                                                   genre = EXCLUDED.genre,
                                                                   director = EXCLUDED.director,
                                                                   external_code = EXCLUDED.external_code
                                       """, title, release_date, genre, director, movie_cd)

                    print(f"✅ 상세 정보 업데이트 완료: {title}")

                except Exception as e:
                    print(f"❌ '{title}' 처리 중 오류: {e}")

                await asyncio.sleep(0.1) # API 속도 제한 방지

    finally:
        await conn.close()
    return len(movie_titles)

# if __name__ == "__main__":
#     asyncio.run(sync_movies_from_events())