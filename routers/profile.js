const express = require('express')
const profRouter = express.Router()
const { guard } = require('../middleware')
const redis = require('../redis')
const db = require('../utility/db')
const uif = require('../utility/userInputFormatter')

profRouter.get('/profile/', guard, (req, res) => {
    if (req.session.isLoggedIn.hasProf === null) {
        res.render('profile', {
            layout: 'petitionAll'
        })
    } else {
        res.redirect('/sign/')
    }
})
profRouter.post('/profile/', guard, (req, res) => {
    if (req.body.city) {
        req.session.isLoggedIn.city = uif.sanitizer(req.body.city)
    }
    db.postProfile(req.body.city, req.body.age, req.body.userUrl, req.session.isLoggedIn.id)
        .then(profile => {
            console.log(profile.rows);
            req.session.isLoggedIn.hasProf = profile.rows[0].id_profile;
            res.redirect('/sign/')
        })
        .catch(err => {
            console.log('prob creating user profile:', err);
            res.redirect('/sign/')
        })
})

profRouter.get('/edit-profile/:message?*', guard, (req, res) => {
    if (req.session.isLoggedIn.hasProf) {
        db.getProfileById(req.session.isLoggedIn.id)
            .then(profile => {
                switch (req.params.message) {
                    case 'p': var message = 'passwords do not match!'; break;
                    case 'e': var message = 'email is not valid!';
                }
                res.render('profile-edit', {
                    layout: 'petitionAll',
                    userProfile: {
                        first: req.session.isLoggedIn.first,
                        last: req.session.isLoggedIn.last,
                        email: req.session.isLoggedIn.email,
                        city: profile.rows[0].city,
                        age: profile.rows[0].age === 0 ? '' : profile.rows[0].age,
                        url: profile.rows[0].url
                    },
                    msg: message
                })
            })
            .catch(err => {
                console.log('could not get profile:', err);
                res.status(500).render('wrong', {
                    layout: 'petitionAll',
                    msg: 'could not profile. maybe try again later..'
                });
            })
    } else {
        switch (req.params.message) {
            case 'p': var message = 'passwords do not match!'; break;
            case 'e': var message = 'email is not valid!';
        }
        res.render('profile-edit', {
            layout: 'petitionAll',
            userProfile: {
                first: req.session.isLoggedIn.first,
                last: req.session.isLoggedIn.last,
                email: req.session.isLoggedIn.email
            },
            msg: message
        })
    }
})
profRouter.post('/edit-profile/', guard, (req, res) => {
    if (req.body.pass === req.body.passRep) {
        if (uif.mailValid(req.body.email) && uif.escComp(req.body.email)) {
            if (req.session.isLoggedIn.city) {
                if (req.session.isLoggedIn.city.toUpperCase() != uif.sanitizer(req.body.city).toUpperCase()) {
                    redis.del('city' + req.session.isLoggedIn.city.toUpperCase())
                    .then(delSigCities => console.log('depricated city data deleted:', req.session.isLoggedIn.city))
                    .catch(err => new Error('prob with redis:', err))
                }
            }
            redis.del('allSigs')
                .then(delSigs => console.log('depricated data deleted:', delsSigs))
                .catch(err => new Error('prob with redis:', err))
            let newProfileData = [
                req.session.isLoggedIn.id,
                req.body.first,
                req.body.last,
                req.body.email,
                req.body.age,
                req.body.city,
                req.body.userUrl
            ];
            console.log('server:', ...newProfileData);
            if (req.body.pass != '') {
                newProfileData.push(req.body.pass)
            }
            db.updateProfile(...newProfileData)
            .then(update => {
                console.log('update success:', update);
                req.session.isLoggedIn.first = uif.sanitizer(req.body.first);
                req.session.isLoggedIn.last = uif.sanitizer(req.body.last);
                req.session.isLoggedIn.email = req.body.email;
                req.session.isLoggedIn.city = uif.sanitizer(req.body.city)
                res.redirect('/sign/');
            })
            .catch(err => {
                console.log('error updating profile:', err);
                res.status(500).render('wrong', {
                    layout: 'petitionAll',
                    msg: 'could update profile. maybe try again later..'
                });
            })
        } else {
            res.redirect('/edit-profile/e/')
        }
    } else {
        res.redirect('/edit-profile/p/')
    }
})

module.exports = profRouter
