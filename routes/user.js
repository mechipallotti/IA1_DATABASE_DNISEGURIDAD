const express = require('express');
const { formidable } = require('formidable');
const db = require('../database/db.js');

const router = express.Router();

/**
 * En app.js se insertan estas rutas en '/users'
 * con la expresión:
 *
 * app.use("/users", userRouter);
 *
 * Las rutas desde este archivo son relativas a
 * '/user', por lo tanto, '/' en este archivo
 * es '/user' en el servidor y '/profile' en este
 * archivo es '/user/profile' en el servidor.
 */

/**
 * Middleware de enrutador
 *
 * Middleware para restringir el acceso a las páginas
 * cuando el usuario no está logueado. Se aplica en cadena
 * en las rutas que lo requieran dentro la sección /user.
 */

function restricted(req, res, next) {
  if (req.session.user) {
    // Le pasa el control al próximo middleware que muestra la página de usuario.
    next();
  } else {
    // Guarda un mensaje de error en la sesión y redirecciona a la ruta /login que es pública.
    // Puede ser otra ruta como _home_ u otra página de error.
    // No llama a next() por lo que genera una respuesta y corta la cadena de middlewares.
    req.session.error = 'Acceso denegado!';
    res.redirect('/login');
  }
}

router.use(restricted);


/**
 * Página principal de usuario/a.
 */

router.get('/', (req, res, next) => {
  res.render('user', { pageTitle: 'Usuario' });
});


/**
 * Página de perfil de usuario/a.
 */

router.get('/profile', (req, res, next) => {
  res.render('profile', { pageTitle: 'Perfil' });
});


/**
 * Endpoint para subir archivos.
 */

router.get('/upload', restricted, (req, res, next) => {
  const username = req.session.user;
  const profilePic = db.getProfilePicture(username);
  res.render('upload', {
    pageTitle: 'Subir foto de perfil',
    profilePicture: profilePic
  });
});


router.post('/upload', restricted, (req, res, next) => {
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
      return
    }

    const username = req.session.user;
    // Verificar que se haya subido un archivo
    if (!files.userFiles || files.userFiles.length === 0) {
      console.log('*** No se subió ningún archivo');
      return res.redirect('/user/upload');
    }

    const img = files.userFiles[0];

    console.log('*** Subiendo:', username, img.newFilename, img.originalFilename);

    // Actualiza la foto de perfil en la base de datos
    db.updateProfilePicture(username, img.newFilename);

    for (let img of files.userFiles) {
      db.addUserImage(username, img.newFilename, img.originalFilename, fields.descImg[0]);
    }

    db.log();

    res.redirect('/user/upload');
  });
});


/**
 * Logout
 */

router.get('/logout', (req, res, next) => {
  // Destruye los datos de la sesión que se regeneran para la próxima petición.
  // El usuario queda deslogueado y se lo redirecciona a la página principal.
  req.session.destroy(() => {
    res.redirect('/');
  });
});


module.exports = router;
