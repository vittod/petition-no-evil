const bc = require('bcryptjs')
const bcrypt = require('bcryptjs')

exports.hashPass = (rawPass) => {
    return new Promise((resolve, reject) => {
        bc.genSalt((err, salt) => {
            if (err) {
                return reject(new Error('could not slat:', err))
            }
            bc.hash(rawPass, salt, (err, hash) => {
                if (err) {
                    return reject(new Error('could not hash:', err))
                }
                resolve(hash)
            })
        })
    })
}


exports.checkPass = (rawPass, hash) => {
    return new Promise((resolve, reject) => {
        bc.compare(rawPass, hash, (err, passValid) => {
            if (err) {
                return reject(new Error('could not check for pass:', err))
            }
            resolve(passValid)
        })
    })
}
