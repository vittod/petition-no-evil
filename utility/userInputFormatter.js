const url = require('url');

exports.checkUrl = (urlInput) => decUrl(saniStr(urlInput))

exports.sanitizer = (sani) => {
    if (!sani) {
        return sani
    } else if (sani.constructor === Array.prototype.constructor) {
        return sani.map(el => {
            if (typeof el === 'string') {
                return saniStr(el)
            } else {
                return el
            }
        })
    } else if (typeof sani === 'object') {
        for (let prop in sani) {
            if (typeof sani[prop] === 'string') {
                sani[prop] = saniStr(sani[prop])
            }
        }
        return sani
    } else if (typeof sani === 'string') {
        return saniStr(sani)
    } else {
        return sani
    }
}

exports.escComp = (str) => {
    return str.length === saniStr(str).length ? true : false
}

exports.mailValid = (email) => {
    let test = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    return test.test(email)
}

exports.saniStrToNum = (str) => {
    let test = /[0-9]/
    if (typeof str === 'string') {
        let result = str != '' ? str.split('').map(el => test.test(el) ? el : '').join('') : null;
        return result === '' ? null : +result
    } else if (typeof str === 'number') {
        return str.split('').filter(el => test.test(el) ? el : '').join('')
    } else {
        return null
    }
}

function saniStr(str) {
    return str.split('').filter(el => el != '>' && el != '<' && el != '&' && el != '"' && el != "'").join('')
}

function decUrl(urlInput) {
    let urlObj = url.parse(urlInput);
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return urlObj.href
    }
    return null;
}
