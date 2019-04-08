const express = require('express');
const hb = require('express-handlebars');
const db = require('./utility/db');
const bodyParser = require('body-parser');
const cs = require('cookie-session');
const csurf = require('csurf');

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


const guard = (req, res, next) => {
    if (req.session.isLoggedIn){
        next();
    } else {
        res.redirect('/register/')
    }
}

app.use(express.static(__dirname + '/public/'))

app.get('/', (req, res) => {
    console.log('user:', req.session.isLoggedIn);
    if (req.session.isLoggedIn) {
        res.redirect('/sign/')
    } else {
        res.redirect('/register/')
    }
})

app.get('/register/', (req, res) => {
    res.render('register', {
        layout: 'petitionAll'
    })
})
app.post('/register/', (req, res) => {
    if (req.body.first && req.body.last && req.body.email && req.body.pass) {
        db.getUserByEmail(req.body.email)
            .then(user => {
                if (user.rows.length < 1) {
                    console.log('mail already in db', user.rows.length);
                    db.postUser(req.body.first, req.body.last, req.body.email, req.body.pass)
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
    console.log(req.session.isLoggedIn);
    if (req.session.isLoggedIn) {
        res.redirect('/sign/')
    }
    res.render('login', {
        layout: 'petitionAll'
    })
})
app.post('/login/', (req, res) => {
    if (req.body.email && req.body.pass) {
        db.getUserDataJoin(req.body.email)
            .then(user => {
                if (user.rows.length > 0) {
                    db.checkUser(req.body.pass, user.rows[0].password)
                        .then(passValid => {
                            if (passValid) {
                                req.session.isLoggedIn = {
                                    id: user.rows[0].id_user,
                                    first: user.rows[0].first_name,
                                    last: user.rows[0].last_name,
                                    hasProf: user.rows[0].id_profile,
                                    hasSigned: user.rows[0].id_sig
                                };
                                console.log('user login:', req.session.isLoggedIn);
                                if (!req.session.isLoggedIn.hasProf) {
                                    res.redirect('/profile/')
                                } else {
                                    res.redirect('/sign/')
                                }
                            } else {
                                res.render('login', {
                                    layout: 'petitionAll',
                                    msg: 'no such user or password'
                                })
                            }
                        })
                        .catch(err => console.log('db sign q err', err))
                } else {
                    res.render('login', {
                        layout: 'petitionAll',
                        msg: 'no such user'
                    })
                }
            })
        ///////////////////////////////////////////////////////////// old login////////////////////////////////////////////////
        // db.getUserByEmail(req.body.email)
        //     .then(user => {
        //         if (user.rows.length) {
        //             console.log('login',user.rows);
        //             db.checkUser(req.body.pass, user.rows[0].password)
        //                 .then(passValid => {
        //                     if (passValid) {
        //                         req.session.isLoggedIn = {
        //                             id: user.rows[0].id_user,
        //                             first: user.rows[0].first_name,
        //                             last: user.rows[0].last_name
        //                         };
        //                         db.getSignature(req.session.isLoggedIn.id)
        //                             .then(sig => {
        //                                 if (sig.rows.length > 0) {
        //                                     req.session.hasSigned = true;
        //                                 }
        //                                 res.redirect('/profile/')    ///////////////////CHANGE AND CHECK IF PROFILED!!!!
        //                             })
        //                             .catch(err => console.log('db sign q err', err))
        //                     } else {
        //                         res.render('login', {
        //                             layout: 'petitionAll',
        //                             msg: 'user and password do not match'
        //                         })
        //                     }
        //                 })
        //                 .catch(err => console.log('error comparing password:', err))
        //         } else {
        //             res.render('login', {
        //                 layout: 'petitionAll',
        //                 msg: 'no such user / password'
        //             })
        //         }
        //     })
        /////////////////////////////////////////old login end //////////////////////////////////////////////////
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

app.get('/profile/', guard, (req, res) => {
    if (req.session.isLoggedIn.hasProf === null) {
        res.render('profile', {
            layout: 'petitionAll'
        })
    } else {
        res.redirect('/sign/')
    }
})
app.post('/profile/', (req, res) => {
    db.postProfile(req.body.city, req.body.age, req.body.userUrl, req.session.isLoggedIn.id)
        .then(profile => {
            console.log(profile.rows);
            req.session.isLoggedIn.hasProf = profile.rows[0].id_profile;
            res.redirect('/sign/')
        })
        .catch(err => console.log('prob creating user profile:', err))
})

app.get('/sign/', guard, (req, res) => {
    if(!req.session.isLoggedIn.hasSigned) {
        res.render('sign', {
            layout: 'petitionAll',
            user: req.session.isLoggedIn
        })
    } else {
        res.redirect('/signed/')
    }
})
app.post('/sign/', guard, (req, res) => {
    if (req.body.signature) {
        console.log(req.session.isLoggedIn);
        db.postSignature(req.body.signature, req.session.isLoggedIn.id)
            .then((data) => {
                //console.log(req.session.isLoggedIn);
                console.log('new db insert, id:', data.rows[0].id_sig);
                req.session.isLoggedIn.hasSigned = data.rows[0].id_sig;
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

app.get('/signed/', guard, (req, res) => {
    if (req.session.isLoggedIn.hasSigned) {
        db.getSignature(req.session.isLoggedIn.id)
        .then((data) => {
            res.render('signed', {
                layout:'petitionAll',
                userSig: data.rows[0].signature,
                user: req.session.isLoggedIn
            })
        }).catch(err => console.log('failed to get sig of db:', err))

    } else {
        res.redirect('/sign/')
    }
})

app.get('/signers/', guard, (req, res) => {
    if (req.session.isLoggedIn.hasSigned) {
        db.getSignatureJoinAll()
            .then(sigs => {
                //console.log(sigs.rows);
                res.render('signers', {
                    layout: 'petitionAll',
                    name: sigs.rows
                })
            })
        // db.getSignatureAll()
        //     .then((sigs) => {
        //         console.log('all sigs', sigs.rows[0].id_user_fkey);
        //         let signees = sigs.rows.map(el => db.getUserById(el.id_user_fkey));
        //         console.log(signees);
        //         Promise.all(signees)
        //             .then(sigUsers => {
        //                 //console.log('promis result:', sigUsers.rows);
        //                 let signeeNames = sigUsers.map(el => el.rows).map(el => ({firstName: el[0].first_name, lastName: el[0].last_name}))
        //                 console.log('mapped rows', signeeNames);
        //                 res.render('signers', {
        //                     layout:'petitionAll',
        //                     name: signeeNames,
        //                 })
        //             })
        //             .catch(err => console.log('promise all, get sigUser failed:', err))
        //
        // })
            .catch(err => console.log('could not load signed useres:', err))

    } else {
        res.redirect('/sign/')
    }
})
app.get('/signers/:city', guard, (req, res) => {
    if (req.session.isLoggedIn.hasSigned) {
        db.getSigCityJoin(req.params.city)
            .then(sigs => {
                //console.log(sigs.rows);
                res.render('signers', {
                    layout: 'petitionAll',
                    name: sigs.rows
                })
            })
            .catch(err => console.log('could not load signed useres:', err))

    } else {
        res.redirect('/sign/')
    }
})

app.get('/logout/', (req, res) => {
    req.session = null;
    res.redirect('/login/')
})

app.get('/wrong/', (req, res) => {
    res.status(403).render('wrong', {
        layout: 'petitionAll'
    });
})

app.get('*', (req, res) => {
    res.status(404).render('404', {
        layout: 'petitionAll'
    });
})


app.listen(8080, () => console.log('server listening..'))
