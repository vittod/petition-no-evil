exports.guard = (req, res, next) => {
    req.session.isLoggedIn ? next() : res.redirect('/register/')
}

exports.logged = (req, res, next) => {
    !req.session.isLoggedIn ? next() : res.redirect('/sign/')
}

exports.notSigned = (req, res, next) => {
    req.session.isLoggedIn.hasSigned == null ? next() : res.redirect('/signed/')
}

exports.hasSigned = (req, res, next) => {
    req.session.isLoggedIn.hasSigned ? next() : res.redirect('/sign/')
}

exports.delGuard = (req, res, next) => {
    req.session.accountDelete ? next() : res.redirect('/signed/')
}

exports.csrfT = (req, res, next) => {
    res.set('X-Frame-Options', 'DENY');
    res.locals.csrfToken = req.csrfToken();
    next()
}
