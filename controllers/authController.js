// authController.js
const db = require('../db');

function loginUser(usuario, contrasena, callback) {
    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?';
    
    db.query(query, [usuario, contrasena], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (results.length > 0) {
            const user = results[0];
            if (user.activo) {
                callback(null, user);
            } else {
                callback(new Error('El usuario no está activo'), null);
            }
        } else {
            callback(new Error('Credenciales de inicio de sesión incorrectas'), null);
        }
    });

}

module.exports = {
    loginUser
};
