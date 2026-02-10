-- members 테이블에 알림 설정 컬럼 추가
ALTER TABLE members ADD COLUMN notification_enabled BOOLEAN NOT NULL DEFAULT true;

-- 알림 히스토리 테이블 생성
CREATE TABLE notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_history_member_id ON notification_history(member_id);
CREATE INDEX idx_notification_history_created_at ON notification_history(created_at DESC);
