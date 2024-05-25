const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const authController = require('./controllers/authController');
const { addStudent, getStudentsInClass } = require('./controllers/studentController');
const { addParent, getParentByCui } = require('./controllers/parentController');
const { addTeacher, getAllTeachers } = require('./controllers/teacherController');
const { getAllClassesByTeacher } = require('./controllers/classesController');
const { getStudentGradesByClass, getStudentGrades } = require('./controllers/gradesController');
const { getReceiptInfo } = require('./controllers/receiptController');
const { studentPayment, getPaymentSolvency } = require('./controllers/paymentController');
const { addAnuncio, getAllAnuncios } = require('./controllers/announcementController');
const {consultarAsistencia, anadirAsistencia}  = require('./controllers/asistenciaController');
const cors = require('cors');


const app = express();
const PORT = 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Aumentar el límite de tamano de carga a 10MB para recibir imagenes
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
                if (err.message === 'Credenciales de inicio de sesión incorrectas') {
                    res.status(401).send('Credenciales de inicio de sesión incorrectas');
                } else {
                    res.status(500).send('Error al realizar la consulta a la base de datos');
                }

            }
            return;
        }
        console.log(user)
        // Si se recibe un usuario, se considera que el inicio de sesión es exitoso
        if (user.activo) {
            res.status(200).json({ message: 'Inicio de sesión exitoso', user });
        } else {
            // Si no se recibe un usuario, las credenciales son incorrectas
            res.status(401).json({ error: 'Credenciales de inicio de sesión incorrectas' });
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
        check('id_padre').not().isEmpty().withMessage('El alumno debe estár asociado a un padre.')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Si no hay errores de validación, continuar con la lógica para registrar al alumno
        // Por ejemplo:
        const { primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fecha_nacimiento, direccion, contacto, cui,  id_padre } = req.body;
        addStudent(primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fecha_nacimiento, direccion, contacto, cui, id_padre
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



app.post('/registroPago',
    [
        check('id_alumno', 'Debe indicar el alumno a pagar').not().isEmpty().isNumeric().withMessage('El id alumno debe ser numerico'),
        check('tipo_pago', 'El tipo de pago debe ser colegiatura o inscripción').isIn(['colegiatura', 'inscripción']).withMessage('El tipo de pago debe ser colegiatura o inscripción'),
        check('fecha_pago', 'La fecha de pago es requerida en formato YYYY-MM-DD').custom((value) => {
            const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
            if (!value.match(dateFormat)) {
                throw new Error('Formato de fecha inválido. Use YYYY-MM-DD.');
            }
            return true;
        }),
        check('monto', 'El monto es requerido y debe ser un número').not().isEmpty().isNumeric().withMessage('El monto debe ser un número válido'),
        check('mes_pago', 'El mes de pago debe ser un número entre 1 y 12').notEmpty().isInt({ min: 1, max: 12 }).withMessage('El mes de pago debe ser un número entre 1 y 12'),
        check('anio_pago', 'El ano de pago debe ser un ano válido').notEmpty().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('El ano de pago debe ser un ano válido'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id_alumno, tipo_pago, fecha_pago, monto, mes_pago, anio_pago } = req.body;
        studentPayment(id_alumno, tipo_pago, fecha_pago, monto, mes_pago, anio_pago
            , (err, result) => {
                if (err) {
                    console.error('Error al insertar datos de pago:', err);
                    res.status(500).send('Error al insertar datos en la base de datos');
                } else {
                    console.log('Datos insertados correctamente');
                    res.status(200).send('Pago registrado correctamente');
                }
            }
        );
    });





app.post('/registroProfesor',
    [
        check('primer_nombre', 'El primer nombre es obligatorio').not().isEmpty().isAlpha().withMessage('El primer nombre solo debe contener letras'),
        check('segundo_nombre').optional().isAlpha().withMessage('El segundo nombre solo debe contener letras'),
        check('otros_nombres').optional(),
        check('primer_apellido', 'El primer apellido es obligatorio').not().isEmpty().isAlpha().withMessage('El primer apellido solo debe contener letras'),
        check('segundo_apellido').optional().isAlpha().withMessage('El segundo apellido solo debe contener letras'),
        check('telefono', 'El número de teléfono es obligatorio').not().isEmpty().isMobilePhone().withMessage('El número de teléfono debe ser válido'),
        check('correo', 'El correo electrónico es obligatorio').not().isEmpty().isEmail().withMessage('El correo electrónico debe ser válido')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, telefono, correo } = req.body;
        addTeacher(primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, telefono, correo
            , (err, result) => {
                if (err) {
                    console.error('Error al insertar datos de profesor:', err);
                    res.status(500).send('Error al insertar datos en la base de datos');
                } else {
                    console.log('Datos insertados correctamente');
                    res.status(200).send('Profesor registrado correctamente');
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


// Consulta de clases impartidas por un profesor
app.get('/clasesProfesor/:idProfesor', [
    check('idProfesor', 'Debe ingresar un id de profesor').not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idProfesor = req.params.idProfesor;

    getAllClassesByTeacher(idProfesor, (err, clases) => {
        if (err) {
            console.error('Error al consultar clases:', err);
            return res.status(500).send('Error al consultar datos en la base de datos');
        }
        if (!clases) {
            return res.status(404).send('No se encontraron clases asociadas al profesor');
        }
        return res.status(200).json(clases);
    });
});



// Consulta de los alumnos inscritos en clases
app.get('/alumnosEnClase/:idClase', [
    check('idClase', 'Debe ingresar un id de clase').not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idClase = req.params.idClase;

    getStudentsInClass(idClase, (err, clases) => {
        if (err) {
            console.error('Error al consultar alumnos:', err);
            return res.status(500).send('Error al consultar datos en la base de datos');
        }
        if (!clases) {
            return res.status(404).send('No se encontraron alumnos asignados');
        }
        return res.status(200).json(clases);
    });
});

// Consulta de las notas de un alumno en una determinada clase
app.get('/obtenerNotasAlumno/:idAlumno', [
    check('idAlumno', 'Debe ingresar un id de Alumno').not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idAlumno = req.params.idAlumno;

    getStudentGrades(idAlumno, (err, clases) => {
        if (err) {
            console.error('Error al consultar alumnos:', err);
            return res.status(500).send('Error al consultar datos en la base de datos');
        }
        if (!clases) {
            return res.status(404).send('No se encontraron datos de alumno');
        }
        return res.status(200).json(clases);
    });
});


// Consulta de las notas de un alumno en una determinada clase
app.get('/consultaProfesores', (req, res) => {


    getAllTeachers((err, profesores) => {
        if (err) {
            console.error('Error al consultar profesores:', err);
            return res.status(500).send('Error al consultar datos en la base de datos');
        }
        if (!profesores) {
            return res.status(404).send('No se encontraron datos de profesores');
        }
        return res.status(200).json(profesores);
    });
});


// Consulta de las notas generales de un alumno
app.get('/obtenerNotasAlumnoEnClase/:idAlumno&:idClase', [
    check('idClase', 'Debe ingresar un id de clase').not().isEmpty(),
    check('idAlumno', 'Debe ingresar un id de Alumno').not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idClase = req.params.idClase;
    const idAlumno = req.params.idAlumno;

    getStudentGradesByClass(idAlumno, idClase, (err, clases) => {
        if (err) {
            console.error('Error al consultar notas de alumnos:', err);
            return res.status(500).send('Error al consultar datos en la base de datos');
        }
        if (!clases) {
            return res.status(404).send('No se encontraron notas para el alumno');
        }
        return res.status(200).json(clases);
    });
});

// Consulta de informacion para recibo
app.get('/obtenerInformacionRecibo/:idPago', [
    check('idPago', 'Debe ingresar un id de pago').not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idPago = req.params.idPago;


    getReceiptInfo(idPago, (err, clases) => {
        if (err) {
            console.error('Error al consultar recibo', err);
            return res.status(500).send('Error al consultar datos en la base de datos');
        }
        if (!clases) {
            return res.status(404).send('No se encontraron pagos asociados');
        }
        return res.status(200).json(clases);
    });
});


// Consulta de alumnos solventes en una clase
app.get('/consultaSolvenciaClase/:idClase', [
    check('idClase', 'Debe ingresar un id de clase').not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const idClase = req.params.idClase;


    getPaymentSolvency(idClase, (err, clases) => {
        if (err) {
            console.error('Error al consultar clase', err);
            return res.status(500).send('Error al consultar datos en la base de datos');
        }
        if (!clases) {
            return res.status(404).send('No se encontraron alumnos en esa clase');
        }
        return res.status(200).json(clases);
    });
});



// Ruta para anadir un anuncio
app.post('/anuncio', [
    check('titulo', 'Debe ingresar un título').not().isEmpty(),
    check('contenido', 'Debe ingresar contenido').not().isEmpty(),
    check('id_profesor', 'Debe ingresar un id de profesor').isInt().not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);
    console.log('publicaron anuncio')
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { titulo, contenido, id_profesor } = req.body;

    addAnuncio(titulo, contenido, id_profesor, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ message: 'Anuncio anadido exitosamente', data: results });
    });
});

// Ruta para obtener todos los anuncios
app.get('/anuncios', (req, res) => {
    
    getAllAnuncios((error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(200).json({ data: results });
    });
});



app.post('/anadirAsistencia',
    [
        check('registrosAsistencia', 'Se esperaba un arreglo de registros de asistencia').isArray({ min: 1 }).withMessage('El arreglo de registros de asistencia no puede estar vacío'),
        check('registrosAsistencia.*.idAlumno', 'El ID del alumno es obligatorio').notEmpty().isInt().withMessage('El ID del alumno debe ser un número entero'),
        check('registrosAsistencia.*.idClase', 'El ID de la clase es obligatorio').notEmpty().isInt().withMessage('El ID de la clase debe ser un número entero'),
        check('registrosAsistencia.*.fechaAsistencia', 'La fecha de asistencia es obligatoria').notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('El formato de la fecha de asistencia debe ser YYYY-MM-DD'),
        check('registrosAsistencia.*.asistio', 'El campo asistio es obligatorio').notEmpty().isBoolean().withMessage('El campo asistio debe ser un valor booleano')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const registrosAsistencia = req.body.registrosAsistencia;
        const insertados = [];
        const errores = [];

        registrosAsistencia.forEach((registro, index) => {
            const { idAlumno, idClase, fechaAsistencia, asistio } = registro;

            anadirAsistencia(idAlumno, idClase, fechaAsistencia, asistio, (err, result) => {
                if (err) {
                    console.error(`Error al insertar datos de asistencia en el índice ${index}:`, err);
                    errores.push({ index, error: err });
                } else {
                    console.log(`Datos de asistencia en el índice ${index} insertados correctamente`);
                    insertados.push({ index, result });
                }

                // Si hemos procesado todos los registros, enviamos la respuesta
                if (insertados.length + errores.length === registrosAsistencia.length) {
                    if (errores.length > 0) {
                        res.status(500).json({ errores });
                    } else {
                        res.status(200).json({ insertados });
                    }
                }
            });
        });
    }
);





// app.post('/ingresoNotas',
//     [
//         check('actividadesLibro', 'La puntuación de actividades del libro es obligatoria').not().isEmpty().isInt().withMessage('La puntuación de actividades del libro debe ser un número entero'),
// check('actividadesCuaderno', 'La puntuación de actividades del cuaderno es obligatoria').not().isEmpty().isInt().withMessage('La puntuación de actividades del cuaderno debe ser un número entero'),
// check('asistencia', 'La puntuación de asistencia es obligatoria').not().isEmpty().isInt().withMessage('La puntuación de asistencia debe ser un número entero'),
// check('examen', 'La puntuación del examen es obligatoria').not().isEmpty().isInt().withMessage('La puntuación del examen debe ser un número entero'),
// check('notaFinal', 'La nota final es obligatoria').not().isEmpty().isInt().withMessage('La nota final debe ser un número entero'),
// check('anio', 'El ano es obligatorio').not().isEmpty().isInt({ min: 1900, max: 2100 }).withMessage('El ano debe ser un número entero entre 1900 y 2100')
//     (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const {  } = req.body;
//         addStudent(
//             , (err, result) => {
//                 if (err) {
//                     console.error('Error al insertar datos:', err);
//                     res.status(500).send('Error al insertar datos en la base de datos');
//                 } else {
//                     console.log('Datos insertados correctamente');
//                     res.status(200).send('Alumno registrado correctamente');
//                 }
//             }
//         );
//     });


// //ejemplo xd
//     app.post('/registroAlumnos',
//     [
//         check('primer_nombre', 'El primer nombre es obligatorio').not().isEmpty().isAlpha().withMessage('El primer nombre solo debe contener letras'),

//     ],
//     (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const {  } = req.body;
//         addStudent(
//             , (err, result) => {
//                 if (err) {
//                     console.error('Error al insertar datos:', err);
//                     res.status(500).send('Error al insertar datos en la base de datos');
//                 } else {
//                     console.log('Datos insertados correctamente');
//                     res.status(200).send('Alumno registrado correctamente');
//                 }
//             }
//         );
//     });




app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

