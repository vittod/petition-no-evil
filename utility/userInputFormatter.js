const url = require('url');

exports.checkUrl = (urlInput) => {
    let urlObj = url.parse(urlInput);
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return urlObj.href
    }
    return null;
}
