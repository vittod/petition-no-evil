DROP TABLE IF EXISTS cities;

CREATE TABLE signatures (
    id SERIAL primary key,
    first_name VARCHAR(255) not null,
    last_name VARCHAR(255),
    signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

--INSERT INTO signatures (first_name, last_name, signature) VALUES
--    ('azerimuth', 'bandistan', 'azerimuth bandistan');
