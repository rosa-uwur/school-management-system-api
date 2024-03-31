const db = require('../db');

function studentPayment(idAlumno, tipoPago, fechaPago, monto, callback) {
    const values = [idAlumno, tipoPago, fechaPago, monto];

    const query = 'INSERT INTO pago(id_alumno, tipo_pago, fecha_pago, monto) VALUES(?,?,?,?);';

    db.query(query, values, (err, results) => {

        if (err) {
            callback(err, null);
        } else {
            if (results.length > 0) {
                const pago = results[0];
                callback(null, pago);
            } else {
                callback(null, null); 
            }
        }
    });

}

function getPaymentSolvency(idClase, callback) {
    const query = `
        SELECT a.id_alumno,
            a.primer_nombre,
            a.primer_apellido,
            IFNULL(
                (SELECT 
                    IF(p.fecha_pago > DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), 'Solvente', 'No solvente')
                    FROM pago p
                    WHERE p.id_alumno = a.id_alumno AND p.tipo_pago = 'colegiatura'
                    ORDER BY p.fecha_pago DESC LIMIT 1),
                        'No solvente'
                    ) AS estado_financiero
            FROM alumno a
            INNER JOIN asignacion asi ON a.id_alumno = asi.id_alumno
            WHERE asi.id_clase = ?;`;


    db.query(query, idClase, (err, results) => {

        if (err) {
            callback(err, null);
        } else {
            if (results.length > 0) {
                const pago = results;
                callback(null, pago);
            } else {
                callback(null, null); 
            }
        }
    });

}

module.exports = {
    studentPayment,
    getPaymentSolvency
};
