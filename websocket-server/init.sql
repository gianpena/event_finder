CREATE TABLE message_history (
    room_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    avatar_url TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);
