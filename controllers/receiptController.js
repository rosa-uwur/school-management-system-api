const db = require('../db');


function getReceiptInfo(idPago, callback) {
    const query = `
    select  a.fecha_emision, 
            a.detalle_pago,
            a.monto_total,
            b.tipo_pago,
            c.primer_nombre,
            c.primer_apellido
        from recibo a
            inner join pago b on a.id_pago = b.id_pago
            inner join alumno c on b.id_alumno = c.id_alumno
        where a.id_pago = ?`;


    db.query(query, idPago, (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            if (results.length > 0) {
                const recibo = results[0];
                callback(null, recibo);
            } else {
                callback(null, null); 
            }
        }
    });

}

module.exports = {
    getReceiptInfo
};
