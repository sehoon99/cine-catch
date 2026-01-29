import asyncio
import asyncpg
import os
from dotenv import load_dotenv

from crawler import main as crawl_events
from loader import save_to_db
from movie_info import sync_movies_from_events
from movie_image import sync_movie_images

load_dotenv()

async def main():

    try:
        print("🚀 데이터 가공 파이프라인 가동...")

        # 1단계: CGV 이벤트 크롤링
        print("\n📡 [1/4] CGV 이벤트 크롤링 시작...")
        await crawl_events()

        # 2단계: 크롤링 데이터 DB 저장
        print("\n💾 [2/4] 크롤링 데이터 DB 저장...")
        await save_to_db()

        # 3단계: KOBIS 상세 정보 동기화
        print("\n🎬 [3/4] 영화 상세 정보 동기화...")
        new_info_count = await sync_movies_from_events()
        if new_info_count > 0:
            print(f"✅ {new_info_count}개의 새로운 영화 상세 정보를 등록했습니다.")
        else:
            print("✨ 모든 영화 상세 정보가 최신 상태입니다.")

        # 4단계: TMDB & S3 이미지 동기화
        print("\n🖼️ [4/4] 영화 이미지 동기화...")
        new_img_count = await sync_movie_images()
        if new_img_count > 0:
            print(f"✅ {new_img_count}개의 새로운 영화 포스터를 S3에 저장했습니다.")
        else:
            print("✨ 모든 영화 이미지가 등록되어 있습니다.")

    except Exception as e:
        print(f"🚨 파이프라인 실행 중 오류 발생: {e}")
    finally:
        print("\n🏁 파이프라인 종료.")

if __name__ == "__main__":
    asyncio.run(main())