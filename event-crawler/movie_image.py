import asyncio
import os
import aiohttp
import asyncpg
import boto3
import re
from dotenv import load_dotenv

load_dotenv()

# 환경 변수 설정
DB_CONFIG = {
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 5432))
}
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

TMDB_BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original"

# S3 클라이언트 (boto3는 기본적으로 동기 방식이므로 필요한 곳에서만 호출)
s3_client = boto3.client('s3')

def sanitize_filename(title):
    """공백을 _로 바꾸고 특수문자 제거"""
    title = title.replace(" ", "_")
    return re.sub(r'[^\w\s-]', '', title)

async def upload_to_s3(session, image_url, s3_key):
    """aiohttp 세션을 이용해 이미지를 다운받아 S3에 업로드"""
    try:
        async with session.get(image_url) as resp:
            if resp.status == 200:
                img_data = await resp.read()
                # boto3 upload_fileobj 대신 put_object 사용 (bytes 바로 업로드)
                s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=s3_key, Body=img_data, ContentType='image/jpeg')
                return f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
    except Exception as e:
        print(f"   ❌ S3 업로드 실패: {e}")
    return None

async def sync_movie_images():
    # SSL 인증서 문제 방지 설정
    import ssl
    import certifi
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    # 1. DB 연결 (PostgreSQL)
    conn = await asyncpg.connect(**DB_CONFIG)

    try:
        # 🌟 핵심 수정: image 컬럼이 NULL인 영화만 가져옵니다.
        # 만약 빈 문자열('')도 포함하고 싶다면 "WHERE image IS NULL OR image = ''" 로 쓰세요.
        query = "SELECT id, title FROM movies WHERE image IS NULL"
        rows = await conn.fetch(query)

        if not rows:
            print("✅ 모든 영화에 이미 이미지가 등록되어 있습니다.")
            return

        print(f"📦 총 {len(rows)}개의 영화에 이미지를 등록합니다.")

        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
            for row in rows:
                movie_id = row['id']
                title = row['title']
                clean_title = sanitize_filename(title)

                print(f"🎬 처리 중: {title}")

                # 2. TMDB 검색
                search_url = f"{TMDB_BASE_URL}/search/movie"
                params = {"api_key": TMDB_API_KEY, "query": title, "language": "ko-KR"}

                async with session.get(search_url, params=params) as resp:
                    search_data = await resp.json()
                    if not search_data.get('results'):
                        print(f"   ⚠️ TMDB에서 '{title}'을 찾을 수 없습니다.")
                        continue

                    tmdb_id = search_data['results'][0]['id']

                # 3. TMDB 상세 이미지 정보 가져오기
                images_url = f"{TMDB_BASE_URL}/movie/{tmdb_id}/images"
                async with session.get(images_url, params={"api_key": TMDB_API_KEY}) as resp:
                    images_data = await resp.json()

                # 4. 이미지 업로드 (S3)
                first_poster_url = None

                # 포스터와 백드롭 처리
                for tmdb_key, label in {'posters': 'poster', 'backdrops': 'backdrop'}.items():
                    image_list = images_data.get(tmdb_key, [])[:3]

                    for i, img_info in enumerate(image_list):
                        path = img_info['file_path']
                        suffix = f"_{i+1}" if i > 0 else ""
                        s3_key = f"movies/{clean_title}/{clean_title}_{label}{suffix}.jpg"

                        s3_url = await upload_to_s3(session, f"{IMAGE_BASE_URL}{path}", s3_key)

                        # 🌟 첫 번째 포스터 URL을 저장
                        if label == 'poster' and i == 0:
                            first_poster_url = s3_url

                # 5. DB 업데이트 (image 컬럼에 저장)
                if first_poster_url:
                    await conn.execute(
                        "UPDATE movies SET image = $1 WHERE id = $2",
                        first_poster_url, movie_id
                    )
                    print(f"   ✅ DB 업데이트 완료 (image): {first_poster_url}")

                await asyncio.sleep(0.2) # API 속도 제한 방지

    finally:
        await conn.close()
    return len(rows)

# if __name__ == "__main__":
#     asyncio.run(sync_movie_images())