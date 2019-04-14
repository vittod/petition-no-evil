const express = require('express')
const signRouter = express.Router()
const redis = require('../redis')
const { guard, notSigned, hasSigned } = require('../middleware')
const { db } = require('../index')
const { formatSigs } = require('../utility/dbformatter')

// const db = require('../__mocks__/db');  ////// for testing change to this module

signRouter.get('/sign/', guard, notSigned, (req, res) => {
    res.render('sign', {
        layout: 'petitionAll',
        user: req.session.isLoggedIn
    })
})
signRouter.post('/sign/', guard, notSigned, (req, res) => {
    if (req.body.signature) {
        redis.del('allSigs')
            .then(delSigs => console.log('depricated data deleted:', delsSigs))
            .catch(err => new Error('prob with redis:', err))
        if (req.session.isLoggedIn.city) {
            redis.del('city' + req.session.isLoggedIn.city.toUpperCase())
                .then(delSigCities => console.log('depricated city data deleted:', req.session.isLoggedIn.city))
                .catch(err => new Error('prob with redis:', err))
        }
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
            sigs.rows[0].created_at = `signed ${sigDate.getMonth()}/${sigDate.getDate()}/${sigDate.getFullYear()} at ${sigDate.getHours()}:${sigDate.getMinutes()}`;
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
    redis.get('allSigs')
        .then(allSigs => {
            console.log('got from redis signers:', allSigs);
            if (allSigs){
                res.render('signers', {
                    layout: 'petitionAll',
                    name: JSON.parse(allSigs)
                })
            } else {
                db.getSignatureJoinAll()
                .then(sigs => {
                    if (sigs.rows.length > 0) {
                        sigs.rows = formatSigs(sigs.rows)
                    }
                    redis.setex('allSigs', 120, JSON.stringify(sigs.rows))
                        .then(sigsSet => console.log('put in redis signers:', sigsSet))
                        .catch(err => new Error('prob with redis:', err))
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
            }
        })
        .catch(err => new Error('prob with redis:', err))
})
signRouter.get('/signers/:city', guard, hasSigned, (req, res) => {
    redis.get('city' + req.params.city.toUpperCase())
        .then(myCity => {
            console.log('got from redis city sigs:', myCity);
            if (myCity) {
                res.render('signers', {
                    layout: 'petitionAll',
                    name: JSON.parse(myCity),
                    aggregCity: req.params.city.toUpperCase()
                })
            } else {
                db.getSigCityJoin(req.params.city)
                .then(sigs => {
                    if (sigs.rows.length > 0) {
                        var city = sigs.rows[0].city.toUpperCase();
                        sigs.rows = formatSigs(sigs.rows, true);
                        redis.setex('city' + city.toUpperCase(), 120, JSON.stringify(sigs.rows))
                        .then(sigsSet => console.log('put in redis city sigs:', sigsSet))
                        .catch(err => new Error('prob with redis:', err))
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
            }
        })
        .catch(err => new Error('prob with redis:', err))
})

module.exports = signRouter
