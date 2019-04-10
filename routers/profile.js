const express = require('express');
const profRouter = express.Router();
const { guard } = require('../middleware');
const db = require('../utility/db');

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
                if (req.params.message === 'p') {
                    var message = 'passwords do not match!'
                }
                res.render('profile-edit', {
                    layout: 'petitionAll',
                    userProfile: {
                        first: req.session.isLoggedIn.first,
                        last: req.session.isLoggedIn.last,
                        email: req.session.isLoggedIn.email,
                        city: profile.rows[0].city,
                        age: profile.rows[0].age,
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
        res.render('profile-edit', {
            layout: 'petitionAll',
            profile: {
                first: req.session.isLoggedIn.first,
                last: req.session.isLoggedIn.last,
                email: req.session.isLoggedIn.email
            },
            msg: req.params.message
        })
    }
})
profRouter.post('/edit-profile/', guard, (req, res) => {
    if (req.body.pass === req.body.passRep) {
        let newProfileData = [
            req.session.isLoggedIn.id,
            req.body.first,
            req.body.last,
            req.body.email,
            parseInt(req.body.age),
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
            req.session.isLoggedIn.first = req.body.first;
            req.session.isLoggedIn.last = req.body.last;
            req.session.isLoggedIn.email = req.body.email;
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
        res.redirect('/edit-profile/p/')
    }
})

module.exports = profRouter
