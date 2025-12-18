CREATE TABLE game (
    id   INTEGER PRIMARY KEY,
    title  VARCHAR(255) NOT NULL
);

CREATE TABLE actor (
    id   INTEGER PRIMARY KEY,
    name  VARCHAR(255) NOT NULL
);

CREATE TABLE character (
    name  VARCHAR(255) NOT NULL,
    game_id  INTEGER,
    actor_id INTEGER,
    image VARCHAR(255),

    FOREIGN KEY (game_id) REFERENCES game(id),
    FOREIGN KEY (actor_id) REFERENCES actor(id)
);