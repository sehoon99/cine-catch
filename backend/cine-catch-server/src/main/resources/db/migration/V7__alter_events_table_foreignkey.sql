-- 기존 제약 조건 삭제 (fk4j208mivjj6bidknfip65be50 부분은 에러 메시지에 나온 이름을 써주세요)
ALTER TABLE events DROP CONSTRAINT fk4j208mivjj6bidknfip65be50;

-- ON UPDATE CASCADE 옵션을 넣어 다시 생성
ALTER TABLE events
ADD CONSTRAINT fk_movies_events
FOREIGN KEY (movie_title) REFERENCES movies(id)
ON UPDATE CASCADE;