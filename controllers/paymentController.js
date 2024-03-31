const db = require('../db');

function studentPayment(idAlumno, tipoPago, fechaPago, monto, mesPago, anioPago, callback) {
    const values = [idAlumno, tipoPago, fechaPago, monto];

    const query = 'INSERT INTO pago(id_alumno, tipo_pago, fecha_pago, monto) VALUES(?,?,?,?);';

    db.query(query, values, (err, results) => {

        if (err) {
            callback(err, null);
        } else {
            const idPago = results.insertId; 

            if (idPago) {
                console.log('ID del pago insertado:', idPago);
                generarRecibo(idAlumno, tipoPago, fechaPago, monto, mesPago, anioPago, idPago);

                callback(null, idPago); 
            } else {
                callback(null, null); 
            }
        }
    });

}


function generarRecibo(idAlumno, tipoPago, fechaPago, monto, mesPago, anioPago, idPago) {
    let detalle = generarDescripcion(tipoPago, mesPago, anioPago);
    const values = [idPago, fechaPago, detalle, monto];
    console.log('aaaa')
    const query = 'INSERT INTO recibo(id_pago, fecha_emision, detalle_pago, monto_total) VALUES(?,?,?,?);';

    db.query(query, values, (err, results) => {

        if (err) {
            console.log("Error al generar recibo1")
        } else {
            console.log("Recibo generado uwu")

        }
    });
}


function generarDescripcion(tipoPago, mesPago, anioPago) {
    return descripcion = "Pago de " + tipoPago + "  " + obtenerNombreMes(mesPago) + " " + anioPago;
}


function obtenerNombreMes(mesPago) {
    // Convertir mesPago a número entero
    const mesNumero = parseInt(mesPago);

    // Validar que el valor de mesNumero esté entre 1 y 12
    if (mesNumero >= 1 && mesNumero <= 12) {
        // Array con los nombres de los meses
        const nombresMeses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Obtener el nombre del mes correspondiente
        const nombreMes = nombresMeses[mesNumero - 1];

        // Asignar el nombre del mes a la variable mes
        return nombreMes;
    } else {
        // Mensaje de error si el valor de mesPago no es válido
        return "Mes no válido";
    }
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
