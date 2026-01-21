-- theater_subscription.id를 UUID로 변경

-- 1. 기존 데이터 삭제 (개발 환경)
TRUNCATE TABLE theater_subscription;

-- 2. theater_subscription.id 컬럼 타입 변경
ALTER TABLE theater_subscription ALTER COLUMN id TYPE uuid USING gen_random_uuid();
