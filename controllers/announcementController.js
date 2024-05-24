const db = require('../db');
const moment = require('moment');

// Función para añadir un anuncio
function addAnuncio(titulo, contenido, id_profesor, callback) {
    const fecha_creacion = moment().format('YYYY-MM-DD');
    const fecha_vencimiento = moment().add(3, 'months').format('YYYY-MM-DD');
    const query = `INSERT INTO anuncios (titulo, contenido, fecha_creacion, fecha_vencimiento, id_profesor)
                   VALUES (?, ?, ?, ?, ?)`;
    const values = [titulo, contenido, fecha_creacion, fecha_vencimiento, id_profesor];

    db.query(query, values, (error, results) => {
        if (error) {
            return callback(error);
        }
        callback(null, results);
    });
}

// Función para obtener todos los anuncios
function getAllAnuncios(callback) {
    const query = 'SELECT * FROM anuncios';
    db.query(query, (error, results) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, results);
    });
}

module.exports = {
    addAnuncio,
    getAllAnuncios
};
