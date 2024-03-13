const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const authController = require('./controllers/authController');
const { addStudent } = require('./controllers/addStudentController');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});


app.use(bodyParser.json());

app.post('/login', (req, res) => {
    console.log(req.body)
    const { usuario, contrasena } = req.body;

    authController.loginUser(usuario, contrasena, (err, results) => {
        if (err) {
            console.error('Error al realizar la consulta:', err);
            res.status(500).send('Error al realizar la consulta a la base de datos');
            return;
        }

        if (results.length > 0) {
            res.send('Inicio de sesión exitoso');
        } else {
            res.status(401).send('Credenciales de inicio de sesión incorrectas');
        }
    });
});


app.post('/registroAlumnos' , 
[
    check('primer_nombre', 'El primer nombre es obligatorio').not().isEmpty(),
    check('primer_apellido', 'El primer apellido es obligatorio').not().isEmpty(),
    check('fecha_nacimiento', 'La fecha de nacimiento es obligatoria').not().isEmpty(),
    check('direccion', 'El campo dirección es obligatorio').not().isEmpty(),
    check('num_telefono', 'El numero de telefono es obligatorio').not().isEmpty(),
    check('cui', 'El cui del alumno es obligatorio').not().isEmpty().isInt(),
],
    (req, res) =>{
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


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

