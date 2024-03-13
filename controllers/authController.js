// authController.js
const db = require('../db');

function loginUser(usuario, contrasena, callback) {
    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?';
    console.log(query);
    console.log(contrasena);
    console.log(usuario);
    db.query(query, [usuario, contrasena], callback);

}

module.exports = {
    loginUser
};
