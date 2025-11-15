const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database/db.js');
const router = express.Router();
const { formidable } = require('formidable');

// Middleware para verificar si el usuario está autenticado
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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

// Sketch 3 - Galería Colectiva (GET /obra/sketch3)
router.get('/sketch3', requireLogin, (req, res) => {
  const images = db.getSketchData(); // Obtener todas las imágenes
  res.render('obra/sketch3', { 
    pageTitle: 'Galería Colectiva',
    images: images 
  });
});


// API de datos para p5.js (GET /obra/data)
router.get('/data', (req, res, next) => {
  const data = db.getSketchData();
  console.log('*** Sketch DATA:', data);
  res.json(data);
});

// Subir imagen a la galería colectiva (/obra/sketch3/upload)
router.post('/sketch3/upload', requireLogin, (req, res, next) => {
    const form = formidable({
        uploadDir: 'uploads',
        filter: ({ mimetype }) => {
            const supportedTypes = new Set(['image/jpeg', 'image/png']);
            return mimetype && supportedTypes.has(mimetype);
        }
    });

    form.parse(req, (err, fields, files) => {
        if(err) {
            next(err);
            return;
        }

        const username = req.session.user;
        const descripcion = fields.descImg[0];

        for(let img of files.userFiles) {
            console.log('*** Subiendo:', username, img.newFilename, img.originalFilename, descripcion);
            db.addUserImage(username, img.newFilename, img.originalFilename, descripcion);
        }

        db.log();
        res.redirect('/obra/sketch3');
    });
});

module.exports = router;