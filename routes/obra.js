const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database/db.js');

const router = express.Router();

// Middleware para proteger rutas
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/gallery';
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Página de selección de obras (GET /obra)
router.get('/', requireLogin, (req, res) => {
  res.render('obra', { pageTitle: 'Obras' });
});

// Sketch 1 (GET /obra/sketch1)
router.get('/sketch1', requireLogin, (req, res) => {
  res.render('obra/sketch1', { pageTitle: 'Sketch 1' });
});

// Sketch 2 (GET /obra/sketch2)
router.get('/sketch2', requireLogin, (req, res) => {
  res.render('obra/sketch2', { pageTitle: 'Sketch 2' });
});

// Sketch 3 (GET /obra/sketch3)
router.get('/sketch3', requireLogin, (req, res) => {
  const images = db.getAllGalleryImages();
  res.render('obra/sketch3', { pageTitle: 'Galería Colectiva', images });
});

// Subir imagen a galería (POST /obra/sketch3/upload)
router.post('/sketch3/upload', requireLogin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.redirect('/obra/sketch3');
  }

  const username = req.session.user;
  db.prepare('INSERT INTO gallery (username, image_path) VALUES (?, ?)').run(username, req.file.filename);

  res.redirect('/obra/sketch3');
});

module.exports = router;