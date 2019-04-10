const spicedPg = require('spiced-pg');
const hb = require('./hashPass');
const uif = require('./userInputFormatter');

const dbUrl = process.env.DATABASE_URL || `postgres://${require('../.secret.json').dbAccess}@localhost:5432/petition`;
const db = spicedPg(dbUrl)

exports.postSignature = (signature, userId) => {
    let q = `   INSERT INTO signatures (signature, id_user_fkey)
                VALUES ($1, $2)
                RETURNING id_sig;`;
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
    let q = `   SELECT signatures.created_at, first_name AS "firstName", last_name AS "lastName", email, city, url AS "userUrl", age, id_user, id_sig
                FROM signatures
                LEFT JOIN profiles
                ON signatures.id_user_fkey = profiles.id_user_fkey
                LEFT JOIN users
                ON signatures.id_user_fkey = users.id_user;`;
    return db.query(q, params)
}

exports.getSigCityJoin = (city) => {
    let params = [city];
    let q = `   SELECT signatures.created_at, first_name AS "firstName", last_name AS "lastName", email, city, url AS "userUrl", age
                FROM signatures
                JOIN profiles
                ON signatures.id_user_fkey = profiles.id_user_fkey
                JOIN users
                ON signatures.id_user_fkey = users.id_user
                WHERE LOWER(city) = LOWER($1);`;
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
    let q = `   SELECT first_name, last_name, email, password, id_user, id_profile, id_sig
                FROM users
                LEFT JOIN profiles
                ON users.id_user = profiles.id_user_fkey
                LEFT JOIN signatures
                ON users.id_user = signatures.id_user_fkey
                WHERE email = $1;`;
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
            let q = `   INSERT INTO users (first_name, last_name, email, password)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id_user`;
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

exports.getProfileById = (userId) => {
    let params = [userId];
    let q = `SELECT * FROM profiles WHERE id_user_fkey = $1;`;
    return db.query(q, params)
}

exports.postProfile = (city, age, urlInput, userId) => {
    let params = [city, parseInt(age), uif.checkUrl(urlInput), userId];
    let q = `   INSERT INTO profiles (city, age, url, id_user_fkey)
                VALUES ($1, $2, $3, $4)
                RETURNING id_profile;`;
    return db.query(q, params)
}
/////// leave this a funciton declaration for arguments sake! /////////////
exports.updateProfile = function(userId, first, last, email, age, city, url, rawPass) {
    let params_2 = Array.prototype.slice.call(arguments).slice(1);
    let params_1 = params_2.splice(0, 3);

    let q = `   INSERT INTO profiles (age, city, url, id_user_fkey)
                VALUES ($1, $2, $3, ${userId})
                ON CONFLICT (id_user_fkey)
                DO UPDATE SET age = $1, city = $2, url = $3;`;

    if (params_2.length < 4) {
        return Promise.all([
            db.query(`  UPDATE users SET first_name = $1, last_name = $2, email = $3
                        WHERE id_user = ${userId};`, params_1),
            db.query(q, params_2)
        ])
    } else {
        return hb.hashPass(rawPass)
            .then(hash => {
                params_2.pop();
                return Promise.all([
                    db.query(`  UPDATE users SET first_name = $1, last_name = $2, email = $3, password = '${hash}'
                                WHERE id_user = ${userId};`, params_1),
                    db.query(q, params_2)
                ])
            })
            .catch(err => err)
    }
}

exports.deleteRow = (table, column, condition) => {
    let params = [];
    let q = `DELETE FROM ${table} WHERE ${column} = ${condition};`;
    return db.query(q, params)
}
