const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database/db.js');
const multer = require('multer');
const path = require('path');

const router = express.Router();

/**
 * Middleware para proteger rutas que requieren login
 */
function requireLogin(req, res, next) {
    if(req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

/**
 * Middleware para rutas que requieren NO estar logueado
 */
function notlogged(req, res, next) {
    if(!req.session.user) {
        next();
    } else {
        res.redirect('/user');
    }
}

/**
 * Página principal
 */
router.get('/', (req, res, next) => {
    res.render('index', { pageTitle: 'Página principal' });
});

/**
 * About
 */
router.get('/about', (req, res, next) => {
    res.render('about', { pageTitle: 'About' });
});

/**
 * Signup
 */
router.get('/signup', notlogged, (req, res, next) => {
    res.render('signup', { pageTitle: 'Registrarse', error: null });
});

router.post('/signup', notlogged, (req, res, next) => {
    console.log('📝 POST /signup recibido');
    console.log('📦 req.body:', req.body);
    
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        console.log('Faltan campos');
        return res.render('signup', { 
            pageTitle: 'Registrarse', 
            error: 'Todos los campos son obligatorios' 
        });
    }

    if(db.userExists(username)) {
        console.log('Usuario ya existe');
        return res.render('signup', { 
            pageTitle: 'Registrarse', 
            error: 'El nombre de usuario ya existe' 
        });
    }

    console.log(' Hasheando contraseña...');
    const hash = bcrypt.hashSync(password, 10);
    
    console.log(' Guardando usuario...');
    const result = db.addUser(username, email, hash);
    
    console.log(' Usuario guardado:', result);
    db.log();

    res.redirect('/login');
});

/**
 * Login
 */
function authenticate(username, password) {
    if (!db.userExists(username)) {
        console.log(' Usuario no existe:', username);
        return false;
    }
    const hash = db.getHash(username);
    const ok = bcrypt.compareSync(password, hash);
    console.log('Autenticación:', ok ? 'exitosa' : ' fallida');
    return ok;
}

router.get('/login', notlogged, (req, res, next) => {
    res.render('login', { pageTitle: 'Logueo', error: null });
});

router.post('/login', notlogged, (req, res, next) => {
    console.log(' POST /login recibido');
    console.log(' req.body:', req.body);
    
    const { username, password } = req.body;
    const ok = authenticate(username, password);

    if(ok) {
        req.session.regenerate((err) => {
            if (err) {
                console.error(' Error al regenerar sesión:', err);
                return res.redirect('/login');
            }
            
            req.session.user = username;
            req.session.success = `Autenticado como ${username}`;
            
            console.log('Sesión creada:', req.session);
            
            // IMPORTANTE: Guardar sesión antes de redirigir
            req.session.save((err) => {
                if (err) {
                    console.error('Error al guardar sesión:', err);
                    return res.redirect('/login');
                }
                console.log('Sesión guardada, redirigiendo a /user');
                res.redirect('/user');
            });
        });
    } else {
        console.log('Login fallido para:', username);
        req.session.error = 'La autenticación falló, revise su nombre de usuario y contraseña';
        res.render('login', { 
            pageTitle: 'Logueo', 
            error: 'Usuario o contraseña incorrectos' 
        });
    }

    // Log para ver los datos de la base de datos
    db.log();
});

/**
 * Perfil de usuario
 */
router.get('/user', requireLogin, (req, res, next) => {
    const username = req.session.user;
    const images = db.getAllUserImages(username);
    
    res.render('user', { 
        pageTitle: 'Mi perfil',
        user: { username },
        images
    });
});

/**
 * Logout
 */
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir sesión:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;