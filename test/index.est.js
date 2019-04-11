const supertest = require('supertest');
const {app} = require('../index.js');


test('GET / working' , () => {
    return supertest(app)
        .get('/login')
        .expect(200)
})
