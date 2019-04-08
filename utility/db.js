const spicedPg = require('spiced-pg');
const hb = require('./hashPass');
const uif = require('./userInputFormatter');


const db = spicedPg('postgres://marcuswagner:postgres@localhost:5432/petition')

exports.postSignature = (signature, userId) => {
    let q = `INSERT INTO signatures (signature, id_user_fkey) VALUES ($1, $2) RETURNING id_sig;`;
    let params = [signature, userId];
    return db.query(q, params)
}

exports.getSignature = (userId, signId) => {
    let q, params;
    if (userId) {
        q = 'SELECT * FROM signatures WHERE id_user_fkey = $1';
        params = [userId];
    } else if (signId) {
        q = 'SELECT * FROM signatures WHERE id_sig = $1';
        params = [signId];
    }
    return db.query(q, params)
}

exports.getSignatureAll = () => {
    let q, params;
    q = 'SELECT * FROM signatures';
    params = [];
    return db.query(q, params)
}

exports.getSignatureJoinAll = () => {
    let params = [];
    let q = `SELECT first_name AS "firstName", last_name AS "lastName", email, city, url AS "userUrl", age from signatures FULL JOIN profiles ON signatures.id_user_fkey = profiles.id_user_fkey FULL JOIN users ON signatures.id_user_fkey = users.id_user;`;
    return db.query(q, params)
}

exports.getSigCityJoin = (city) => {
    let params = [city];
    let q = `SELECT first_name AS "firstName", last_name AS "lastName", email, city, url AS "userUrl", age from signatures JOIN profiles ON signatures.id_user_fkey = profiles.id_user_fkey JOIN users ON signatures.id_user_fkey = users.id_user WHERE LOWER(city) = LOWER($1);`;
    return db.query(q, params)
}

exports.getUserById = (userId) => {
    let q, params;
    q = 'SELECT * FROM users WHERE id_user = $1';
    params = [userId];
    return db.query(q, params)
}

exports.getUserDataJoin = (email) => {
    let params = [email];
    let q = `SELECT first_name, last_name, email, password, id_user, id_profile, id_sig FROM users LEFT JOIN profiles ON users.id_user = profiles.id_user_fkey LEFT JOIN signatures ON users.id_user = signatures.id_user_fkey WHERE email = $1;`;
    return db.query(q, params);
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

exports.postProfile = (city, age, urlInput, userId) => {
    let params = [city, parseInt(age), uif.checkUrl(urlInput), userId];
    let q = `INSERT INTO profiles (city, age, url, id_user_fkey) VALUES ($1, $2, $3, $4) RETURNING id_profile;`;
    return db.query(q, params)
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
