CREATE TABLE message_history (
    room_id INT NOT NULL,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);