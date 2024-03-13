const db = require('../db');

function addStudent(primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN, direccion, contacto, cui, foto, id_padre, callback) {
    const query = `INSERT INTO alumno (primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN_alumno, direccion, contacto, cui_alumno, foto, id_padres) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN, direccion, contacto, cui, foto, id_padre];

    db.query(query, values, callback);
}


module.exports = {
    addStudent
};
