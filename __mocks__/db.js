
module.exports.postSignature = (signature, userId) => {
    return new Promise((resolve, reject) => {
        if (userId == 10) {
            reject(new Error('user already exists!'))
        } else if (typeof userId === 'number' && !isNaN(userId) && typeof signature === 'string') {
            resolve({
                rows: [
                    { id_sig: 1 }
                ]})
        } else {
            reject(new Error('this is bad'))
        }
    })
}
