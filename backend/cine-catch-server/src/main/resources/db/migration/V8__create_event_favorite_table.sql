CREATE TABLE event_subscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES members(id),
    event_id VARCHAR(255) NOT NULL REFERENCES events(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_id, event_id)
);
