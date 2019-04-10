const express = require('express');
const signRouter = express.Router();
const { guard, notSigned, hasSigned } = require('../middleware');
const db = require('../utility/db');

signRouter.get('/sign/', guard, notSigned, (req, res) => {
    res.render('sign', {
        layout: 'petitionAll',
        user: req.session.isLoggedIn
    })
})
signRouter.post('/sign/', guard, (req, res) => {
    if (req.body.signature) {
        db.postSignature(req.body.signature, req.session.isLoggedIn.id)
            .then((data) => {
                console.log('new db insert, id:', data.rows[0].id_sig);
                req.session.isLoggedIn.hasSigned = data.rows[0].id_sig;
                res.redirect('/signed/')
            })
            .catch((err) => {
                console.log('dc signature insert err:', err);
                res.status(500).render('wrong', {
                    layout: 'petitionAll',
                    msg: 'could  not write to database. maybe try again later..'
                });
            });
    } else {
        res.status(403).render('wrong', {
            layout: 'petitionAll',
            msg: 'maybe you forgot something.'
        });
    }
})

signRouter.get('/signed/', guard, hasSigned, (req, res) => {
    db.getSignature(req.session.isLoggedIn.id)
    .then((sigs) => {
        if (sigs.rows.length > 0) {
            sigDate = new Date(sigs.rows[0].created_at);
            sigs.rows[0].created_at = `signed ${sigDate.getMonth()} / ${sigDate.getDate()} / ${sigDate.getFullYear()} at ${sigDate.getHours()}:${sigDate.getMinutes()}`;
        }
        res.render('signed', {
            layout:'petitionAll',
            userSig: sigs.rows[0],
            user: req.session.isLoggedIn
        })
    }).catch(err => {
        console.log('failed to get sig of db:', err);
        res.status(500).render('wrong', {
            layout: 'petitionAll',
            msg: 'could not load signature. maybe try again later..'
        });
    })
})

signRouter.get('/signers/', guard, hasSigned, (req, res) => {
    db.getSignatureJoinAll()
        .then(sigs => {
            if (sigs.rows.length > 0) {
                sigs.rows.forEach(el => {
                    sigDate = new Date(el.created_at);
                    el.created_at = `signed ${sigDate.getMonth()} / ${sigDate.getDate()} / ${sigDate.getFullYear()}`;
                })
            }
            res.render('signers', {
                layout: 'petitionAll',
                name: sigs.rows
            })
        })
        .catch(err => {
            console.log('could not load signed useres:', err);
            res.status(500).render('wrong', {
                layout: 'petitionAll',
                msg: 'could not load signers. maybe try again later..'
            });
        })
})
signRouter.get('/signers/:city', guard, hasSigned, (req, res) => {
    db.getSigCityJoin(req.params.city)
        .then(sigs => {
            if (sigs.rows.length > 0) {
                var city = sigs.rows[0].city.toUpperCase();
                sigs.rows.forEach(el => {
                    delete el.city;
                    let sigDate = new Date(el.created_at);
                    el.created_at = `signed ${sigDate.getMonth()} / ${sigDate.getDate()} / ${sigDate.getFullYear()}`;
                    return el;
                })
            }
            res.render('signers', {
                layout: 'petitionAll',
                name: sigs.rows,
                aggregCity: city
            })
        })
        .catch(err => {
            console.log('could not load signed useres:', err);
            res.status(500).render('wrong', {
                layout: 'petitionAll',
                msg: 'could not load signers. maybe try again later..'
            });
        })
})

module.exports = signRouter
