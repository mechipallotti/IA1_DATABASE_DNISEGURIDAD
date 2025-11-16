const express = require('express');
const { formidable } = require('formidable');
const db = require('../database/db.js');

const router = express.Router();

function restricted(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Acceso denegado!';
    res.redirect('/login');
  }
}

router.use(restricted);  // Protege todas las rutas

/**
 * Subir foto de perfil
 */
router.get('/upload', (req, res, next) => {  // ← Saqué restricted
  const username = req.session.user;
  const profilePic = db.getProfilePicture(username);
  res.render('upload', {
    pageTitle: 'Subir foto de perfil',
    profilePicture: profilePic
  });
});

router.post('/upload', (req, res, next) => {  // ← Saqué restricted
  const form = formidable({
    uploadDir: 'uploads',
    filter: ({ mimetype }) => {
      const supportedTypes = new Set(['image/jpeg', 'image/png']);
      return mimetype && supportedTypes.has(mimetype);
    }
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    const username = req.session.user;
    
    if (!files.userFiles || files.userFiles.length === 0) {
      console.log('*** No se subió ningún archivo');
      return res.redirect('/user/upload');
    }

    const img = files.userFiles[0];
    console.log('*** Actualizando foto de perfil:', username, img.newFilename);
    
    // Solo actualizar foto de perfil
    db.updateProfilePicture(username, img.newFilename);
    db.log();
    
    res.redirect('/user');  // ← Redirige al perfil
  });
});

module.exports = router;