const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const authController = require('./controllers/authController');
const { addStudent } = require('./controllers/studentController');
const { addParent, getParentByCui } = require('./controllers/parentController');
const app = express();
const PORT = 3000;

// Aumentar el límite de tamaño de carga a 10MB para recibir imagenes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});


app.use(bodyParser.json());

app.post('/login', (req, res) => {
    console.log(req.body);
    const { usuario, contrasena } = req.body;

    authController.loginUser(usuario, contrasena, (err, user) => {
        if (err) {
            console.error('Error al realizar la consulta:', err);
            // Si el error es debido a que el usuario no está activo, enviar un mensaje 401
            if (err.message === 'El usuario no está activo') {
                res.status(401).send('El usuario no está activo');
            } else {
                if(err.message === 'Credenciales de inicio de sesión incorrectas'){
                    res.status(401).send('Credenciales de inicio de sesión incorrectas');
                }else{
                    res.status(500).send('Error al realizar la consulta a la base de datos');
                }
                
            }
            return;
        }

        // Si se recibe un usuario, se considera que el inicio de sesión es exitoso
        if (user) {
            res.send('Inicio de sesión exitoso');
        } else {
            // Si no se recibe un usuario, las credenciales son incorrectas
            res.status(401).send('Credenciales de inicio de sesión incorrectas');
        }
    });
});



app.post('/registroAlumnos',
    [
        check('primer_nombre', 'El primer nombre es obligatorio').not().isEmpty().isAlpha().withMessage('El primer nombre solo debe contener letras'),
        check('segundo_nombre').optional().isAlpha().withMessage('El segundo nombre solo debe contener letras'),
        check('otros_nombres').optional(),
        check('primer_apellido', 'El primer apellido es obligatorio').not().isEmpty().isAlpha().withMessage('El primer apellido solo debe contener letras'),
        check('segundo_apellido').optional().isAlpha().withMessage('El segundo apellido solo debe contener letras'),
        check('fecha_nacimiento', 'La fecha de nacimiento es obligatoria').not().isEmpty().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('El formato de la fecha de nacimiento debe ser YYYY-MM-DD'),
        check('direccion', 'El campo dirección es obligatorio').not().isEmpty(),
        check('contacto').optional().isEmail().withMessage('El contacto debe ser una dirección de correo electrónico válida'),
        check('cui', 'El cui del alumno es obligatorio').not().isEmpty().isInt().withMessage('El CUI debe ser un número entero'),
        check('foto').not().isEmpty().isBase64().withMessage('La foto debe estar en base 64'),
        check('id_padre').not().isEmpty().withMessage('El alumno debe estár asociado a un padre.')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Si no hay errores de validación, continuar con la lógica para registrar al alumno
        // Por ejemplo:
        const { primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fecha_nacimiento, direccion, contacto, cui, foto, id_padre } = req.body;
        addStudent(primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fecha_nacimiento, direccion, contacto, cui, foto, id_padre
            , (err, result) => {
                if (err) {
                    console.error('Error al insertar datos:', err);
                    res.status(500).send('Error al insertar datos en la base de datos');
                } else {
                    console.log('Datos insertados correctamente');
                    res.status(200).send('Alumno registrado correctamente');
                }
            }
        );
    });


    app.post('/registroPadres',
    [
        check('primer_nombre', 'El primer nombre es obligatorio').not().isEmpty().isAlpha().withMessage('El primer nombre solo debe contener letras'),
        check('segundo_nombre').optional().isAlpha().withMessage('El segundo nombre solo debe contener letras'),
        check('otros_nombres').optional(),
        check('primer_apellido', 'El primer apellido es obligatorio').not().isEmpty().isAlpha().withMessage('El primer apellido solo debe contener letras'),
        check('segundo_apellido').optional().isAlpha().withMessage('El segundo apellido solo debe contener letras'),
        check('fechaN', 'La fecha de nacimiento es obligatoria').not().isEmpty().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('El formato de la fecha de nacimiento debe ser YYYY-MM-DD'),
        check('telefono', 'El número de teléfono es obligatorio').not().isEmpty().isMobilePhone().withMessage('El número de teléfono debe ser válido'),
        check('email', 'El correo electrónico es obligatorio').not().isEmpty().isEmail().withMessage('El correo electrónico debe ser válido'),
        check('cui', 'El CUI del padre es obligatorio').not().isEmpty().isInt().withMessage('El CUI debe ser un número entero')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN, telefono, email, cui } = req.body;
        addParent(primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN, telefono, email, cui
            , (err, result) => {
                if (err) {
                    console.error('Error al insertar datos de padre:', err);
                    res.status(500).send('Error al insertar datos en la base de datos');
                } else {
                    console.log('Datos insertados correctamente');
                    res.status(200).send('Padre registrado correctamente');
                }
            }
        );
    });


// Consulta de padres por cui
app.get('/consultarPadre/:cui', [
    check('cui', 'El CUI debe ser un número entero').isInt()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const cui = req.params.cui;

    getParentByCui(cui, (err, padre) => {
        if (err) {
            console.error('Error al consultar padre:', err);
            return res.status(500).send('Error al consultar datos en la base de datos');
        }
        if (!padre) {
            return res.status(404).send('Padre no encontrado');
        }
        return res.status(200).json(padre);
    });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

