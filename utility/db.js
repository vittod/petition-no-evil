const spicedPg = require('spiced-pg');
const hb = require('./hashPass')

const db = spicedPg('postgres://marcuswagner:postgres@localhost:5432/petition')

exports.postSignature = (firstName, lastName, signature, userId) => {
    let q = `INSERT INTO signatures (first_name, last_name, signature, id_user_fkey) VALUES ($1, $2, $3) RETURNING id_sig;`;
    let params = [firstName, lastName, signature, userId];
    return db.query(q, params)
}

exports.getSignature = (userId, signId, firstName, lastName) => {
    let q, params;
    if (userId) {
        q = 'SELECT * FROM signatures WHERE id = $1';
        params = [userId];
    } else if (signId) {
        q = 'SELECT * FROM signatures WHERE id = $1';
        params = [signId];
    } else {
        q = `SELECT * FROM signatures WHERE first_name = $1 AND last_name = $2;`;
        params = [firstName, lastName]
    }
    return db.query(q, params)
}

exports.getSignatureAll = () => {
    let q, params;
    q = 'SELECT * FROM signatures';
    params = [];
    return db.query(q, params)
}

exports.getUserById = (userId) => {

}

exports.getUserByEmail = (email) => {
    let q = 'SELECT * FROM users WHERE email = $1';
    let params = [email];
    return db.query(q, params)
}

exports.postUser = (nameFirst, nameLast, email, rawPass) => {
    return hb.hashPass(rawPass)
        .then(hash => {
            console.log(hash);
            let q = `INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id_user`;
            let params = [nameFirst, nameLast, email, hash];
            return db.query(q, params)
        })
        .catch(err => err)
}

exports.checkUser = (rawPass, hash) => {
    return hb.checkPass(rawPass, hash)
        .then(passValid => passValid)
        .catch(err => err)
}

// expports.beginT = () {
//     let q, params;
//     q = 'BEGIN;';
//     params = [];
//     return db.query(q, params)
// }
//
// expports.commitT = () {
//     let q, params;
//     q = 'COMMIT;';
//     params = [];
//     return db.query(q, params)
// }
//
// expports.rollbackT = () {
//     let q, params;
//     q = 'ROLLBACK;';
//     params = [];
//     return db.query(q, params)
// }


// function postUser(nameFirst, nameLast, email, rawPass) {
//     return hb.hashPass(rawPass)
//         .then(hash => {
//             console.log(hash);
//             let q = `INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id_user`;
//             let params = [nameFirst, nameLast, email, hash];
//             return db.query(q, params)
//         })
//         .catch(err => err)
// }
