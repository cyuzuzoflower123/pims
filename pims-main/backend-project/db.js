const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pims',
});

db.query('SELECT 1')
    .then(() => {
        console.log('mysql connected');
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = db;
