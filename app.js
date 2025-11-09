/**
 * Este es el archivo principal de la aplicación servidor.
 */

// Imports de commonjs.
const express = require('express');
const session = require('express-session');


// Enrutadores de la carpeta '/routes'.
const indexRouter = require('./routes/index.js');
const userRouter = require('./routes/user.js');
const obraRouter = require ('./routes/obra.js');

// Define el puerto en una constante, la manera correcta es usar variables de entorno pero no lo vamos a hacer así.
const PORT = 3000;
// Crea el objeto de la aplicación.
const app = express();


/**
 * Configuración de los valores de la aplicación.
 */

app.set('port', PORT);


// * Aquí, luego, vamos a configurar la engine de plantillas.
app.set('views', './views');
app.set('view engine', 'ejs');

// Recursos públicos
app.use('/uploads', express.static('uploads'));
// Recursos públicos, endpoint de acceso, ruta a la carpeta compartida
app.use('/public', express.static('public'));

/**
 * Configuración del middleware.
 */

// Agrega el middleware global (de aplicación).
app.use(express.urlencoded({ extended: true }));  // Procesa los datos de las peticiones POST y los pone disponibles en ⁠ req.body ⁠.


// Middleware global de sesión.
app.use(session({
    resave: false, // No guarda el objeto en el almacén de sesiones si este no fue modificado durante el procesamiento de la petición.
    saveUninitialized: false, // No guardar sesiones no inicializadas (nuevas y no modificadas) en el almacén.
    secret: 'clave secreta en el servidor'  // Clave de cifrado para firmar el ID de la sesión.
}));

// Middleware que hace disponible la información de sesión (req.session)
// en todas las vistas EJS a través del objeto res.locals.
// De este modo, las plantillas pueden acceder directamente a "session".
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


/**
 * Configuración de los enrutadores.
 */

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/obra", obraRouter);


/**
 * Inicialización de la aplicación servidor.
 */

app.listen(PORT);