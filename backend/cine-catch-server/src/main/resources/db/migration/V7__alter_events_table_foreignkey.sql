-- 기존 제약 조건 삭제 (존재하는 경우에만)
ALTER TABLE events DROP CONSTRAINT IF EXISTS fk4j208mivjj6bidknfip65be50;
ALTER TABLE events DROP CONSTRAINT IF EXISTS fk_movies_events;

-- ON UPDATE CASCADE 옵션을 넣어 다시 생성
ALTER TABLE events
ADD CONSTRAINT fk_movies_events
FOREIGN KEY (movie_title) REFERENCES movies(id)
ON UPDATE CASCADE;