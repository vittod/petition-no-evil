const express = require('express');
const authRouter = express.Router();
const db = require('../utility/db');

authRouter.get('/register/', (req, res) => {
    res.render('register', {
        layout: 'petitionLogin'
    })
})
authRouter.post('/register/', (req, res) => {
    if (req.body.first && req.body.last && req.body.email && req.body.pass) {
        db.getUserByEmail(req.body.email)
            .then(user => {
                if (user.rows.length < 1) {
                    db.postUser(req.body.first, req.body.last, req.body.email, req.body.pass)
                        .then(nuUser => {
                            console.log('new user created:', nuUser.rows);
                            res.redirect('/login/')
                        })
                        .catch(err => {
                            console.log('not able to create user:', err);
                            res.status(500).render('wrong', {
                                layout: 'petitionLogin',
                                msg: 'please try again later.'
                            });
                        })
                } else {
                    console.log('mail already in db', user.rows.length);
                    res.render('register', {
                        layout: 'petitionLogin',
                        msg: 'email already registered'
                    })
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).render('wrong', {
                    layout: 'petitionLogin',
                    msg: 'please try again later.'
                });
            })
    } else {
        res.render('register', {
            layout: 'petitionLogin',
            msg: 'all fields are required'
        })
    }
})

authRouter.get('/login/', (req, res) => {
    console.log(req.session.isLoggedIn);
    if (req.session.isLoggedIn) {
        res.redirect('/sign/')
    }
    res.render('login', {
        layout: 'petitionLogin'
    })
})
authRouter.post('/login/', (req, res) => {
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
                                    email: user.rows[0].email,
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
                                    layout: 'petitionLogin',
                                    msg: 'no such user or password'
                                })
                            }
                        })
                        .catch(err => {
                            console.log('db sign q err', err);
                            res.status(500).render('wrong', {
                                layout: 'petitionLogin',
                                msg: 'please try again later.'
                            });
                        })
                } else {
                    res.render('login', {
                        layout: 'petitionLogin',
                        msg: 'no such user'
                    })
                }
            })
            .catch(err => {
                console.log('get user err:', err);
                res.status(500).render('wrong', {
                    layout: 'petitionLogin',
                    msg: 'please try again later.'
                });
            })
    } else {
        res.render('login', {
            layout: 'petitionLogin',
            msg: 'all fields are required'
        })
    }
})

module.exports = authRouter
