const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db.js');

const router = express.Router();

// --- Middleware para proteger rutas ---
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/user/login');
  }
  next();
}

// --- Registro (GET) ---
router.get('/register', (req, res) => {
  res.render('signup', { error: null });
});

// --- Registro (POST) ---
router.post('/register', (req, res) => {
  console.log('📝 POST /register recibido');
  console.log('📦 req.body:', req.body);
  
  const { username, email, password } = req.body;

  console.log('👤 Datos extraídos:', { username, email, password: password ? '***' : undefined });

  if (!username || !email || !password) {
    console.log('❌ Faltan campos');
    return res.render('signup', { error: 'Todos los campos son obligatorios.' });
  }

  // Usar la función que ya tienes en db.js
  if (db.userExists(username)) {
    console.log('❌ Usuario ya existe');
    return res.render('signup', { error: 'El usuario ya existe.' });
  }

  console.log('🔐 Hasheando contraseña...');
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  console.log('💾 Intentando guardar usuario...');
  // Usar la función que ya tienes en db.js
  const result = db.addUser(username, email, hashedPassword);
  
  console.log('📊 Resultado de addUser:', result);
  
  db.log(); // Ver el estado de la DB

  res.redirect('/user/login');
});

// --- Login (GET) ---
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// --- Login (POST) ---
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verificar si el usuario existe
  if (!db.userExists(username)) {
    return res.render('login', { error: 'Usuario no encontrado.' });
  }

  // Obtener el hash de la contraseña
  const hash = db.getHash(username);
  
  const validPassword = bcrypt.compareSync(password, hash);
  if (!validPassword) {
    return res.render('login', { error: 'Contraseña incorrecta.' });
  }

  // Guardamos la sesión
  req.session.userId = username; // En tu DB el username es la PRIMARY KEY
  req.session.username = username;

  console.log('✅ Sesión creada:', req.session);

  // Importante: save() asegura que la sesión se guarde antes de redirigir
  req.session.save((err) => {
    if (err) {
      console.error('Error al guardar sesión:', err);
      return res.render('login', { error: 'Error al iniciar sesión' });
    }
    res.redirect('/user');
  });
});

// --- Página de perfil protegida ---
router.get('/', requireLogin, (req, res) => {
  const username = req.session.username;
  const images = db.getAllUserImages(username);
  
  res.render('user', { 
    user: { username }, 
    images 
  });
});

// --- Logout ---
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/user/login');
  });
});

module.exports = router;