const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect(error => {
    if (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw error;
    }
    console.log("Conectado com sucesso ao banco de dados MySQL.");
});

module.exports = connection;