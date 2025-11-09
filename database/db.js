// Importa el módulo better-sqlite3.
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Abre/crea una base de datos en disco rígido.
const db = new Database('users.db', { verbose: console.log });

// Carga el script sql para crear la tabla users.
const filePath = path.join(__dirname, 'create_users.sql');
const file = fs.readFileSync(filePath, 'utf-8');

// Carga el script sql para crear la tabla gallery
const galleryFilePath = path.join(__dirname, 'create_users.sql');
const galleryFile = fs.readFileSync(galleryFilePath, 'utf-8');

// Crea las tablas si no existen
db.exec(file);
db.exec(galleryFile);

// -------------
// Funciones para exportar y usar en otros módulos.
// -------------

/**
 * Imprime el contenido de la base de datos.*/
exports.log = () => {
    let data = db.prepare('SELECT rowid, * FROM users').all();
    console.log('Tabla users', data);
    data = db.prepare('SELECT rowid, * FROM user_images').all();
    console.log('Tabla user_images:', data);
};

/**
 * Comprueba si el nombre de usuario existe en la base de datos.*/
exports.userExists = (username) => {
    const stmt = db.prepare('SELECT username FROM users WHERE username=?');
    const value = stmt.get(username);
    return !!value; // Devuelve true/false
};

/**
 * Agrega un nuevo usuario en la base de datos. */
exports.addUser = (username, email, hash) => {
    try {
        const stmt = db.prepare("INSERT INTO users (username, email, hash) VALUES (?, ?, ?)");
        const result = stmt.run(username, email, hash);
        console.log('Usuario creado:', { username, email, changes: result.changes });
        return true;
    } catch (error) {
        console.error('ERROR al crear usuario:', error.message);
        return false;
    }
}

/**
 * Devuelve el hash del usuario. */
exports.getHash = (username) => {
    const stmt = db.prepare('SELECT hash FROM users WHERE username=?');
    const user = stmt.get(username);
    return user ? user.hash : null;
}

/**
 * Obtiene datos completos de un usuario */
exports.getUser = (username) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username=?');
    return stmt.get(username);
}

// -------------
// IMAGENES DE USUARIO 
// -------------

// Agrega imagen asociada a un usuario
exports.addUserImage = (username, filepath, filename, description) => {
    const stmt = db.prepare(
        'INSERT INTO user_images (username, filepath, filename, filedesc) VALUES (?, ?, ?, ?)'
    );
    stmt.run(username, filepath, filename, description);
};

// Comprueba si una imagen existe
exports.userImageExists = (username, filepath) => {
    const stmt = db.prepare('SELECT filepath FROM user_images WHERE username=? AND filepath=?');
    return !!stmt.get(username, filepath);
};

// Borra una imagen de un usuario
exports.deleteUserImage = (username, filepath) => {
    const stmt = db.prepare('DELETE FROM user_images WHERE username=? AND filepath=?');
    stmt.run(username, filepath);
};

// Devuelve todas las imágenes de un usuario
exports.getAllUserImages = (username) => {
    const stmt = db.prepare('SELECT * FROM user_images WHERE username=?');
    return stmt.all(username);
};

// Datos para sketches o usos especiales
exports.getSketchData = (username) => {
    const stmt = db.prepare('SELECT * FROM user_images WHERE username=?');
    return stmt.all(username);
};
// -------------
// GALERIA COLECTIVA
// -------------

// Agregar imagen a la galería
exports.addToGallery = (username, imagePath) => {
    const stmt = db.prepare('INSERT INTO gallery (username, image_path) VALUES (?, ?)');
    return stmt.run(username, imagePath);
};

// Obtener todas las imágenes de la galería
exports.getAllGalleryImages = () => {
    const stmt = db.prepare('SELECT * FROM gallery ORDER BY created_at DESC');
    return stmt.all();
};

// Borrar imagen de galería
exports.deleteFromGallery = (id) => {
    const stmt = db.prepare('DELETE FROM gallery WHERE id = ?');
    return stmt.run(id);
};

// -----------------------------------------------
// CIERRE ORDENADO DE LA BASE
// -----------------------------------------------
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit());
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());