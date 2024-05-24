const db = require('../db');

// Función para consultar la asistencia de un alumno en una clase en una fecha específica
function consultarAsistencia(idAlumno, idClase, fechaAsistencia, callback) {
    const query = 'SELECT * FROM asistencia_alumnos WHERE id_alumno = ? AND id_clase = ? AND fecha_asistencia = ?';

    db.query(query, [idAlumno, idClase, fechaAsistencia], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }

        callback(null, results);
    });
}

// Función para anadir un registro de asistencia
function anadirAsistencia(idAlumno, idClase, fechaAsistencia, asistio, callback) {
    const query = 'INSERT INTO asistencia_alumnos (id_alumno, id_clase, fecha_asistencia, asistio) VALUES (?, ?, ?, ?)';

    db.query(query, [idAlumno, idClase, fechaAsistencia, asistio], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }

        callback(null, results);
    });
}

module.exports = {
    consultarAsistencia,
    anadirAsistencia
};
