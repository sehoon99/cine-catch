-- members.id를 UUID로 변경

-- 1. 외래 키 제약 조건 삭제
ALTER TABLE theater_subscription DROP CONSTRAINT IF EXISTS fkqh6wv5hn3wnra2i540vtsfa9w;

-- 2. 기존 데이터 삭제 (개발 환경)
TRUNCATE TABLE theater_subscription;
TRUNCATE TABLE members CASCADE;

-- 3. members.id 컬럼 타입 변경 (IDENTITY 제거 후 UUID로)
ALTER TABLE members ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE members ALTER COLUMN id TYPE uuid USING gen_random_uuid();

-- 4. theater_subscription.user_id 컬럼 타입 변경
ALTER TABLE theater_subscription ALTER COLUMN user_id TYPE uuid USING gen_random_uuid();

-- 5. 외래 키 제약 조건 재생성
ALTER TABLE theater_subscription
    ADD CONSTRAINT fk_theater_subscription_member
    FOREIGN KEY (user_id) REFERENCES members(id);