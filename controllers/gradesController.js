// authController.js
const db = require('../db');


//obtener las notas de un alumno asignado en una clase
function getStudentGradesByClass(idAlumno, idClase, callback) {
const query = 'select * from asignacion a inner join alumno b on a.id_alumno = b.id_alumno inner join clases c on a.id_clase = c.id_clase inner join notas d  on d.id_asignacion = a.id_asignacion where c.id_clase = ? and   b.id_alumno = ? order by c.nombre_clase desc';
const values = [idAlumno, idClase]
    db.query(query, values, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            if (results.length > 0) {
                grades = results;
                callback(null, grades);
            } else {
                callback(null, null); // No se encontró ningún padre con ese CUI
            }
        }
    });
}


function addStudentGrades(idAsignacion, actividadesLibro, actividadesCuaderno, asistencia, examen, notaFinal, anio, callback) {
    const query = 'INSERT INTO notas (id_asignacion, actividades_libro, actividades_cuaderno, asistencia, examen, nota_final, anio) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [idAsignacion, actividadesLibro, actividadesCuaderno, asistencia, examen, notaFinal, anio];

    db.query(query, values, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            callback(null, results.insertId); // Devuelve el ID del nuevo registro insertado
        }
    });
}

//obtener las notas generales de un alumno
function getStudentGrades(idAlumno, callback) {
    const query = `
    SELECT 
        b.id_alumno,
        b.primer_nombre,
        b.segundo_nombre,
        b.segundo_apellido,
        b.primer_apellido,
        c.nombre_clase,
        c.id_clase,
        d.actividades_libro,
        d.actividades_cuaderno,
        d.asistencia,
        d.examen,
        d.nota_final,
        d.anio
    FROM
        asignacion a
            INNER JOIN
        clases c ON a.id_clase = c.id_clase
            INNER JOIN
        alumno b ON a.id_alumno = b.id_alumno
            INNER JOIN
        notas d ON d.id_asignacion = a.id_asignacion
    WHERE
        b.id_alumno = ?
    ORDER BY c.nombre_clase DESC;
`;

    db.query(query, idAlumno, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            if (results.length > 0) {
                students = results[0];

                callback(null, students);
            } else {
                callback(null, null); // No se encontró ningún padre con ese CUI
            }
        }
    });
}


module.exports = {
    getStudentGrades,
    getStudentGradesByClass
};
