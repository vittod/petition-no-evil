const express = require('express');
const hb = require('express-handlebars');
const {addSignature, findSignature, allSignatures, getUserByEmail, postUser, checkUser} = require('./utility/db');
const bodyParser = require('body-parser');
const cs = require('cookie-session');
const csurf = require('csurf')

app = express();

app.use(cs({ maxAge: 1000 * 60 * 60 * 24 * 14, secret: 'dirty little secret'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(csurf());
app.use((req, res, next) => {
    res.set('X-Frame-Options', 'DENY');
    res.locals.csrfToken = req.csrfToken();
    next()
});

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

//
//  /////////// TODO app crashes when cookie driven redirect occurs afert reg and login..
//


app.get('/', (req, res) => res.redirect('/register/'))

app.get('/register/', (req, res) => {
    // if (req.session.isLoggedIn) {
    //     res.redirect('/petition/')
    // }
    res.render('register', {
        layout: 'petitionAll'
    })
})
app.post('/register/', (req, res) => {
    if (req.body.first && req.body.last && req.body.email && req.body.pass) {
        getUserByEmail(req.body.email)
            .then(user => {
                if (user.rows.length < 1) {
                    console.log('mail already in db', user.rows.length);
                    postUser(req.body.first, req.body.last, req.body.email, req.body.pass)
                        .then(nuUser => {
                            console.log('new user created:', nuUser.rows);
                            res.redirect('/login/')
                        })
                        .catch(err => console.log('not able to create user:', err))
                } else {
                    res.render('register', {
                        layout: 'petitionAll',
                        msg: 'email already registered'
                    })
                }
            })
            .catch(err => {
                console.log(err);
                res.redirect('/wrong/');
            })
    } else {
        res.render('register', {
            layout: 'petitionAll',
            msg: 'all fields are required'
        })
    }
})


app.get('/login/', (req, res) => {
    // if (req.session.isLoggedIn) {
    //     res.redirect('/petition/')
    // }
    res.render('login', {
        layout: 'petitionAll'
    })
})
app.post('/login/', (req, res) => {
    if (req.body.email && req.body.pass) {
        getUserByEmail(req.body.email)
            .then(user => {
                if (user.rows.length) {
                    console.log(user.rows);
                    checkUser(req.body.pass, user.rows[0].password)
                        .then(passValid => {
                            if (passValid) {
                                req.session.isLoggedIn = true;
                                res.redirect('/petition/')
                            } else {
                                res.render('login', {
                                    layout: 'petitionAll',
                                    msg: 'user and password do not match'
                                })
                            }
                        })
                        .catch(err => console.log('error comparing password:', err))
                } else {
                    res.render('login', {
                        layout: 'petitionAll',
                        msg: 'user not found'
                    })
                }
            })
            .catch(err => {
                console.log('get user err:', err);
                res.redirect('/wrong/')
            })
    } else {
        res.render('login', {
            layout: 'petitionAll',
            msg: 'all fields are required'
        })
    }
})

app.use(express.static(__dirname + '/public/'))

app.get('/wrong/', (req, res) => {
    res.status(403).render('wrong', {
        layout: 'petitionAll'
    });
})


app.use((req, res, next) => {
    if (!req.session.isLoggedIn){
        res.redirect('/register/')
    }
    next();
})

app.get('/petition/', (req, res) => {
    if(!req.session.hasSigned) {
        res.render('sign', {
            layout: 'petitionAll'
        })
    } else {
        res.redirect('/signed/')
    }
})
app.post('/petition/', (req, res) => {
    if (req.body.first && req.body.last && req.body.signature) {
        postSignature(req.body.first, req.body.last, req.body.signature)
            .then((data) => {
                console.log('new db insert, id:', data.rows[0].id);
                req.session.hasSigned = data.rows[0].id;
                res.redirect('/signed/')
            })
            .catch((err) => {
                console.log('dc signature insert err:', err);
                res.redirect('/wrong/')
            });
    } else {
        res.redirect('/wrong/');
    }

})

app.get('/signed/', (req, res) => {
    if (req.session.hasSigned) {
        getSignature(req.session.hasSigned).then((data) => {
            res.render('signed', {
                layout:'petitionAll',
                userSig: data.rows[0].signature
            })
        })

    } else {
        res.redirect('/sign/')
    }
})

app.get('/signers/', (req, res) => {
    if (req.session.hasSigned) {
        getSignatureAll()
            .then((data) => {
                let signees = data.rows.map(el => ({firstName: el.first_name, lastName: el.last_name}))
                res.render('signers', {
                    layout:'petitionAll',
                    userSig: data.rows[0].signature,
                    name: signees,
            })
        })

    } else {
        res.redirect('/sign/')
    }
})

app.get('*', (req, res) => {
    res.status(404).render('404', {
        layout: 'petitionAll'
    });
})


app.listen(8080, () => console.log('server listening..'))
