const express = require('express');
const delRouter = express.Router();
const { guard, delGuard } = require('../middleware');
const db = require('../utility/db');
let accountDelete = false;

delRouter.post('/delete/', guard, (req, res) => {
    console.log(req.body);
    if (req.body.delete === 'signature') {
        db.deleteRow('signatures', 'id_user_fkey', req.session.isLoggedIn.id)
            .then(deleted => {
                console.log('sig deleted:', deleted);
                req.session.isLoggedIn.hasSigned = null;
                res.redirect('/sign/')
            })
            .catch(err => {
                console.log('error deleting sig:', err);
                res.status(500).render('wrong', {
                    layout: 'petitionAll',
                    msg: 'could not delete signature. maybe try again later..'
                });
            })
    } else {
        accountDelete = true;
        res.render('delete', {
            layout: 'petitionAll'
        })
    }
})

delRouter.post('/delete-account/', guard, delGuard, (req, res) => {
    db.deleteRow('users', 'id_user', req.session.isLoggedIn.id)
        .then(deleted => {
            console.log('sig deleted:', deleted);
            accountDelete = false;
            res.redirect('/logout/')
        })
})


module.exports = delRouter
