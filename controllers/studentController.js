const db = require('../db');
const sharp = require('sharp');

function addStudent(primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN, direccion, contacto, cui, foto, id_padre, callback) {
    reduceImage(foto, (error, fotoComprimida) => {
        if (error) {
            callback(error);
            return; 
        }
        console.log(fotoComprimida.substring(0, 40))
        const query = `INSERT INTO alumno (primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN_alumno, direccion, contacto, cui_alumno, foto, id_padres) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [primer_nombre, segundo_nombre, otros_nombres, primer_apellido, segundo_apellido, fechaN, direccion, contacto, cui, fotoComprimida, id_padre];

        db.query(query, values, callback);
    });

}


function reduceImage(image, callback) {
    const imagenBuffer = Buffer.from(image, 'base64');
    // Comprimir la imagen usando sharp
    sharp(imagenBuffer)
        .resize({ width: 150, height:150 }) // Cambia el tamaño de la imagen si es necesario
        .toBuffer()
        .then(compressedImageBuffer => {
            // Convertir la imagen comprimida nuevamente a Base64
            const reducedImage = compressedImageBuffer.toString('base64');
            callback(null, reducedImage); // Llama al callback sin error y con la imagen comprimida
        })
        .catch(error => {
            console.error('Error al comprimir la imagen:', error);
            callback(error); // Llama al callback con el error
        });
}



module.exports = {
    addStudent
};
