DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    first_name VARCHAR(255) not null,
    last_name VARCHAR(255) not null,
    email VARCHAR(255) not null,
    password VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures (
    id_sig SERIAL PRIMARY KEY,
    id_user_fkey INTEGER not null,
    signature TEXT not null,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user_fkey) REFERENCES users(id_user)
);

INSERT INTO users (first_name, last_name, email, password) VALUES
    ('azerimuth', 'bandistan', 'azze@band.star', 'xxxxxx');

INSERT INTO signatures (id_user_fkey, signature) VALUES
    (1, 'azerimuth bandistan');
