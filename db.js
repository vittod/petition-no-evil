const spicedPg = require('spiced-pg');

const db = spicedPg('postgres://marcuswagner:postgres@localhost:5432/petition')

exports.addSignature = (firstName, lastName, signature) => {
    let q = `INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3) RETURNING id;`;
    let params = [firstName, lastName, signature];
    return db.query(q, params)
}

exports.findSignature = (id, firstName, lastName) => {
    let q, params;
    if (id) {
        q = 'SELECT * FROM signatures WHERE id = $1';
        params = [id];
    } else {
        q = `SELECT * FROM signatures WHERE first_name = $1 AND last_name = $2;`;
        params = [firstName, lastName]
    }
    return db.query(q, params)
}

exports.allSignatures = () => {
    let q, params;
    q = 'SELECT * FROM signatures';
    params = [];
    return db.query(q, params)
}
