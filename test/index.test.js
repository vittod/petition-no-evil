const supertest = require('supertest');
const {app} = require('../index.js');
const cs = require('cookie-session')
const csurf = require('csurf')
const db = require('db')   //for testing sign router has to require db from __mock__


test('GET / working' , () => {
    return supertest(app)
        .get('/login')
        .expect(200)
})

// 1
test('GET/sign - logged out redirect to register' , () => {
    cs.mockSessionOnce({})

    return supertest(app)
        .get('/sign').expect(302)
        .then(res => {
            console.log('test res:', res.text);
            expect(res.text).toContain('Redirecting' && '/register/');
            expect(res.headers.location).toContain('register')
        })
})

// 2
test('GET/login - logged in redirect to sign' , () => {
    cs.mockSessionOnce({
        isLoggedIn: { id: 4,
            first: 'azerimuth',
            last: 'bandistano',
            email: 'azze@band.star',
            hasProf: 3,
            hasSigned: 22 }
        })

    return supertest(app)
        .get('/login').expect(302)
        .then(res => {
            console.log('test res:', res.text);
            expect(res.text).toContain('Redirecting' && '/sign/');
            expect(res.headers.location).toContain('sign')
        })
})

// 3
test('GET/register - logged in redirect to sign' , () => {
    cs.mockSessionOnce({
        isLoggedIn: { id: 4,
            first: 'azerimuth',
            last: 'bandistano',
            email: 'azze@band.star',
            hasProf: 3,
            hasSigned: 22 }
        })

    return supertest(app)
        .get('/register').expect(302)
        .then(res => {
            console.log('test res:', res.text);
            expect(res.text).toContain('Redirecting' && '/sign/');
            expect(res.headers.location).toContain('sign')
        })
})

// 4
test('GET/sign - signed redirect to signed' , () => {
    cs.mockSessionOnce({
        isLoggedIn: { id: 4,
            first: 'azerimuth',
            last: 'bandistano',
            email: 'azze@band.star',
            hasProf: 3,
            hasSigned: 22 }
        })

    return supertest(app)
        .get('/sign').expect(302)
        .then(res => {
            console.log('test res:', res.text);
            expect(res.text).toContain('Redirecting' && '/signed/');
            expect(res.headers.location).toContain('signed')
        })
})

// 5
test('POST/sign - signed redirect to signed' , () => {
    cs.mockSessionOnce({
        isLoggedIn: { id: 4,
            first: 'azerimuth',
            last: 'bandistano',
            email: 'azze@band.star',
            hasProf: 3,
            hasSigned: 22 }
        })

    return supertest(app)
        .post('/sign').expect(302)
        .then(res => {
            console.log('test res:', res.text);
            expect(res.text).toContain('Redirecting' && '/signed/');
            expect(res.headers.location).toContain('signed')
        })
})

// 6
test('GET/signed - unsigned redirect to sign' , () => {
    cs.mockSessionOnce({
        isLoggedIn: { id: 4,
            first: 'azerimuth',
            last: 'bandistano',
            email: 'azze@band.star',
            hasProf: 3,
            hasSigned: null }
        })

    return supertest(app)
        .get('/signed').expect(302)
        .then(res => {
            console.log('test res:', res.text);
            expect(res.text).toContain('Redirecting' && '/sign/');
            expect(res.headers.location).toContain('sign')
        })
})

// 7
test('GET/signers - unsigned redirect to sign' , () => {
    cs.mockSessionOnce({
        isLoggedIn: { id: 4,
            first: 'azerimuth',
            last: 'bandistano',
            email: 'azze@band.star',
            hasProf: 3,
            hasSigned: null }
        })

    return supertest(app)
        .get('/signers').expect(302)
        .then(res => {
            console.log('test res:', res.text);
            expect(res.text).toContain('Redirecting' && '/sign/');
            expect(res.headers.location).toContain('sign')
        })
})

// 8
test('POST/sign - body is good' , () => {
    cs.mockSessionOnce({
        isLoggedIn: { id: 4,
            first: 'azerimuth',
            last: 'bandistano',
            email: 'azze@band.star',
            hasProf: null,
            hasSigned: null }
        });

    return supertest(app)
        .post('/sign/')
        .type('form')
        .send({signature: 'XXXXXXX'})
        .expect(302)
        .then(res => {
            console.log('test res:', res.text);
            expect(res.text).toContain('Redirecting' && '/signed/');
            expect(res.headers.location).toContain('signed')
        })
})

// 9
test('POST/sign - body is bad' , () => {
    cs.mockSessionOnce({
        isLoggedIn: { id: 1,
            first: 'azerimuth',
            last: 'bandistano',
            email: 'azze@band.star',
            hasProf: null,
            hasSigned: null }
        });

    return supertest(app)
        .post('/sign/')
        .type('form')
        .send({})
        .expect(403)
        .then(res => {
            console.log('test res:', res.error);
            expect(res.text).toContain('<h1>Something is wrong.. maybe you forgot something.</h1>');
        })
})

// 10
test('POST/sign - user exists' , () => {
    cs.mockSessionOnce({
        isLoggedIn: { id: 10,
            first: 'azerimuth',
            last: 'bandistano',
            email: 'azze@band.star',
            hasProf: null,
            hasSigned: null }
        });

    return supertest(app)
        .post('/sign/')
        .type('form')
        .send({signature: 'XXXXXXX'})
        .expect(500)
        .then(res => {
            console.log('test res:', res.error);
            expect(res.text).toContain('<h1>Something is wrong.. could  not write to database. maybe try again later..</h1>');
        })
})
