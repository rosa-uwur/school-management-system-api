const db = require('../db');


function addParent(primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN, telefono, email, cui, callback) {
    
    const query = `INSERT INTO padres (primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN, telefono, email, cui) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN, telefono, email, cui];

    db.query(query, values, callback);
}


function getParentByCui(cui, callback){
    const query = 'SELECT * FROM padres WHERE cui = ?';
    db.query(query, cui, (error, results) => {
        if (error) {
            callback(error, null);
        } else {
            if (results.length > 0) {
                const padre = results[0];
                // Formatear la fecha antes de devolverla
                padre.fechaN = formatFecha(padre.fechaN);
                callback(null, padre);
            } else {
                callback(null, null); // No se encontró ningún padre con ese CUI
            }
        }
    });
}


function formatFecha(fecha) {
    const date = new Date(fecha);
    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

module.exports = {
    addParent,
    getParentByCui
};
