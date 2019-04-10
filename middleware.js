exports.guard = (req, res, next) => {
    req.session.isLoggedIn ? next() : res.redirect('/register/')
}

exports.notSigned = (req, res, next) => {
    !req.session.isLoggedIn.hasSigned ? next() : res.redirect('/signed/')
}

exports.hasSigned = (req, res, next) => {
    req.session.isLoggedIn.hasSigned ? next() : res.redirect('/sign/')
}

exports.delGuard = (req, res, next) => {
    accountDelete ? next() : res.redirect('/signed/')
}

exports.csrfT = (req, res, next) => {
    res.set('X-Frame-Options', 'DENY');
    res.locals.csrfToken = req.csrfToken();
    next()
}
