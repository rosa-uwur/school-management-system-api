// db.js
const mysql = require('mysql2');
// Importar el paquete dotenv
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_IP_ADDRESS,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

module.exports = connection;
