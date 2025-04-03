const supertest = require('/supertest');
const app = require("../app.js");
const mongoose = require('mongoose');

beforeAll(async () => {
 await new Promise((resolve) => mongoose.connection.once('connected', resolve));
});
const api = supertest(app);
it('should get all users', async () => {
 await api.get('/api/users')
 .expect(200)
 .expect('Content-Type', /application\/json/)
})
afterAll(async()=> {
 server.close()
 await mongoose.connection.close();
})