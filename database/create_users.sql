-- Crear la tabla para usuario si no existe en la base de datos.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users
(
    username varchar(255) PRIMARY KEY,
    email varchar(255) NOT NULL,
    hash varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS gallery
(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE
);