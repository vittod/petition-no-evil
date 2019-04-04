DROP TABLE IF EXISTS cites;

CREATE TABLE cities (
    id SERIAL primary key,
    city VARCHAR(255) not null,
    state VARCHAR(255),
    country VARCHAR(255)
    );

INSERT INTO cities (city, state, country) VALUES
    ('azerimuth', 'bandistan', 'gaerion');
