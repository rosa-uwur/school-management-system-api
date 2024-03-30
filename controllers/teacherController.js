const db = require('../db');


function addTeacher(primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, telefono, correo, callback) {
    
    const query = `INSERT INTO profesor (primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, telefono, correo) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, telefono, correo];

    db.query(query, values, callback);
}


function getAllTeachers(cui, callback){
    const query = 'SELECT * FROM profesor';
    db.query(query, cui, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            if (results.length > 0) {
                const profesor = results[0];
                callback(null, profesor);
            } else {
                callback(null, null); // no se encontraron profesores
            }
        }
    });
}



module.exports = {
    addTeacher,
    getAllTeachers
};
