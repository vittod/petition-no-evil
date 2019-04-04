const express = require('express');
const hb = require('express-handlebars');
const {addSignature, findSignature, allSignatures} = require('./db');
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


app.get('/', (req, res) => res.redirect('/petition/'))

app.get('/petition/', (req, res) => {
    if(!req.session.hasSigned) { //////////////// turn back to !
        res.render('sign', {
            layout: 'petitionAll'
        })
    } else {
        res.redirect('/signed/')
    }
})

app.post('/petition/', (req, res) => {
    if (req.body.first && req.body.last && req.body.signature) {
        addSignature(req.body.first, req.body.last, req.body.signature)
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
        findSignature(req.session.hasSigned).then((data) => {
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
        allSignatures()
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

app.use(express.static(__dirname + '/public/'))

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
