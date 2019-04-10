const express = require('express');
const hb = require('express-handlebars');
const bodyParser = require('body-parser');
const cs = require('cookie-session');
const csurf = require('csurf');
const { csrfT } = require('./middleware');
const authRouter = require('./routers/auth');
const profRouter = require('./routers/profile');
const signRouter = require('./routers/sign');
const delRouter = require('./routers/delete');

app = express();
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use(cs({ maxAge: 1000 * 60 * 60 * 24 * 14, secret: process.env.SESSION_SECRET || require('./.secret.json').cookieS }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(csurf());
app.use(csrfT);
app.use(express.static(__dirname + '/public/'))

app.get('/', (req, res) => {
    console.log('user:', req.session.isLoggedIn);
    req.session.isLoggedIn ? res.redirect('/sign/') :res.redirect('/register/')
})

app.use(authRouter)
app.use(profRouter)
app.use(signRouter)
app.use(delRouter)


app.get('/logout/', (req, res) => {
    req.session = null;
    res.redirect('/login/')
})

app.get('*', (req, res) => {
    res.status(404).render('404', {
        layout: 'petitionAll'
    });
})

app.listen(process.env.PORT || 8080);
